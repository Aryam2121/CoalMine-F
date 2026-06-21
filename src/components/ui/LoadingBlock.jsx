
const LoadingBlock = ({ label = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <div className="loading-spinner" />
    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
  </div>
);

export default LoadingBlock;
