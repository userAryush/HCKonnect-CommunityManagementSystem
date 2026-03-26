import React from 'react';

const Badge = ({ children, variant = 'gray', className = '', ...props }) => {
  const variants = {
    gray: "bg-zinc-100 text-zinc-600 border border-zinc-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border border-blue-100",
    amber: "bg-amber-50 text-amber-700 border border-amber-100",
    red: "bg-red-50 text-red-700 border border-red-100",
    orange: "bg-orange-50 text-orange-700 border border-orange-100",
    deepBlue: "bg-blue-900/10 text-blue-900 border border-blue-200"
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
