import { Link } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';
import { usePermissions } from '../hooks/usePermissions';
import { getRoleAccessList } from '../utils/roles';
import Button from './ui/Button';

const AccessDenied = ({ title = 'Access restricted', message }) => {
  const { role, roleInfo } = usePermissions();
  const allowed = getRoleAccessList(role);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center px-4 max-w-lg mx-auto">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
        <FaLock className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {message ||
          `Your role (${roleInfo.label}) cannot open this page. Use the menu or the areas below that your account allows.`}
      </p>
      {allowed.length > 0 && (
        <div className="mt-4 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Your {roleInfo.label} access includes
          </p>
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
            {allowed.slice(0, 8).map((line) => (
              <li key={line}>{line}</li>
            ))}
            {allowed.length > 8 && (
              <li className="text-slate-500">+ {allowed.length - 8} more in the menu</li>
            )}
          </ul>
        </div>
      )}
      <Link to="/" className="mt-6">
        <Button variant="primary">Back to dashboard</Button>
      </Link>
    </div>
  );
};

export default AccessDenied;
