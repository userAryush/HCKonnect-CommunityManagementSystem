import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/others/Toast';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({ message: '', type: 'success', duration: 4000 });

    const showToast = useCallback((message, type = 'success', duration = 4000) => {
        setToast({ message, type, duration });
    }, []);

    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, message: '' }));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Toast 
                message={toast.message} 
                type={toast.type} 
                duration={toast.duration} 
                onClose={hideToast} 
            />
        </ToastContext.Provider>
    );
};
