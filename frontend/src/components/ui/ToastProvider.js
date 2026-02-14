/**
 * ToastProvider.js - Global Notification System
 * 
 * PURPOSE: Provides a clean, non-blocking way to show success/error messages
 * to the user, replacing native browser alerts.
 * 
 * Features:
 * - Animated slide-in/out using framer-motion
 * - Auto-dismissal after 5 seconds
 * - Success/Error/Info variants
 * - Stackable notifications (though we usually show one at a time)
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((message) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message) => addToast(message, 'error'), [addToast]);
  const info = useCallback((message) => addToast(message, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info }}>
      {children}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const icons = {
    success: <CheckCircle2 size={20} className="text-emerald-400" />,
    error: <AlertCircle size={20} className="text-red-400" />,
    info: <Info size={20} className="text-blue-400" />,
  };

  const styles = {
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100',
    error: 'border-red-500/20 bg-red-500/10 text-red-100',
    info: 'border-blue-500/20 bg-blue-500/10 text-blue-100',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`toast-item ${styles[toast.type]}`}
    >
      <div className="toast-icon">{icons[toast.type]}</div>
      <p className="toast-message">{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} className="toast-close">
        <X size={16} />
      </button>
    </motion.div>
  );
};
