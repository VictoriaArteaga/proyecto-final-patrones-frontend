# 📋 Servicios Reales de Gestión de Proyectos

Este directorio contiene las **implementaciones reales** de servicios para gestionar proyectos Arq-AI 3D. No son ejemplos educativos, sino código funcional listo para usar en la aplicación.

## 🎯 Servicios Disponibles

### 1. **ProjectStateManager** - Gestión de Estados
**Archivo:** `services/ProjectStateManager.ts`

Gestiona la máquina de estados de proyectos sincronizada con el backend.

**Estados del proyecto:**
```
IMAGE_UPLOADED → GENERATING_2D → WAITING_2D_APPROVAL → REJECTED_2D → (vuelve a IMAGE_UPLOADED)
                                                     ↓
                            GENERATING_2D_WITH_PARAMS → WAITING_FINAL_APPROVAL → GENERATING_3D_MODEL → COMPLETED
                            
Transiciones de error posibles desde cualquier estado → FAILED
FAILED puede volver a IMAGE_UPLOADED, REJECTED_2D o ir a DELETED
COMPLETED puede regenerarse → GENERATING_3D_MODEL
```

**Uso:**
```typescript
import { projectStateManager, ProjectStateEnum } from '@/utils/services';

// Inicializar proyecto
projectStateManager.initializeProject('proj-123', ProjectStateEnum.IMAGE_UPLOADED);

// Verificar si puede transicionar
if (projectStateManager.canTransition('proj-123', ProjectStateEnum.GENERATING_2D)) {
  projectStateManager.transition('proj-123', ProjectStateEnum.GENERATING_2D, {
    imageFile: 'house.jpg'
  });
}

// Ver estado actual
const state = projectStateManager.getState('proj-123');
console.log(`Estado: ${state}`);

// Ver transiciones válidas
const validNext = projectStateManager.getValidTransitions('proj-123');

// Ver estadísticas globales
const stats = projectStateManager.getStatistics();
console.log(`Proyectos por estado:`, stats.byState);
```

---

### 2. **ProjectSearchService** - Búsqueda y Filtrado
**Archivo:** `services/ProjectSearchService.ts`

Proporciona búsqueda rápida usando Binary Search Trees.

**Características:**
- 🔍 Búsqueda exacta por nombre
- 🔎 Búsqueda por prefijo
- 📅 Búsqueda por rango de fechas
- 📊 Filtrado por estado
- 📈 Búsqueda combinada

**Uso:**
```typescript
import { projectSearchService } from '@/utils/services';

// Indexar proyectos (normalmente desde API)
projectSearchService.indexProjects([
  { id: 'p1', name: 'Casa Moderna', status: 'COMPLETED', createdAt: '2024-01-15', ... },
  { id: 'p2', name: 'Villa Mediterránea', status: 'GENERATING_3D', createdAt: '2024-01-20', ... }
]);

// Búsqueda exacta
const project = projectSearchService.searchByName('Casa Moderna');

// Búsqueda por prefijo
const projects = projectSearchService.searchByNamePrefix('Casa');

// Proyectos de los últimos 7 días
const recent = projectSearchService.getRecentProjects(7);

// Búsqueda por rango de fechas
const projects = projectSearchService.searchByDateRange(
  new Date('2024-01-01'),
  new Date('2024-01-31')
);

// Filtrar por estado
const completed = projectSearchService.filterByStatus('COMPLETED');

// Búsqueda combinada
const results = projectSearchService.searchByNameAndStatus('Casa', 'COMPLETED');

// Estadísticas del índice
const stats = projectSearchService.getIndexStatistics();
```

---

### 3. **ProjectProcessingQueue** - Cola de Procesamiento
**Archivo:** `services/ProjectProcessingQueue.ts`

Gestiona la cola de tareas de generación 2D/3D con reintentos automáticos.

**Tipos de tareas:**
- `GENERATE_2D` - Generar render 2D
- `GENERATE_2D_WITH_PARAMS` - Regenerar 2D con parámetros
- `GENERATE_3D` - Generar modelo 3D
- `EXPORT_MODEL` - Exportar modelo

**Estados de tarea:**
- `PENDING` - Esperando procesamiento
- `PROCESSING` - En procesamiento
- `COMPLETED` - Completada
- `FAILED` - Falló después de reintentos
- `RETRYING` - Reintentando después de fallo

**Uso:**
```typescript
import { 
  projectProcessingQueue, 
  ProcessingTaskType,
  ProcessingTaskStatus 
} from '@/utils/services';

// Crear y agregar una tarea
const task = {
  taskId: 'task-001',
  projectId: 'proj-123',
  userId: 'user-456',
  type: ProcessingTaskType.GENERATE_2D,
  status: ProcessingTaskStatus.PENDING,
  priority: 1, // 0=baja, 1=normal, 2=alta
  createdAt: Date.now(),
  retries: 0,
  maxRetries: 3,
  metadata: { imageFile: 'house.jpg' }
};

projectProcessingQueue.addTask(task);

// Obtener siguiente tarea para procesar
const nextTask = projectProcessingQueue.getNextTask();
if (nextTask) {
  console.log(`Procesando: ${nextTask.projectId}`);
  // ... procesar ...
}

// Marcar como completada
projectProcessingQueue.markTaskComplete('task-001');

// Marcar como fallida (reintenta si puede)
projectProcessingQueue.markTaskFailed('task-001', 'Error de conexión');

// Ver información de la cola
const info = projectProcessingQueue.getQueueInfo();
console.log(`Pendientes: ${info.pendingCount}`);
console.log(`En procesamiento: ${info.processingCount}`);
console.log(`Completadas: ${info.completedCount}`);
console.log(`Tasa de éxito: ${info.successRate}%`);

// Escuchar cambios de tareas
projectProcessingQueue.onTaskStatusChange(task => {
  console.log(`Tarea ${task.taskId}: ${task.status}`);
  // Actualizar UI, notificar usuario, etc.
});

// Obtener tareas de un proyecto
const projectTasks = projectProcessingQueue.getProjectTasks('proj-123');
```

---

### 4. **ProjectAuditTrail** - Auditoría e Historial
**Archivo:** `services/ProjectAuditTrail.ts`

Mantiene un registro completo y auditable de todos los eventos del proyecto.

**Tipos de eventos:**
- `PROJECT_CREATED` - Proyecto creado
- `PROJECT_UPDATED` - Proyecto actualizado
- `STATE_CHANGED` - Cambio de estado
- `IMAGE_UPLOADED` - Imagen subida
- `RENDER_GENERATED` - Render generado
- `RENDER_APPROVED` - Render aprobado
- `RENDER_REJECTED` - Render rechazado
- `PARAMETERS_CHANGED` - Parámetros cambiados
- `PROJECT_DELETED` - Proyecto eliminado
- `ERROR_OCCURRED` - Error

**Uso:**
```typescript
import { projectAuditTrail, AuditEventType } from '@/utils/services';

// Se crea automáticamente al crear proyecto
projectAuditTrail.createHistory('proj-123', 'user-456');

// Registrar eventos
projectAuditTrail.recordEvent({
  eventId: 'evt_123',
  projectId: 'proj-123',
  userId: 'user-456',
  eventType: AuditEventType.IMAGE_UPLOADED,
  timestamp: Date.now(),
  description: 'Imagen de terreno subida',
  metadata: { fileName: 'house.jpg', size: 2048000 }
});

// Obtener historial completo
const history = projectAuditTrail.getHistory('proj-123');

// Obtener historial en orden inverso (más reciente primero)
const historyReverse = projectAuditTrail.getHistoryReverse('proj-123');

// Eventos de un tipo específico
const approvals = projectAuditTrail.getEventsByType('proj-123', AuditEventType.RENDER_APPROVED);

// Eventos en un rango de tiempo
const events = projectAuditTrail.getEventsByDateRange('proj-123', startTime, endTime);

// Último evento
const lastEvent = projectAuditTrail.getLastEvent('proj-123');

// Resumen de actividad
const summary = projectAuditTrail.getActivitySummary('proj-123');
console.log(`Total de eventos: ${summary.totalEvents}`);
console.log(`Renders aprobados: ${summary.successfulEvents}`);
console.log(`Errores: ${summary.failedEvents}`);

// Estadísticas globales
const globalStats = projectAuditTrail.getGlobalStatistics();
console.log(`Proyectos: ${globalStats.totalProjects}`);
console.log(`Eventos totales: ${globalStats.totalEvents}`);

// Escuchar nuevos eventos
projectAuditTrail.onNewEvent(event => {
  console.log(`Nuevo evento: ${event.eventType}`);
  // Log a servidor, actualizar dashboard, etc.
});

// Exportar para respaldo
const exported = projectAuditTrail.exportHistory('proj-123');
```

---

### 5. **ProjectVersionManager** - Versiones de Proyecto
**Archivo:** `services/ProjectVersionManager.ts`

Gestiona múltiples versiones de renders y modelos 3D con navegación bidireccional.

**Características:**
- 📚 Historial completo de versiones (LinkedList)
- 🔄 Navegación bidireccional (DoublyLinkedList)
- ✅ Estado de aprobación
- 🔀 Comparación entre versiones
- 📊 Estadísticas por proyecto

**Uso:**
```typescript
import { projectVersionManager } from '@/utils/services';

// Crear proyecto
projectVersionManager.createProject('proj-123');

// Agregar versión
projectVersionManager.addVersion('proj-123', {
  versionNumber: 1,
  image2DUrl: 'https://cdn.example.com/proj-123/v1_2d.png',
  model3DUrl: null,
  description: 'Primera versión del render 2D',
  createdAt: Date.now(),
  approved: false,
  metadata: { style: 'moderno', resolution: 2048 }
});

// Agregar más versiones
projectVersionManager.addVersion('proj-123', {
  versionNumber: 2,
  image2DUrl: 'https://cdn.example.com/proj-123/v2_2d.png',
  model3DUrl: null,
  description: 'Segunda versión con cambios de iluminación',
  createdAt: Date.now(),
  approved: false
});

// Obtener versión específica
const version = projectVersionManager.getVersion('proj-123', 1);

// Obtener todas las versiones
const allVersions = projectVersionManager.getAllVersions('proj-123');

// Navegar entre versiones
projectVersionManager.navigateToNext('proj-123');       // Siguiente
projectVersionManager.navigateToPrevious('proj-123');   // Anterior
projectVersionManager.navigateToVersion('proj-123', 2); // Ir a específica

// Ver contexto de navegación actual
const context = projectVersionManager.getNavigationContext('proj-123');
console.log(`Versión ${context.currentVersion.versionNumber} de ${context.totalVersions}`);
console.log(`Progreso: ${context.progress.toFixed(0)}%`);
console.log(`¿Hay siguiente? ${context.canGoNext}`);
console.log(`¿Hay anterior? ${context.canGoPrevious}`);

// Marcar como aprobada
projectVersionManager.approveVersion('proj-123', 2);

// Ver versiones aprobadas/pendientes
const approved = projectVersionManager.getApprovedVersions('proj-123');
const pending = projectVersionManager.getPendingApprovalVersions('proj-123');

// Comparar dos versiones
const comparison = projectVersionManager.compareVersions('proj-123', 1, 2);
if (comparison) {
  console.log('Diferencias:', comparison.differences);
}

// Estadísticas
const stats = projectVersionManager.getVersionStatistics('proj-123');
console.log(`Total: ${stats.totalVersions}`);
console.log(`Aprobadas: ${stats.approvedVersions}`);
console.log(`Pendientes: ${stats.pendingVersions}`);
```

---

## 🔗 Cómo Integrar en Componentes

### Ejemplo: Dashboard.tsx
```typescript
import { 
  projectStateManager, 
  projectSearchService,
  projectProcessingQueue
} from '@/utils/services';
import { ProjectStateEnum } from '@/utils/services';

export function Dashboard() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // Cargar y indexar proyectos
    const allProjects = fetchProjects(); // Desde API
    projectSearchService.indexProjects(allProjects);
    setProjects(allProjects);

    // Obtener estadísticas de procesamiento
    const queueInfo = projectProcessingQueue.getQueueInfo();
    
    // Escuchar cambios en tareas
    projectProcessingQueue.onTaskStatusChange(task => {
      console.log(`Tarea ${task.projectId}: ${task.status}`);
    });
  }, []);

  const handleApprove = (projectId: string) => {
    // Cambiar estado
    if (projectStateManager.canTransition(
      projectId, 
      ProjectStateEnum.GENERATING_2D_WITH_PARAMS
    )) {
      projectStateManager.transition(
        projectId,
        ProjectStateEnum.GENERATING_2D_WITH_PARAMS
      );
    }
  };

  return (
    <div>
      {/* Mostrar proyectos y estados */}
    </div>
  );
}
```

---

## 📊 Estructura de Datos Utilizadas

| Servicio | Estructuras | Propósito |
|---|---|---|
| **ProjectStateManager** | Map | O(1) acceso a estados |
| **ProjectSearchService** | BST × 2 | O(log n) búsqueda |
| **ProjectProcessingQueue** | Queue Linked | O(1) encolar/desencolar |
| **ProjectAuditTrail** | LinkedList | Historial inmutable |
| **ProjectVersionManager** | LinkedList + DoublyLinkedList | Historial + navegación |

---

## ✅ Consideraciones Importantes

1. **Persistencia:** Los servicios mantienen datos en memoria. Implementar sincronización con API/localStorage según necesidad.

2. **Reactividad:** Usar listeners para sincronizar estado con UI:
```typescript
projectProcessingQueue.onTaskStatusChange(task => {
  // Trigger re-render en React
});
```

3. **Límites:** ProjectAuditTrail limita a 1000 eventos por proyecto. Ajustar según necesidad.

4. **Sincronización:** Sincronizar con estados del backend regularmente.

---

## 📚 Referencias Relacionadas

- [PHASE1_README.md](./PHASE1_README.md) - Fundamentos de estructuras
- [PHASE2_README.md](./PHASE2_README.md) - Stack y navegación
- [PHASE3_README.md](./PHASE3_README.md) - BST y búsqueda avanzada
- [INTEGRATION_GUIDE.ts](./INTEGRATION_GUIDE.ts) - Ejemplos de integración
