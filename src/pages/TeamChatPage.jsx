import { useEffect, useRef, useState, useContext, useCallback } from 'react';
import { Send } from 'lucide-react';
import PageShell from '../components/ui/PageShell';
import Button from '../components/ui/Button';
import LoadingBlock from '../components/ui/LoadingBlock';
import api from '../services/axios';
import { useSocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';

const CHANNELS = [
  { id: 'shift', label: 'Shift handover', icon: '🔄' },
  { id: 'safety', label: 'Safety', icon: '🛡️' },
  { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
];

const TeamChatPage = () => {
  const { user } = useContext(AuthContext);
  const { activeMineId, setActiveMineId, mines, connected, socket, sendChat } = useSocketContext();
  const [channel, setChannel] = useState('shift');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const loadHistory = useCallback(async () => {
    if (!activeMineId) return;
    setLoading(true);
    try {
      const { data } = await api.get('/chat/history', { params: { mineId: activeMineId, channel, limit: 80 } });
      setMessages(data.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [activeMineId, channel]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (!socket) return undefined;
    const onChat = (msg) => {
      if (msg.channel === channel) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on('chat:new', onChat);
    return () => socket.off('chat:new', onChat);
  }, [socket, channel]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (sendChat(text.trim(), channel)) {
      setMessages((prev) => [
        ...prev,
        {
          from: user?._id,
          userName: user?.name || 'You',
          message: text.trim(),
          channel,
          timestamp: new Date(),
        },
      ]);
      setText('');
    }
  };

  return (
    <PageShell
      title="Team Communication"
      subtitle="Real-time channels for shift, safety, and maintenance coordination"
      variant="dark"
      action={
        <div className="flex items-center gap-2">
          <span className={`text-xs ${connected ? 'text-emerald-400' : 'text-slate-500'}`}>{connected ? '● Connected' : '○ Offline'}</span>
          {mines.length > 1 && (
            <select className="input-field !w-auto !py-2 !bg-slate-800" value={activeMineId || ''} onChange={(e) => setActiveMineId(e.target.value)}>
              {mines.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          )}
        </div>
      }
    >
      <div className="flex gap-2 mb-4 flex-wrap">
        {CHANNELS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setChannel(c.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              channel === c.id ? 'bg-amber-500 text-mine-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900/50 flex flex-col h-[calc(100vh-18rem)]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <LoadingBlock />
          ) : messages.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No messages yet. Start the conversation.</p>
          ) : (
            messages.map((m, i) => {
              const isMe = String(m.from) === String(user?._id);
              return (
                <div key={m._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-xl px-4 py-2 ${isMe ? 'bg-amber-500/20 text-amber-100' : 'bg-slate-800 text-slate-200'}`}>
                    <p className="text-xs font-semibold opacity-70 mb-1">{m.userName || (isMe ? 'You' : 'Team member')}</p>
                    <p className="text-sm">{m.message}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={submit} className="border-t border-slate-700 p-3 flex gap-2">
          <input
            className="input-field flex-1 !bg-slate-800"
            placeholder={`Message #${channel}…`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!connected}
          />
          <Button type="submit" variant="primary" disabled={!connected || !text.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </PageShell>
  );
};

export default TeamChatPage;
