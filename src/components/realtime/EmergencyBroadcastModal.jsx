import { Link } from 'react-router-dom';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useSocketContext } from '../../context/SocketContext';

const EmergencyBroadcastModal = () => {
  const { emergency, dismissEmergency } = useSocketContext();
  if (!emergency) return null;

  const e = emergency.emergency || emergency;
  const type = e.emergencyType || e.type || 'Emergency';
  const severity = e.severity || 'critical';
  const description = e.description || 'An emergency has been reported.';

  return (
    <Modal open size="lg" onClose={dismissEmergency} title="">
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 animate-pulse">
          <span className="text-3xl">🚨</span>
        </div>
        <h2 className="text-2xl font-bold text-red-500 uppercase tracking-wide">Emergency Broadcast</h2>
        <p className="text-lg font-semibold text-slate-800 dark:text-white capitalize">
          {String(type).replace(/_/g, ' ')} — {severity}
        </p>
        <p className="text-slate-600 dark:text-slate-300">{description}</p>
        {e.location?.area && (
          <p className="text-sm text-slate-500">Location: {e.location.area}{e.location.level ? ` · ${e.location.level}` : ''}</p>
        )}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link to="/emergency">
            <Button variant="danger">Open Emergency Center</Button>
          </Link>
          {(e.evacuationStatus?.initiated || e.evacuationStatus === true) && (
            <Link to="/evacuation">
              <Button variant="primary">Evacuation / Muster</Button>
            </Link>
          )}
          <Button variant="secondary" onClick={dismissEmergency}>Acknowledge</Button>
        </div>
      </div>
    </Modal>
  );
};

export default EmergencyBroadcastModal;
