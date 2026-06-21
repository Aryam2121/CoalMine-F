import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import PageShell from '../components/ui/PageShell';
import Button from '../components/ui/Button';
import api from '../services/axios';
import { useSocketContext } from '../context/SocketContext';

const CHECKLIST = [
  'PPE inspected and worn correctly',
  'Gas detector calibrated and active',
  'Emergency exit routes confirmed',
  'Communication device tested',
  'Hazard area briefing completed',
  'Equipment pre-start inspection done',
];

const SafetyCheckInPage = () => {
  const { activeMineId, sendLocationUpdate } = useSocketContext();
  const [tasks, setTasks] = useState(CHECKLIST.map((name) => ({ taskName: name, completed: false })));
  const [gpsHistory, setGpsHistory] = useState([]);
  const [signature, setSignature] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  useEffect(() => {
    api.get('/safety-checks/me').then((res) => setHistory(res.data?.checks || [])).catch(() => {});
  }, []);

  const captureGPS = () => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          timestamp: new Date(),
        };
        setGpsHistory((prev) => [...prev, point]);
        sendLocationUpdate({ latitude: point.latitude, longitude: point.longitude, area: 'Check-in' });
        setLocLoading(false);
        toast.success('GPS captured');
      },
      () => {
        setLocLoading(false);
        toast.error('Could not get GPS location');
      },
      { enableHighAccuracy: true }
    );
  };

  const toggleTask = (idx) => {
    setTasks((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, completed: !t.completed, timestamp: new Date() } : t))
    );
  };

  const onFiles = (e) => setImages(Array.from(e.target.files || []));

  const startDraw = () => { drawing.current = true; };
  const endDraw = () => {
    drawing.current = false;
    if (canvasRef.current) setSignature(canvasRef.current.toDataURL());
  };
  const draw = (e) => {
    if (!drawing.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const clearSig = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.getContext('2d').clearRect(0, 0, c.width, c.height);
    setSignature('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!tasks.every((t) => t.completed)) {
      toast.error('Complete all checklist items');
      return;
    }
    if (!gpsHistory.length) {
      toast.error('Capture GPS location first');
      return;
    }
    if (!signature) {
      toast.error('Provide digital signature');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('tasks', JSON.stringify(tasks));
      fd.append('gpsHistory', JSON.stringify(gpsHistory));
      fd.append('signature', signature);
      if (activeMineId) fd.append('mineId', activeMineId);
      images.forEach((file) => fd.append('images', file));

      await api.post('/safety-check', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Safety check-in submitted — shift cleared');
      setHistory((prev) => [{ submittedAt: new Date(), tasks }, ...prev]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Digital Safety Check-In" subtitle="Mandatory pre-shift checklist with GPS, photos, and signature" variant="dark">
      <form onSubmit={submit} className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-700 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-white">Checklist</h3>
              <Button type="button" variant="secondary" onClick={captureGPS} disabled={locLoading}>
                {locLoading ? 'Capturing…' : 'Capture GPS'}
              </Button>
            </div>
            <ul className="space-y-2">
              {tasks.map((t, i) => (
                <li key={t.taskName}>
                  <label className="flex items-start gap-3 cursor-pointer text-sm text-slate-300">
                    <input type="checkbox" checked={t.completed} onChange={() => toggleTask(i)} className="mt-1" />
                    {t.taskName}
                  </label>
                </li>
              ))}
            </ul>
            {gpsHistory.length > 0 && (
              <p className="text-xs text-emerald-400 mt-3">
                GPS: {gpsHistory[gpsHistory.length - 1].latitude.toFixed(5)}, {gpsHistory[gpsHistory.length - 1].longitude.toFixed(5)}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-700 p-4">
            <h3 className="font-semibold text-white mb-2">Photo evidence</h3>
            <input type="file" accept="image/*" multiple onChange={onFiles} className="text-sm text-slate-400" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-700 p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-white">Digital signature</h3>
              <button type="button" className="text-xs text-slate-400" onClick={clearSig}>Clear</button>
            </div>
            <canvas
              ref={canvasRef}
              width={400}
              height={120}
              className="w-full bg-white rounded-lg cursor-crosshair touch-none"
              onMouseDown={startDraw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onMouseMove={draw}
            />
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit check-in & start shift'}
          </Button>

          {history.length > 0 && (
            <div className="rounded-xl border border-slate-700 p-4">
              <h3 className="font-semibold text-white mb-2">Recent check-ins</h3>
              <ul className="text-sm text-slate-400 space-y-1 max-h-32 overflow-y-auto">
                {history.slice(0, 5).map((h, i) => (
                  <li key={i}>{new Date(h.submittedAt).toLocaleString()} — {h.tasks?.filter((t) => t.completed).length}/{h.tasks?.length} items</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </form>
    </PageShell>
  );
};

export default SafetyCheckInPage;
