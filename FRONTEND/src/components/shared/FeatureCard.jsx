import React from 'react';

const FeatureCard = ({ 
  title, 
  description, 
  icon: Icon, 
  footer,
  className = '' 
}) => {
  return (
    <div className={`card-border p-6 flex flex-col gap-4 hover:border-primary/30 transition-colors ${className}`}>
      {Icon && (
        <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-primary">
          <Icon size={24} />
        </div>
      )}
      
      <div>
        <h3 className="text-xl font-display font-bold text-surface-dark">
          {title}
        </h3>
        <p className="mt-2 text-surface-body leading-relaxed">
          {description}
        </p>
      </div>

      {footer && (
        <div className="mt-auto pt-4 border-t border-surface-border">
          {footer}
        </div>
      )}
    </div>
  );
};

export default FeatureCard;
