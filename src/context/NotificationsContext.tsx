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
import { notificationService } from '../services/notification.service';

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
  // Vuelve a traer las notificaciones del backend (las genera el servidor al
  // cambiar el estado de un proyecto: 2D listo, 3D listo, fallos, etc.).
  refresh: () => void;
}

const STORAGE_KEY = 'notifications';
const CAPACITY = 20;
// Cada cuánto sondeamos el backend por notificaciones nuevas (generadas en
// segundo plano, p. ej. al terminar el modelo 3D aunque no estés en la pantalla).
const POLL_INTERVAL_MS = 20_000;

const NotificationsContext =
  createContext<NotificationsContextValue | null>(null);

// Caché local: sobrevive recargas y sirve de respaldo si el backend no responde.
const loadCachedStack = (): BoundedStack<AppNotification> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? (JSON.parse(raw) as AppNotification[]) : [];
    return BoundedStack.from(arr, CAPACITY);
  } catch {
    return BoundedStack.from<AppNotification>([], CAPACITY);
  }
};

export function NotificationsProvider({ children }: { children: ReactNode }) {
  // Arrancamos con la caché local para pintar algo al instante...
  const [stack, setStack] = useState<BoundedStack<AppNotification>>(
    loadCachedStack
  );

  // Trae el listado del backend (fuente de verdad) y reemplaza el stack.
  const refresh = useCallback(async () => {
    try {
      const fromServer = await notificationService.list();
      setStack(BoundedStack.from(fromServer, CAPACITY));
    } catch {
      // El backend aún no responde: seguimos con la caché local.
    }
  }, []);

  // Al montar: sincronizamos una vez, luego sondeamos cada POLL_INTERVAL_MS y
  // también al volver a enfocar la pestaña (para ver notificaciones nuevas
  // generadas en segundo plano, como el modelo 3D al terminar).
  useEffect(() => {
    refresh();

    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  // Persistimos cada cambio en la caché local.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stack.toArray()));
  }, [stack]);

  const addNotification = useCallback(
    (message: string, type: NotificationType = 'info') => {
      // Optimista: la mostramos ya con un id temporal.
      const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const optimistic: AppNotification = {
        id: tempId,
        message,
        createdAt: Date.now(),
        read: false,
        type,
      };
      setStack((prev) =>
        BoundedStack.from([optimistic, ...prev.toArray()], CAPACITY)
      );

      // Persistimos en el backend y reconciliamos con la versión real.
      notificationService
        .create(message, type)
        .then((saved) => {
          setStack((prev) =>
            BoundedStack.from(
              prev.toArray().map((n) => (n.id === tempId ? saved : n)),
              CAPACITY
            )
          );
        })
        .catch(() => {
          // Sin backend: la notificación queda solo en local (como antes).
        });
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
    notificationService.markAllRead().catch(() => {
      /* sin backend: solo local */
    });
  }, []);

  const clearAll = useCallback(() => {
    setStack(BoundedStack.from<AppNotification>([], CAPACITY));
    notificationService.clearAll().catch(() => {
      /* sin backend: solo local */
    });
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
    refresh,
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
