/**
 * Servicios Reales de Gestión de Proyectos
 * Exporta todos los servicios funcionales para usar en la aplicación
 */

// Estado y máquina de estados
export {
  ProjectStateEnum,
  ProjectStateManager,
  projectStateManager,
  type ProjectStateTransition,
  type ProjectStateInfo
} from './ProjectStateManager';

// Búsqueda y filtrado
export {
  ProjectSearchService,
  projectSearchService,
  type ProjectSearchIndex,
  type ProjectSearchNode
} from './ProjectSearchService';

// Cola de procesamiento
export {
  ProjectProcessingQueue,
  projectProcessingQueue,
  ProcessingTaskType,
  ProcessingTaskStatus,
  type ProcessingTask
} from './ProjectProcessingQueue';

// Auditoría e historial
export {
  ProjectAuditTrail,
  projectAuditTrail,
  AuditEventType,
  type AuditEvent,
  type ProjectHistory
} from './ProjectAuditTrail';

// Versiones y navegación
export {
  ProjectVersionManager,
  projectVersionManager,
  type ProjectVersionInfo,
  type VersionNavigationContext
} from './ProjectVersionManager';
