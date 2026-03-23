// Reusable Modal Component
import React, { useEffect, useRef } from 'react';

interface ModalProps {
  id?: string;
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  footer?: React.ReactNode;
  // Backward-compatible props (used by several pages)
  open?: boolean;
  onSave?: () => void;
}

let activeModalId: string | null = null;

export default function Modal({ id, title, children, onClose, footer, open, onSave }: ModalProps) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModalId === id && onCloseRef.current) {
        onCloseRef.current();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [id]);

  const modalId = id ?? 'modal-default';

  // Support controlled mode: <Modal open={...} ...>
  if (typeof open === 'boolean') {
    if (!open) return null;
    return (
      <div
        id={modalId}
        className="modal show"
        onClick={(e) => {
          if (e.target === e.currentTarget && onCloseRef.current) {
            onCloseRef.current();
          }
        }}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            {onClose && (
              <button className="modal-close" onClick={onClose} aria-label="Đóng">
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          <div className="modal-body">{children}</div>
          {footer ? (
            <div className="modal-footer">{footer}</div>
          ) : onSave ? (
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
              <button className="btn btn-primary" onClick={onSave}>Lưu</button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // Legacy mode (DOM class toggling via useModal)
  return (
    <div
      id={modalId}
      className="modal"
      onClick={(e) => {
        if (e.target === e.currentTarget && onCloseRef.current) {
          onCloseRef.current();
        }
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          {onClose && (
            <button className="modal-close" onClick={onClose} aria-label="Đóng">
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
        {footer ? (
          <div className="modal-footer">{footer}</div>
        ) : onSave ? (
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button className="btn btn-primary" onClick={onSave}>Lưu</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = React.useState(initialOpen);
  const modalIdRef = React.useRef<string | null>(null);

  const open = React.useCallback((modalId?: string) => {
    const id = modalId ?? modalIdRef.current ?? 'modal-default';
    modalIdRef.current = id;
    activeModalId = id;
    setIsOpen(true);
    const el = document.getElementById(id);
    if (el) el.classList.add('show');
    document.body.style.overflow = 'hidden';
  }, []);

  const close = React.useCallback(() => {
    if (modalIdRef.current) {
      const el = document.getElementById(modalIdRef.current);
      if (el) el.classList.remove('show');
      activeModalId = null;
    }
    setIsOpen(false);
    document.body.style.overflow = '';
  }, []);

  const toggle = React.useCallback(() => {
    if (isOpen) close();
    else if (modalIdRef.current) open(modalIdRef.current);
  }, [isOpen, close, open]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (modalIdRef.current) {
        const el = document.getElementById(modalIdRef.current);
        if (el) el.classList.remove('show');
      }
      activeModalId = null;
    };
  }, []);

  return { isOpen, open, close, toggle, modalIdRef };
}
