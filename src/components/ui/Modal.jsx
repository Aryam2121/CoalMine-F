import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

const Modal = ({ open, onClose, title, children, footer, size = 'md', closable = true }) => {
  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const handleClose = closable ? onClose : undefined;

  return createPortal(
    <div className="modal-overlay !z-[100]" onClick={handleClose} role="presentation">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`modal-panel w-full ${sizes[size] || sizes.md}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          {title && <h2 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h2>}
          {closable && (
            <button type="button" onClick={onClose} className="btn-ghost !p-2 text-slate-400" aria-label="Close">
              ✕
            </button>
          )}
        </div>
        <div>{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </motion.div>
    </div>,
    document.body
  );
};

export default Modal;
