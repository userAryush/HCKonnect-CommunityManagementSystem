import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  className = '',
  isLoading = false,
  disabled = false,
  loadingText,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center transition-all focus:outline-none relative";

  const variants = {
    primary:
      "rounded-button bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
    secondary:
      "rounded-button border border-surface-border bg-white px-5 py-2.5 text-sm font-semibold text-surface-body transition-all hover:bg-secondary hover:text-surface-dark active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
    outline:
      "border border-surface-border bg-white text-surface-body hover:bg-secondary hover:text-surface-dark rounded-button px-5 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:pointer-events-none",
    'danger-outline':
      "border border-red-500 bg-transparent text-red-500 hover:bg-red-50 hover:border-red-600 hover:text-red-600 rounded-button px-5 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:pointer-events-none",
    ghost:
      "bg-transparent text-surface-muted hover:bg-secondary hover:text-surface-dark rounded-button px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:pointer-events-none",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className} ${isLoading ? "opacity-80 cursor-not-allowed" : ""
        }`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-5 w-5 mr-3 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>

          <span>{loadingText || "Loading..."}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
