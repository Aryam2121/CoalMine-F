import React from 'react';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
  success: 'btn-success',
};

const Button = ({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) => (
  <button type={type} className={`${variants[variant] || variants.primary} ${className}`} {...props}>
    {children}
  </button>
);

export default Button;
