import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, Sparkles, Trash2, WifiOff, Cpu } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../services/axios';
import { getClientOfflineReply } from '../utils/mineSafetyKnowledge';
import PageShell from './ui/PageShell';
import Button from './ui/Button';
import { useSocketContext } from '../context/SocketContext';

const SUGGESTED_PROMPTS = [
  'What should I check during shift handover?',
  'Explain gas detection procedures underground',
  'How do I report a safety incident?',
  'List PPE requirements for coal face workers',
];

const OPS_PROMPTS = [
  'Summarize current open alerts and risks',
  'Which maintenance tasks are overdue?',
  'What is our current safety risk score?',
  'Generate a shift handover safety briefing',
];

const Chatbot = () => {
  const { activeMineId } = useSocketContext();
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState('en');
  const [opsMode, setOpsMode] = useState(true);
  const [liveContext, setLiveContext] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('offline'); // online | offline | error
  const [statusHint, setStatusHint] = useState('');
  const lastHintRef = useRef('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, loading]);

  const sendText = async (text) => {
    const userText = (text || message).trim();
    if (!userText) return;
    setMessage('');
    setLoading(true);
    setConversation((prev) => [...prev, { sender: 'user', text: userText }]);
    try {
      const endpoint = opsMode ? '/chat/operations' : '/chat';
      const { data } = await api.post(endpoint, {
        message: userText,
        language,
        mineId: activeMineId,
      });
      const reply = data.reply || 'No response received.';
      const isOffline = Boolean(data.offline);
      if (data.context) setLiveContext(data.context);
      setMode(isOffline ? 'offline' : 'online');
      if (!isOffline) lastHintRef.current = '';
      setStatusHint(
        isOffline
          ? data.hint ||
              (data.reason === 'quota_exceeded'
                ? 'Gemini free-tier limit reached. Built-in answers are shown until quota resets.'
                : '')
          : ''
      );
      setConversation((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: reply,
          offline: isOffline,
        },
      ]);
      if (data.hint && isOffline && data.hint !== lastHintRef.current) {
        lastHintRef.current = data.hint;
        toast.info(data.hint, { autoClose: 8000, toastId: 'gemini-status' });
      }
    } catch (err) {
      console.error('Chat API:', err);
      setMode('error');
      const fallback = getClientOfflineReply(userText);
      setConversation((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `**Could not reach the server.**\n\n${fallback}\n\nEnsure the backend is running (\`npm run dev\` in CoalMine-B).`,
          offline: true,
        },
      ]);
      toast.error('Chat server unavailable — showing basic help only');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setConversation([]);
    setMode('offline');
    setStatusHint('');
    toast.info('Conversation cleared');
  };

  return (
    <PageShell
      title="AI Operations Assistant"
      subtitle="Query live system data, generate reports, and surface risks"
      variant="dark"
    >
      <ToastContainer position="top-right" autoClose={4000} />

      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={() => setOpsMode(true)}
            className={`text-xs px-3 py-1.5 rounded-lg border ${opsMode ? 'border-amber-500 bg-amber-500/20 text-amber-200' : 'border-slate-700 text-slate-400'}`}
          >
            Live operations
          </button>
          <button
            type="button"
            onClick={() => setOpsMode(false)}
            className={`text-xs px-3 py-1.5 rounded-lg border ${!opsMode ? 'border-violet-500 bg-violet-500/20 text-violet-200' : 'border-slate-700 text-slate-400'}`}
          >
            Safety knowledge
          </button>
        </div>

        {opsMode && liveContext && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
            <div className="rounded-lg border border-slate-700 p-2"><span className="text-slate-500 block">Open alerts</span><strong className="text-amber-400">{liveContext.openAlerts}</strong></div>
            <div className="rounded-lg border border-slate-700 p-2"><span className="text-slate-500 block">Critical</span><strong className="text-red-400">{liveContext.criticalAlerts}</strong></div>
            <div className="rounded-lg border border-slate-700 p-2"><span className="text-slate-500 block">Overdue maint.</span><strong className="text-violet-400">{liveContext.overdueMaintenance}</strong></div>
            <div className="rounded-lg border border-slate-700 p-2"><span className="text-slate-500 block">Risk</span><strong className="text-emerald-400">{liveContext.riskLevel || '—'}</strong></div>
          </div>
        )}
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm ${
            mode === 'online'
              ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-200'
              : 'border-amber-500/30 bg-amber-950/30 text-amber-200'
          }`}
        >
          {mode === 'online' ? (
            <>
              <Cpu className="w-4 h-4 shrink-0" />
              <span>Connected to Google Gemini.</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 shrink-0" />
              <span>
                {statusHint ||
                  'Using built-in safety knowledge. Set GEMINI_API_KEY in CoalMine-B/.env (Google AI Studio — AIza or AQ. key) and restart the backend.'}
              </span>
            </>
          )}
        </div>

        <div className="ops-panel">
          <div className="ops-panel-body">
            <div className="flex flex-col min-h-[480px]">
              <div className="flex flex-wrap gap-2 mb-4 items-center justify-between">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input-field !w-auto !py-1.5 !text-sm"
                  disabled={loading}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="hi">Hindi</option>
                </select>
                {conversation.length > 0 && (
                  <button type="button" onClick={clearChat} className="btn-ghost !text-xs text-slate-400">
                    <Trash2 className="w-3 h-3 inline" /> Clear chat
                  </button>
                )}
              </div>

              {conversation.length === 0 && (
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Try asking:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(opsMode ? OPS_PROMPTS : SUGGESTED_PROMPTS).map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => sendText(prompt)}
                        disabled={loading}
                        className="text-left text-xs px-3 py-2 rounded-xl border border-slate-700 text-slate-300 hover:border-amber-500/40 hover:bg-amber-500/5 transition disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/60 p-4 space-y-4 min-h-[320px] max-h-[50vh]">
                {conversation.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center mb-3">
                      <Bot className="w-7 h-7 text-amber-400" />
                    </div>
                    <p className="text-slate-400 text-sm max-w-sm">
                      Ask about shift handover, gas safety, incidents, PPE, or emergencies — works even without an API key.
                    </p>
                  </div>
                )}
                {conversation.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'bot' && (
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          msg.offline ? 'bg-amber-500/20' : 'bg-violet-500/20'
                        }`}
                      >
                        <Bot className={`w-4 h-4 ${msg.offline ? 'text-amber-300' : 'text-violet-300'}`} />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-amber-500 text-mine-950 rounded-br-md'
                          : msg.offline
                            ? 'bg-slate-800/90 text-slate-200 border border-amber-500/30 rounded-bl-md'
                            : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-md'
                      }`}
                    >
                      {msg.text.replace(/\*\*/g, '')}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex gap-2 items-center text-slate-500 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 animate-pulse" />
                    </div>
                    <span className="animate-pulse">Thinking…</span>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>

              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendText()}
                  className="input-field flex-1"
                  placeholder="Ask a safety question…"
                  disabled={loading}
                />
                <Button onClick={() => sendText()} disabled={loading || !message.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default Chatbot;
