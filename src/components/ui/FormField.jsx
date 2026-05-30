import React from 'react';

const FormField = ({ label, children, hint, error, className = '' }) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && <label className="label-field">{label}</label>}
    {children}
    {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

export default FormField;
