import React, { useEffect, useRef } from 'react';

export const PromptModal = ({
  open,
  title,
  description,
  value,
  placeholder,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onChange,
  onConfirm,
  onCancel,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel?.();
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        onConfirm?.();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content modal-content-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header modal-header-column">
          <div>
            <div className="modal-title">{title}</div>
            {description ? <div className="modal-subtitle">{description}</div> : null}
          </div>
        </div>

        <div className="modal-body">
          <input
            ref={inputRef}
            className="modal-input"
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange?.(e.target.value)}
          />
        </div>

        <div className="modal-footer modal-footer-split">
          <button className="modal-close-button" onClick={onCancel} type="button">
            {cancelText}
          </button>
          <button className="modal-primary-button" onClick={onConfirm} type="button">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

