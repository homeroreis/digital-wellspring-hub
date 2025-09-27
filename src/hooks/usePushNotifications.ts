import { useState, useEffect } from 'react';

interface NotificationSettings {
  dailyReminder: boolean;
  achievementAlerts: boolean;
  weeklyProgress: boolean;
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    dailyReminder: true,
    achievementAlerts: true,
    weeklyProgress: true
  });

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscriptionStatus();
      loadSettings();
    }
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const requestPermission = async () => {
    if (!isSupported) return false;
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const subscribe = async () => {
    if (!isSupported) return false;

    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return false;

      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return false;

      // For demo purposes, we'll just mark as subscribed
      // In a real app, you'd use VAPID keys and a push service
      setIsSubscribed(true);
      localStorage.setItem('pushSubscribed', 'true');
      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }
      setIsSubscribed(false);
      localStorage.removeItem('pushSubscribed');
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
  };

  const sendTestNotification = async () => {
    if (!isSupported) return;

    // Show a local notification for demo
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.showNotification('Digital Wellspring Hub', {
          body: 'Esta é uma notificação de teste! 🙏',
          icon: '/icon-192x192.png',
          badge: '/favicon.png'
        });
      }
    }
  };

  return {
    isSupported,
    isSubscribed,
    settings,
    subscribe,
    unsubscribe,
    updateSettings,
    sendTestNotification
  };
};