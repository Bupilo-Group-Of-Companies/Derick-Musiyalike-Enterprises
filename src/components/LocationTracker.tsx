import React, { useEffect, useState } from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import { User } from '../types';

interface LocationTrackerProps {
  currentUser: User | null;
  config: any;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({ currentUser, config }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const updateLocation = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const timestamp = new Date().toISOString();

      // Update current user in localStorage
      const updatedUser = {
        ...currentUser,
        location: {
          lat: latitude,
          lng: longitude,
          timestamp,
        }
      };
      
      localStorage.setItem('moneylink_current_user', JSON.stringify(updatedUser));

      // Update user in the main users list (Local Storage)
      const users: User[] = JSON.parse(localStorage.getItem('moneylink_users') || '[]');
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('moneylink_users', JSON.stringify(users));
      }

      // Update backend
      fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: updatedUser.location })
      }).catch(err => console.error('Failed to update location on backend:', err));

      // Notify admin (simulated)
      const adminNotifications = JSON.parse(localStorage.getItem('moneylink_admin_notifications') || '[]');
      const locationNotification = {
        id: Date.now(),
        title: 'User Location Updated',
        message: `${currentUser.name} location updated: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        time: new Date().toLocaleTimeString(),
        type: 'info',
        userId: currentUser.id
      };
      
      // Only add if not recently updated to avoid spam
      const lastNotification = adminNotifications[0];
      if (!lastNotification || lastNotification.userId !== currentUser.id || Date.now() - lastNotification.id > 60000) {
        localStorage.setItem('moneylink_admin_notifications', JSON.stringify([locationNotification, ...adminNotifications].slice(0, 50)));
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setError("Location permission denied. Please enable location for security verification.");
          break;
        case error.POSITION_UNAVAILABLE:
          setError("Location information is unavailable.");
          break;
        case error.TIMEOUT:
          setError("The request to get user location timed out.");
          break;
        default:
          setError("An unknown error occurred while fetching location.");
          break;
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(updateLocation, handleError, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });

      // Also watch position for real-time updates
      const watchId = navigator.geolocation.watchPosition(updateLocation, handleError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, [currentUser?.id]);

  if (!currentUser || !error) return null;

  return (
    <div className="fixed top-20 left-6 right-6 z-[60] animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl shadow-xl flex items-start gap-3">
        <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">Location Required</p>
          <p className="text-xs text-amber-700 leading-relaxed font-medium">
            {error} {config.appName} requires active location services for secure digital connections and fraud prevention.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 text-[10px] font-black text-amber-900 uppercase tracking-widest hover:underline"
          >
            Retry Connection
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationTracker;
