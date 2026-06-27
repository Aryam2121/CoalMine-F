import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import api from '../../services/axios';
import { useSocketContext } from '../../context/SocketContext';

const SNOOZE_KEY = 'shiftGateSnoozedUntil';

const ShiftGateModal = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { connected } = useSocketContext();

  const checkStatus = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setOpen(false);
      setLoading(false);
      return;
    }

    const snoozedUntil = Number(sessionStorage.getItem(SNOOZE_KEY) || 0);
    if (snoozedUntil > Date.now()) {
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/safety-check/status');
      setOpen(!res.data?.completed);
    } catch {
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus, location.pathname]);

  useEffect(() => {
    const onCompleted = () => {
      setOpen(false);
      sessionStorage.removeItem(SNOOZE_KEY);
    };
    window.addEventListener('safety-check-completed', onCompleted);
    return () => window.removeEventListener('safety-check-completed', onCompleted);
  }, []);

  const snooze = () => {
    sessionStorage.setItem(SNOOZE_KEY, String(Date.now() + 60 * 60 * 1000));
    setOpen(false);
  };

  if (loading || !open) return null;

  return (
    <Modal open closable={false} title="Shift safety check required" size="md">
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300">
          You must complete the digital safety check-in before starting your shift. This includes GPS verification,
          checklist confirmation, photo evidence, and your digital signature.
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className={`inline-block h-2 w-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {connected ? 'Live connection active' : 'Reconnecting… — check-in will sync when online'}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" type="button" onClick={snooze}>
            Remind me later
          </Button>
          <Button variant="primary" type="button" onClick={() => navigate('/safety-check-in')}>
            Complete check-in
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ShiftGateModal;
