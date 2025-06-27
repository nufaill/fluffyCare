// src/components/ui/ToasterSetup.tsx
import { Toaster } from 'react-hot-toast';

const ToasterSetup = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Define default options
        className: '',
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '500',
          padding: '16px',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          maxWidth: '400px',
        },

        // Default options for specific types
        success: {
          duration: 4000,
          style: {
            background: '#10B981',
            color: 'white',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#10B981',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: '#EF4444',
            color: 'white',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#EF4444',
          },
        },
        loading: {
          style: {
            background: '#3B82F6',
            color: 'white',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#3B82F6',
          },
        },
      }}
    />
  );
};

export default ToasterSetup;