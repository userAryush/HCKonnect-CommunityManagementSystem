import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

const Dropdown = ({ actions, align = 'right', trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const handleToggle = (e) => {
    e.stopPropagation();
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const newTop = window.scrollY + rect.bottom + 4; // 4px gap
      let newLeft = window.scrollX + rect.left;
      if (align === 'right') {
        // Adjust based on a typical dropdown width (w-56 is 224px)
        newLeft = window.scrollX + rect.right - 224;
      }
      setPosition({ top: newTop, left: newLeft });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const defaultTrigger = (
    <button className="p-1.5 text-surface-muted hover:text-surface-dark transition-colors rounded-full hover:bg-secondary">
      <MoreVertical size={16} />
    </button>
  );

  const triggerElement = trigger ? trigger : defaultTrigger;

  return (
    <>
      {React.cloneElement(triggerElement, {
        ref: triggerRef,
        onClick: handleToggle,
      })}

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
          className={`absolute z-50 mt-1 w-56 rounded-xl bg-white border border-surface-border shadow-lg py-1.5 transition-all animate-in fade-in zoom-in-95 duration-200`}
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
              disabled={action.disabled}
              className={`flex w-full items-center gap-3 px-4 py-2 text-body transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${action.variant === 'danger'
                ? 'text-red-500 hover:bg-red-50'
                : 'text-surface-dark hover:bg-secondary'
                }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};

export default Dropdown;
