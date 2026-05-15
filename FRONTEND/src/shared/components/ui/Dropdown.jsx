import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

/** Above ModalWrapper (z-[120]) so portaled menus stack on top of dialogs */
const DROPDOWN_MENU_Z = 'z-[130]'

const Dropdown = ({ actions, align = 'right', trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const handleToggle = (e) => {
    e.stopPropagation();
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // fixed positioning: use viewport coordinates from getBoundingClientRect()
      const newTop = rect.bottom + 4;
      const newLeft =
        align === 'right' ? rect.right - 224 : rect.left;
      setPosition({ top: newTop, left: newLeft });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isOpen || !dropdownRef.current) return;
      const inMenu = dropdownRef.current.contains(event.target);
      const inTrigger = triggerRef.current?.contains(event.target);
      if (!inMenu && !inTrigger) {
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
          className={`fixed ${DROPDOWN_MENU_Z} w-56 rounded-xl bg-white border border-surface-border shadow-lg py-1.5 transition-all animate-in fade-in zoom-in-95 duration-200`}
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
