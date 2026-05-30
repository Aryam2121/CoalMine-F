/** Client-side fallback if backend chat is unreachable */

const SNIPPETS = [
  {
    keys: ['shift handover', 'handover'],
    text: 'Review hazards, gas readings, permits, open incidents, and sign the handover log before leaving site.',
  },
  {
    keys: ['gas'],
    text: 'Test atmosphere before entry, monitor continuously, evacuate if readings rise, never disable detectors.',
  },
  {
    keys: ['report', 'incident'],
    text: 'Use Safety Reports for incidents; use Emergency SOS for immediate danger.',
  },
];

export function getClientOfflineReply(message) {
  const m = (message || '').toLowerCase();
  const hit = SNIPPETS.find((s) => s.keys.some((k) => m.includes(k)));
  return (
    hit?.text ||
    'Connection issue — check that CoalMine-B is running on port 3000, then try again.'
  );
}
