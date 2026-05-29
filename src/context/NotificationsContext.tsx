import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type { ReactNode } from 'react';
import { BoundedStack } from '../utils/BoundedStack';
import { playNotificationSound } from '../utils/notificationSounds';

export type NotificationType = 'success' | 'error' | 'info';

export interface AppNotification {
  id: string;
  message: string;
  createdAt: number; // timestamp (ms)
  read: boolean;
  type: NotificationType;
}

interface NotificationsContextValue {
  notifications: AppNotification[]; // del más reciente al más antiguo
  unreadCount: number;
  addNotification: (message: string, type?: NotificationType) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const STORAGE_KEY = 'notifications';
const CAPACITY = 20;

const NotificationsContext =
  createContext<NotificationsContextValue | null>(null);

// Carga inicial desde localStorage (sobrevive recargas/navegación).
const loadStack = (): BoundedStack<AppNotification> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? (JSON.parse(raw) as AppNotification[]) : [];
    return BoundedStack.from(arr, CAPACITY);
  } catch {
    return BoundedStack.from<AppNotification>([], CAPACITY);
  }
};

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<BoundedStack<AppNotification>>(loadStack);

  // Persistimos cada cambio.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stack.toArray()));
  }, [stack]);

  const addNotification = useCallback(
    (message: string, type: NotificationType = 'info') => {
      const notif: AppNotification = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        message,
        createdAt: Date.now(),
        read: false,
        type,
      };
      // Reproducir sonido de notificación
      playNotificationSound();
      // Apilamos en una NUEVA instancia para que React vuelva a renderizar.
      setStack((prev) =>
        BoundedStack.from([notif, ...prev.toArray()], CAPACITY)
      );
    },
    []
  );

  const markAllRead = useCallback(() => {
    setStack((prev) => {
      if (prev.toArray().every((n) => n.read)) return prev; // nada que cambiar
      const updated = prev.toArray().map((n) =>
        n.read ? n : { ...n, read: true }
      );
      return BoundedStack.from(updated, CAPACITY);
    });
  }, []);

  const clearAll = useCallback(() => {
    setStack(BoundedStack.from<AppNotification>([], CAPACITY));
  }, []);

  const notifications = useMemo(() => stack.toArray(), [stack]);
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const value: NotificationsContextValue = {
    notifications,
    unreadCount,
    addNotification,
    markAllRead,
    clearAll,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      'useNotifications debe usarse dentro de <NotificationsProvider>'
    );
  }
  return ctx;
}
