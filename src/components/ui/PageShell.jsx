import { motion } from 'framer-motion';

/**
 * Consistent page wrapper for all authenticated routes.
 * @param {'light'|'dark'} variant - dark for legacy dark pages (alerts, safety)
 */
const PageShell = ({
  title,
  subtitle,
  action,
  children,
  variant = 'light',
  className = '',
  noPadding = false,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className={`${variant === 'dark' ? 'page-wrap-dark' : 'page-wrap'} ${noPadding ? '!p-0' : ''} ${className}`}
  >
    {(title || action) && (
      <header className="page-header-row">
        <div className="min-w-0">
          {title && <h1 className="page-title">{title}</h1>}
          {subtitle && <p className="page-subtitle !mb-0">{subtitle}</p>}
        </div>
        {action && <div className="page-actions shrink-0">{action}</div>}
      </header>
    )}
    {children}
  </motion.div>
);

export default PageShell;
