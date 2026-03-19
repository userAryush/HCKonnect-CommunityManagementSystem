import React from 'react';

const Badge = ({ children, variant = 'gray', className = '', ...props }) => {
  const variants = {
    gray: "bg-zinc-100 text-zinc-600",
    success: "bg-[#75C043]/10 text-[#75C043]",
  };

  return (
    <span 
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
