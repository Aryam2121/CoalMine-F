
const EmptyState = ({ icon = '📭', title = 'No data yet', message, action }) => (
  <div className="empty-state">
    <span className="text-4xl mb-3" aria-hidden>{icon}</span>
    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
    {message && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{message}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
