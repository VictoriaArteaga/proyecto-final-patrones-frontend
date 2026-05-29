import api from './api';
import type { AppNotification, NotificationType } from '../context/NotificationsContext';

// Forma en que el backend devuelve cada notificación.
// `createdAt` llega como ISO string (formato por defecto de Java para Instant/LocalDateTime).
interface NotificationDTO {
  id: string | number;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string | number;
}

// Normaliza el DTO del backend al modelo que usa el frontend
// (id string + createdAt en milisegundos).
const toAppNotification = (dto: NotificationDTO): AppNotification => ({
  id: String(dto.id),
  message: dto.message,
  type: dto.type,
  read: dto.read,
  createdAt:
    typeof dto.createdAt === 'number'
      ? dto.createdAt
      : new Date(dto.createdAt).getTime(),
});

export const notificationService = {
  // Lista del usuario autenticado (del más reciente al más antiguo).
  list: async (): Promise<AppNotification[]> => {
    const response = await api.get<NotificationDTO[]>('/users/me/notifications');
    return response.data.map(toAppNotification);
  },

  // Crea una notificación; el backend asigna id y fecha.
  create: async (
    message: string,
    type: NotificationType
  ): Promise<AppNotification> => {
    const response = await api.post<NotificationDTO>('/users/me/notifications', {
      message,
      type,
    });
    return toAppNotification(response.data);
  },

  // Marca todas como leídas.
  markAllRead: async (): Promise<void> => {
    await api.patch('/users/me/notifications/read');
  },

  // Elimina todas las del usuario.
  clearAll: async (): Promise<void> => {
    await api.delete('/users/me/notifications');
  },
};
