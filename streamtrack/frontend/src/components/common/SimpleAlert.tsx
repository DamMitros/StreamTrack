'use client';

import React, { useState, useEffect } from 'react';

interface SimpleAlertProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const SimpleAlert: React.FC<SimpleAlertProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  let bgColorClass = 'bg-blue-500';
  if (type === 'success') bgColorClass = 'bg-green-500';
  if (type === 'error') bgColorClass = 'bg-red-500';

  return (
    <div className={`fixed top-5 right-5 p-4 rounded-md text-white shadow-lg z-50 transition-opacity duration-300 ease-in-out ${bgColorClass}`} role="alert">
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-xl font-semibold hover:text-gray-200" aria-label="Close alert">
          &times;
        </button>
      </div>
    </div>
  );
};

export default SimpleAlert;
