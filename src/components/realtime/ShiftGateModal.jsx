import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import api from '../../services/axios';
import { useSocketContext } from '../../context/SocketContext';

const ShiftGateModal = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { connected } = useSocketContext();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/safety-check/status')
      .then((res) => {
        if (!res.data?.completed) setOpen(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !open) return null;

  return (
    <Modal open onClose={() => {}} title="Shift safety check required">
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300">
          You must complete the digital safety check-in before starting your shift. This includes GPS verification,
          checklist confirmation, photo evidence, and your digital signature.
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className={`inline-block h-2 w-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {connected ? 'Live connection active' : 'Reconnecting… — check-in will sync when online'}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="primary" onClick={() => navigate('/safety-check-in')}>
            Complete check-in
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ShiftGateModal;
