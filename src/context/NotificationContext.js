import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

const STORAGE_KEY = 'healytics_seen_statuses';

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  // Called after fetching appointments — compares with last-seen snapshot
  const syncNotifications = useCallback((appointments) => {
    if (!appointments?.length) return;

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    let newCount = 0;

    appointments.forEach((appt) => {
      const id = appt.AppointmentID;
      const currentStatus = appt.Status;
      const seenStatus = stored[id];

      // Notify if status changed from Pending to something else (doctor acted)
      if (
        seenStatus === 'Pending' &&
        (currentStatus === 'Confirmed' || currentStatus === 'Cancelled' || currentStatus === 'Completed')
      ) {
        newCount++;
      }

      // First time seeing this appointment — store it
      if (!seenStatus) {
        stored[id] = currentStatus;
      }
    });

    setUnreadCount(newCount);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }, []);

  // Called when patient opens the Appointments page
  const markAllRead = useCallback((appointments) => {
    if (!appointments?.length) return;
    const stored = {};
    appointments.forEach((a) => { stored[a.AppointmentID] = a.Status; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, syncNotifications, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
