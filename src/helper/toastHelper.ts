import { Store } from 'react-notifications-component';

export const showErrorToast = (message: string, onRemoval?: () => void) => {
  Store.addNotification({
    type: 'danger',
    message: message,
    container: 'top-right',
    dismiss: {
      duration: 3000,
      onScreen: true,
      showIcon: true,
    },
    onRemoval: onRemoval,
  });
};

export const showSuccessToast = (message: string, onRemoval?: () => void) => {
  Store.addNotification({
    type: 'success',
    message: message,
    container: 'top-right',
    dismiss: {
      duration: 3000,
      onScreen: true,
      showIcon: true,
    },
    onRemoval: onRemoval,
  });
};
