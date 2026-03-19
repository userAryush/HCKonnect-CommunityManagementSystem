import React from 'react';

const Input = ({ className = '', ...props }) => {
  return (
    <input 
      className={`input-standard w-full ${className}`}
      {...props}
    />
  );
};

export default Input;
