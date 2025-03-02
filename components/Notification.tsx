import React from 'react';

interface NotificationProps {
  message: string;
  type: 'warning' | 'error' | 'success';
  onDismiss: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onDismiss }) => {
  const bgColor = {
    warning: 'bg-yellow-100 border-yellow-500',
    error: 'bg-red-100 border-red-500',
    success: 'bg-green-100 border-green-500'
  }[type];

  const textColor = {
    warning: 'text-yellow-800',
    error: 'text-red-800',
    success: 'text-green-800'
  }[type];

  const icon = {
    warning: '⚠️',
    error: '❌',
    success: '✅'
  }[type];

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg border ${bgColor} shadow-lg max-w-md animate-slide-in`}>
      <div className="flex items-start space-x-3">
        <div className="text-xl">{icon}</div>
        <div className={`flex-1 ${textColor}`}>{message}</div>
        <button 
          onClick={onDismiss}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Notification; 