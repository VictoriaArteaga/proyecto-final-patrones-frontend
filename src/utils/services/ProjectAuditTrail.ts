/**
 * Servicio Real de Historial y Auditoría de Proyectos
 * Usa LinkedList para mantener un historial cronológico
 */

import { LinkedList } from '../structures/LinkedList';

export enum AuditEventType {
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  STATE_CHANGED = 'STATE_CHANGED',
  IMAGE_UPLOADED = 'IMAGE_UPLOADED',
  RENDER_GENERATED = 'RENDER_GENERATED',
  RENDER_APPROVED = 'RENDER_APPROVED',
  RENDER_REJECTED = 'RENDER_REJECTED',
  PARAMETERS_CHANGED = 'PARAMETERS_CHANGED',
  PROJECT_DELETED = 'PROJECT_DELETED',
  ERROR_OCCURRED = 'ERROR_OCCURRED'
}

export interface AuditEvent {
  eventId: string;
  projectId: string;
  userId: string;
  eventType: AuditEventType;
  timestamp: number;
  description: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ProjectHistory {
  projectId: string;
  events: LinkedList<AuditEvent>;
  totalEvents: number;
  createdAt: number;
  lastEventAt?: number;
}

/**
 * Gestor de historial y auditoría de proyectos
 * Mantiene un registro completo de todos los eventos
 */
export class ProjectAuditTrail {
  private projectHistories: Map<string, ProjectHistory> = new Map();
  private eventListeners: ((event: AuditEvent) => void)[] = [];
  private maxEventsPerProject: number = 1000;

  /**
   * Crea un nuevo historial para un proyecto
   */
  createHistory(projectId: string, userId: string): void {
    if (!this.projectHistories.has(projectId)) {
      const projectHistory: ProjectHistory = {
        projectId,
        events: new LinkedList(),
        totalEvents: 0,
        createdAt: Date.now()
      };

      // Registrar evento de creación
      const event: AuditEvent = {
        eventId: this.generateEventId(),
        projectId,
        userId,
        eventType: AuditEventType.PROJECT_CREATED,
        timestamp: Date.now(),
        description: 'Proyecto creado'
      };

      projectHistory.events.insertAtEnd(event);
      projectHistory.totalEvents = 1;
      projectHistory.lastEventAt = event.timestamp;

      this.projectHistories.set(projectId, projectHistory);
      this.notifyListeners(event);
    }
  }

  /**
   * Registra un evento en el historial
   */
  recordEvent(event: AuditEvent): void {
    const history = this.projectHistories.get(event.projectId);

    if (!history) {
      this.createHistory(event.projectId, event.userId);
      this.recordEvent(event); // Reintentar recursivamente
      return;
    }

    // Si se alcanza el límite, remover el evento más antiguo
    if (history.totalEvents >= this.maxEventsPerProject) {
      history.events.removeFromStart();
      history.totalEvents--;
    }

    history.events.insertAtEnd(event);
    history.totalEvents++;
    history.lastEventAt = event.timestamp;

    this.notifyListeners(event);
  }

  /**
   * Obtiene el historial completo de un proyecto
   */
  getHistory(projectId: string): AuditEvent[] {
    const history = this.projectHistories.get(projectId);
    if (!history) return [];

    const events: AuditEvent[] = [];
    history.events.traverse(event => {
      events.push(event);
    });

    return events;
  }

  /**
   * Obtiene el historial en orden inverso (más reciente primero)
   */
  getHistoryReverse(projectId: string): AuditEvent[] {
    return this.getHistory(projectId).reverse();
  }

  /**
   * Obtiene eventos de un tipo específico
   */
  getEventsByType(projectId: string, eventType: AuditEventType): AuditEvent[] {
    return this.getHistory(projectId).filter(
      event => event.eventType === eventType
    );
  }

  /**
   * Obtiene eventos en un rango de tiempo
   */
  getEventsByDateRange(
    projectId: string,
    startTime: number,
    endTime: number
  ): AuditEvent[] {
    return this.getHistory(projectId).filter(
      event => event.timestamp >= startTime && event.timestamp <= endTime
    );
  }

  /**
   * Obtiene el último evento de un proyecto
   */
  getLastEvent(projectId: string): AuditEvent | null {
    const history = this.getHistory(projectId);
    return history.length > 0 ? history[history.length - 1] : null;
  }

  /**
   * Cuenta eventos por tipo
   */
  getEventCounts(projectId: string): Record<AuditEventType, number> {
    const counts: Record<AuditEventType, number> = {} as any;

    this.getHistory(projectId).forEach(event => {
      counts[event.eventType] = (counts[event.eventType] || 0) + 1;
    });

    return counts;
  }

  /**
   * Obtiene un resumen de actividad
   */
  getActivitySummary(projectId: string) {
    const history = this.projectHistories.get(projectId);
    if (!history) return null;

    const events = this.getHistory(projectId);
    const eventTypes = this.getEventCounts(projectId);

    return {
      projectId,
      totalEvents: history.totalEvents,
      createdAt: history.createdAt,
      lastEventAt: history.lastEventAt,
      durationMs: (history.lastEventAt || Date.now()) - history.createdAt,
      eventsByType: eventTypes,
      successfulEvents: events.filter(
        e => e.eventType === AuditEventType.RENDER_APPROVED
      ).length,
      failedEvents: events.filter(
        e => e.eventType === AuditEventType.ERROR_OCCURRED
      ).length
    };
  }

  /**
   * Registra listener para nuevos eventos
   */
  onNewEvent(listener: (event: AuditEvent) => void): void {
    this.eventListeners.push(listener);
  }

  /**
   * Obtiene estadísticas globales
   */
  getGlobalStatistics() {
    let totalEvents = 0;
    const globalEventCounts: Record<AuditEventType, number> = {} as any;
    const projectStats: Array<{
      projectId: string;
      eventCount: number;
      lastEvent: number;
    }> = [];

    for (const [projectId, history] of this.projectHistories) {
      totalEvents += history.totalEvents;

      this.getHistory(projectId).forEach(event => {
        globalEventCounts[event.eventType] =
          (globalEventCounts[event.eventType] || 0) + 1;
      });

      projectStats.push({
        projectId,
        eventCount: history.totalEvents,
        lastEvent: history.lastEventAt || 0
      });
    }

    return {
      totalProjects: this.projectHistories.size,
      totalEvents,
      eventsByType: globalEventCounts,
      projectStats,
      averageEventsPerProject: this.projectHistories.size > 0
        ? totalEvents / this.projectHistories.size
        : 0
    };
  }

  /**
   * Exporta el historial de un proyecto
   */
  exportHistory(projectId: string): AuditEvent[] {
    return this.getHistory(projectId);
  }

  /**
   * Exporta todos los historiales
   */
  exportAllHistories() {
    const allHistories: Record<string, AuditEvent[]> = {};

    for (const [projectId] of this.projectHistories) {
      allHistories[projectId] = this.getHistory(projectId);
    }

    return allHistories;
  }

  /**
   * Genera un ID único para eventos
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Notifica a los listeners
   */
  private notifyListeners(event: AuditEvent): void {
    this.eventListeners.forEach(listener => listener(event));
  }

  /**
   * Limpia el historial de un proyecto
   */
  clearHistory(projectId: string): void {
    this.projectHistories.delete(projectId);
  }

  /**
   * Limpia todos los historiales
   */
  clearAll(): void {
    this.projectHistories.clear();
  }
}

// Singleton global
export const projectAuditTrail = new ProjectAuditTrail();
