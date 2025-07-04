import React from 'react';
import './Toast.css';

export default function Toast({ message, show, onClose }) {
  if (!show) {
    return null;
  }

  const handleContextMenu = (e) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="toast-overlay" onContextMenu={handleContextMenu}>
      <div className="toast-content">
        <span className="toast-icon">✔️</span>
        {message}
      </div>
    </div>
  );
} 