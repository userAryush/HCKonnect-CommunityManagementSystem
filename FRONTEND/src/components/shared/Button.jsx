import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center transition-all focus:outline-none";
  
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "border border-surface-border bg-white text-surface-body hover:bg-secondary hover:text-surface-dark rounded-button px-5 py-2.5 text-sm font-semibold",
    ghost: "bg-transparent text-surface-muted hover:bg-secondary hover:text-surface-dark rounded-button px-4 py-2 text-sm font-medium"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
