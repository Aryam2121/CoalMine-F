import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/axios';
import Button from '../ui/Button';
import { useSocketContext } from '../../context/SocketContext';

const EvacuationMusterBanner = () => {
  const { socket, emergency, activeEvacuation, setActiveEvacuation } = useSocketContext();
  const [reporting, setReporting] = useState(false);

  const loadActiveEvacuation = useCallback(async () => {
    try {
      const res = await api.get('/emergencies/active');
      const list = res.data?.emergencies || [];
      const evac = list.find((e) => e.evacuationStatus?.initiated && !e.evacuationStatus?.completedAt);
      setActiveEvacuation(evac || null);
    } catch {
      setActiveEvacuation(null);
    }
  }, [setActiveEvacuation]);

  useEffect(() => {
    loadActiveEvacuation();
  }, [loadActiveEvacuation, emergency]);

  useEffect(() => {
    if (!socket) return undefined;
    const refresh = () => loadActiveEvacuation();
    socket.on('evacuation:initiated', refresh);
    socket.on('evacuation:completed', refresh);
    socket.on('muster:updated', refresh);
    return () => {
      socket.off('evacuation:initiated', refresh);
      socket.off('evacuation:completed', refresh);
      socket.off('muster:updated', refresh);
    };
  }, [socket, loadActiveEvacuation]);

  const evac = activeEvacuation;
  if (!evac?._id) return null;

  const roll = evac.evacuationStatus?.musterRoll || [];
  const missing = roll.filter((r) => r.status === 'missing' || r.status === 'unknown').length;

  const reportSafe = async () => {
    setReporting(true);
    try {
      await api.post(`/emergency/${evac._id}/muster/safe`, { musterPoint: 'Muster Point A' });
      toast.success('Marked safe at muster point');
      loadActiveEvacuation();
    } catch {
      toast.error('Could not report muster status');
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] border-t-2 border-red-500 bg-red-950/95 px-4 py-3 shadow-2xl md:left-64">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold text-red-300 uppercase tracking-wide text-sm">⚠️ Evacuation in progress</p>
          <p className="text-xs text-red-200/80">
            {evac.emergencyId} · {missing > 0 ? `${missing} personnel unaccounted` : 'Proceed to muster point'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="danger" size="sm" onClick={reportSafe} disabled={reporting}>
            {reporting ? 'Reporting…' : 'I am safe'}
          </Button>
          <Link to="/evacuation">
            <Button variant="secondary" size="sm">Evacuation center</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EvacuationMusterBanner;
