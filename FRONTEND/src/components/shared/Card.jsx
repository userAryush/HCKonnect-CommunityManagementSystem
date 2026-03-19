import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`card-border ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
