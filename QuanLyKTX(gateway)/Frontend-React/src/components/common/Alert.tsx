// Reusable Alert Component
import React, { useEffect } from 'react';

type AlertType = 'success' | 'danger' | 'warning' | 'info';

interface AlertProps {
  message: string;
  type?: AlertType;
  onClose?: () => void;
  autoClose?: number; // ms
}

export default function Alert({ message, type = 'info', onClose, autoClose = 5000 }: AlertProps) {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const icons: Record<AlertType, string> = {
    success: 'fa-check-circle',
    danger: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle',
  };

  return (
    <div className={`alert alert-${type}`}>
      <i className={`fas ${icons[type]}`}></i>
      <span>{message}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
}

// AlertContainer for managing multiple alerts
interface AlertItem {
  id: string;
  message: string;
  type: AlertType;
}

export function useAlert() {
  const [alerts, setAlerts] = React.useState<AlertItem[]>([]);

  const showAlert = (message: string, type: AlertType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlerts((prev) => [...prev, { id, message, type }]);
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const AlertContainer = () => (
    <div className="alert-container">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          message={alert.message}
          type={alert.type}
          onClose={() => removeAlert(alert.id)}
        />
      ))}
    </div>
  );

  return { showAlert, AlertContainer };
}
