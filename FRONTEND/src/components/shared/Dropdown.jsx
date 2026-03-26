import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

const Dropdown = ({ actions, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 text-zinc-400 hover:text-zinc-600 transition-colors rounded-full hover:bg-zinc-100"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div 
          className={`absolute z-30 mt-1 w-32 rounded-xl bg-white border border-surface-border shadow-lg py-1.5 transition-all animate-in fade-in zoom-in duration-200 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                action.onClick();
              }}
              className={`flex w-full items-center gap-2 px-4 py-2 text-xs font-semibold transition-colors ${
                action.variant === 'danger' 
                  ? 'text-red-500 hover:bg-red-50' 
                  : 'text-surface-dark hover:bg-zinc-50'
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
