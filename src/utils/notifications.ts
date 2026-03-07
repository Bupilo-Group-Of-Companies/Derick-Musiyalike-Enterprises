import { playNotificationSound } from './sound';

export const sendPushNotification = (title: string, options?: NotificationOptions) => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, options);
    playNotificationSound();
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(title, options);
        playNotificationSound();
      }
    });
  }
};
