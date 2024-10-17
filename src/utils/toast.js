import { toast, Bounce, Slide, Zoom, Flip } from 'react-toastify';

export const toastConfig = {
  transition: Slide,
  position: "top-right",
  autoClose: 1000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: false,
  newestOnTop: false,
  rtl: false,
  pauseOnFocusLoss: false,
  className: 'custom-toast-container',
};

const commonStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  background: '#ffffff',
  color: '#000000',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  borderLeft: '4px solid',
  padding: '12px 16px',
  lineHeight: '1.5',
};

export const showToast = {
  success: (message, options = {}) => {
    console.log('Showing success toast:', message);
    toast.success(message, { 
      ...toastConfig, 
      ...options,
      icon: '✅',
      style: {
        ...commonStyle,
        borderLeftColor: '#4caf50',
      },
    });
  },
  error: (message, options = {}) => {
    console.log('Showing error toast:', message);
    toast.error(message, { 
      ...toastConfig, 
      ...options,
      icon: '❌',
      style: {
        ...commonStyle,
        borderLeftColor: '#d32f2f',
      },
    });
  },
  info: (message, options = {}) => {
    console.log('Showing info toast:', message);
    toast.info(message, { 
      ...toastConfig, 
      ...options,
      icon: 'ℹ️',
      style: {
        ...commonStyle,
        borderLeftColor: '#0288d1',
      },
    });
  },
  warn: (message, options = {}) => {
    console.log('Showing warn toast:', message);
    toast.warn(message, { 
      ...toastConfig, 
      ...options,
      icon: '⚠️',
      style: {
        ...commonStyle,
        borderLeftColor: '#ffa000',
      },
    });
  },
};
