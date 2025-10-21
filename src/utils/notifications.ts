import { toast } from 'react-hot-toast';

export interface NotificationOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top-center' | 'top-right' | 'top-left' | 'bottom-center' | 'bottom-right' | 'bottom-left';
}

export const showNotification = (
  message: string, 
  options: NotificationOptions = {}
) => {
  const { type = 'success', duration = 4000, position = 'top-right' } = options;

  const toastOptions = {
    duration,
    position,
    style: {
      background: type === 'success' ? '#10B981' : 
                 type === 'error' ? '#EF4444' : 
                 type === 'warning' ? '#F59E0B' : '#3B82F6',
      color: '#fff',
      fontWeight: '500',
    },
  };

  switch (type) {
    case 'success':
      toast.success(message, toastOptions);
      break;
    case 'error':
      toast.error(message, toastOptions);
      break;
    case 'warning':
      toast(message, { ...toastOptions, icon: '⚠️' });
      break;
    case 'info':
      toast(message, { ...toastOptions, icon: 'ℹ️' });
      break;
    default:
      toast.success(message, toastOptions);
  }
};

export const showSuccessNotification = (message: string) => {
  showNotification(message, { type: 'success' });
};

export const showErrorNotification = (message: string) => {
  showNotification(message, { type: 'error' });
};

export const showWarningNotification = (message: string) => {
  showNotification(message, { type: 'warning' });
};

export const showInfoNotification = (message: string) => {
  showNotification(message, { type: 'info' });
};