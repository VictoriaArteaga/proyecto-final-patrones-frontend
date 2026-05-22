# 📚 Fase 1: Estructuras de Datos Core

## 📁 Estructura de Carpetas

```
src/
├── utils/
│   ├── structures/
│   │   ├── Queue.ts                    # Cola FIFO
│   │   └── ProjectStateMachine.ts      # Máquina de estados (Grafo)
│   ├── cache/
│   │   └── ProjectCache.ts             # HashMap de caché
│   └── examples.ts                     # Ejemplos de uso
```

---

## 🎯 Componentes Implementados

### 1. **Queue.ts** - Sistema de Cola para Tareas

**Clases:**
- `Queue<T>`: Implementación genérica de cola
- `GenerationTaskQueue`: Gestor especializado para tareas de generación

**Métodos principales:**
- `enqueue(data: T)` - Agregar elemento al final - O(1)
- `dequeue()` - Extraer primer elemento - O(1)
- `peek()` - Ver primer elemento sin extraer - O(1)
- `getSize()` - Obtener cantidad de elementos
- `toArray()` - Convertir a array
- `indexOf()` - Buscar posición - O(n)
- `find()` - Buscar elemento - O(n)

**Para GenerationTaskQueue:**
- `addTask(task)` - Agregar tarea a cola
- `getNextTask()` - Obtener siguiente tarea a procesar
- `markTaskComplete()` - Marcar tarea como completa
- `markTaskFailed()` - Marcar fallida para reintentos
- `getQueuePosition(projectId)` - Posición en cola
- `getQueueInfo()` - Información general de la cola

**Casos de uso:**
- Gestionar tareas de generación 2D/3D
- Control de queue de espera
- Procesamiento en orden FIFO
- Reintentos automáticos

---

### 2. **ProjectStateMachine.ts** - Máquina de Estados (Grafo)

**Estados disponibles:**
```
PENDING → GENERATING_2D → REVIEW_2D → GENERATING_3D → COMPLETED
                ↓             ↓ ↓                          ↓
               ERROR       REJECTED_2D → PENDING          ERROR
```

**Clases:**
- `ProjectStateMachine`: Máquina individual
- `ProjectStateMachineManager`: Gestor para múltiples proyectos

**Métodos principales:**
- `transition(status)` - Cambiar estado
- `isTransitionValid(from, to)` - Validar transición
- `getCurrentState()` - Obtener estado actual
- `getValidTransitions()` - Ver transiciones permitidas
- `getHistory()` - Historial completo de transiciones
- `getCurrentStateInfo()` - Info detallada del estado

**Para Manager:**
- `createMachine(projectId)` - Crear máquina para proyecto
- `getMachine(projectId)` - Obtener máquina
- `transition(projectId, status)` - Transicionar en proyecto
- `getCurrentState(projectId)` - Estado de proyecto
- `getProjectHistory(projectId)` - Historial de proyecto
- `isTransitionValid(projectId, status)` - Validar transición

**Beneficios:**
- Previene estados inválidos
- Auditoría completa del flujo
- Validación automática de cambios
- Fácil debugging

---

### 3. **ProjectCache.ts** - HashMap para Caché

**Clases:**
- `ProjectCache`: Caché individual
- `UserProjectCacheManager`: Gestor de cachés por usuario

**Métodos principales de ProjectCache:**
- `set(projectId, project)` - Guardar en caché - O(1)
- `get(projectId)` - Obtener del caché - O(1)
- `has(projectId)` - Verificar existencia - O(1)
- `delete(projectId)` - Eliminar del caché - O(1)
- `clear()` - Limpiar todo
- `getAll()` - Obtener todos los proyectos - O(n)
- `find(predicate)` - Buscar por criterio - O(n)
- `invalidate(projectId)` - Marcar como inválido
- `cleanup()` - Limpiar expirados
- `getStatistics()` - Estadísticas de uso

**Para UserProjectCacheManager:**
- `getOrCreateCache(userId)` - Obtener/crear caché de usuario
- `setProject(userId, projectId, project)` - Guardar proyecto
- `getProject(userId, projectId)` - Obtener proyecto
- `getAllProjects(userId)` - Todos los proyectos del usuario
- `invalidateUser(userId)` - Limpiar caché del usuario
- `getAllStatistics()` - Stats de todos los usuarios

**Configuración:**
```typescript
{
  maxSize: 100,                    // Máximo de proyectos en caché
  defaultTTL: 5 * 60 * 1000,       // Tiempo de vida: 5 minutos
  enableAutoCleanup: true,         // Limpiar automáticamente
  cleanupInterval: 60 * 1000       // Limpiar cada minuto
}
```

**Ventajas:**
- Búsqueda O(1) en lugar de O(n)
- Reduce llamadas al API
- Limpieza automática
- Estadísticas de rendimiento
- Soporte multi-usuario

---

## 🚀 Cómo Usar

### Importar las estructuras:

```typescript
import { Queue, GenerationTaskQueue, GenerationTask } from '@/utils/structures/Queue';
import { ProjectStateMachine, ProjectStateMachineManager, ProjectStatus } from '@/utils/structures/ProjectStateMachine';
import { ProjectCache, UserProjectCacheManager } from '@/utils/cache/ProjectCache';
```

### Ejemplo básico en componente React:

```typescript
import { useEffect, useState } from 'react';
import { ProjectStateMachineManager, ProjectStatus } from '@/utils/structures/ProjectStateMachine';
import { UserProjectCacheManager } from '@/utils/cache/ProjectCache';

function MyComponent() {
  const [machineManager] = useState(() => new ProjectStateMachineManager());
  const [cacheManager] = useState(() => new UserProjectCacheManager());

  const userId = 'current-user';
  const projectId = 'project-123';

  useEffect(() => {
    // Crear máquina para proyecto
    machineManager.createMachine(projectId);

    // Cambiar estado
    machineManager.transition(projectId, ProjectStatus.GENERATING_2D);

    // Usar caché
    const cached = cacheManager.getProject(userId, projectId);
    if (!cached) {
      // Hacer llamada al API
      fetch(`/api/projects/${projectId}`)
        .then(res => res.json())
        .then(project => {
          cacheManager.setProject(userId, projectId, project);
        });
    }
  }, [userId, projectId]);

  return <div>Mi Componente</div>;
}
```

---

## 📊 Complejidad Computacional

| Operación | Complejidad | Estructura |
|-----------|-----------|----------|
| Enqueue/Dequeue | O(1) | Cola |
| Peek | O(1) | Cola |
| Transición de estado | O(m)* | Grafo |
| Obtener estado | O(1) | Grafo |
| Set/Get caché | O(1) | HashMap |
| Buscar en caché | O(n) | HashMap |
| Limpiar caché | O(n) | HashMap |

*m = número de transiciones válidas (generalmente pequeño)

---

## 🧪 Testing

Ejecuta los ejemplos:

```typescript
import { 
  exampleQueue, 
  exampleStateMachine, 
  exampleProjectCache,
  exampleIntegration 
} from '@/utils/examples';

// En consola:
exampleQueue();
exampleStateMachine();
exampleProjectCache();
exampleIntegration();
```

---

## 📈 Próximos Pasos (Fases 2 y 3)

**Fase 2:**
- Stack (Pila) para undo/redo
- LinkedList para historial de proyectos

**Fase 3:**
- Binary Search Tree para búsquedas avanzadas
- Doubly Linked List para galería navegable

---

## 🔗 Integración con API

Las estructuras se integran con los servicios existentes:

```typescript
// En project.service.ts
import { UserProjectCacheManager } from '@/utils/cache/ProjectCache';

const cacheManager = new UserProjectCacheManager();

export const projectService = {
  getProject: async (projectId: string) => {
    const cache = cacheManager.getProject(currentUserId, projectId);
    if (cache) return cache; // Usar caché

    // Si no está en caché, traer del API
    const response = await api.get<ProjectResponseDTO>(`/projects/${projectId}`);
    cacheManager.setProject(currentUserId, projectId, response.data);
    return response.data;
  }
};
```

---

## ⚙️ Configuración Recomendada

```typescript
// Para desarrollo
const devConfig = {
  maxSize: 50,
  defaultTTL: 5 * 60 * 1000,      // 5 minutos
  enableAutoCleanup: true,
  cleanupInterval: 1 * 60 * 1000   // 1 minuto
};

// Para producción
const prodConfig = {
  maxSize: 200,
  defaultTTL: 10 * 60 * 1000,      // 10 minutos
  enableAutoCleanup: true,
  cleanupInterval: 5 * 60 * 1000   // 5 minutos
};
```

---

## 📝 Notas Importantes

1. **Sincronización**: Cuando el backend actualiza un proyecto, invalidar caché
2. **Memoria**: El caché tiene límite para evitar memory leaks
3. **Concurrencia**: Las estructuras NO son thread-safe (OK en navegador single-thread)
4. **Errores**: La máquina de estados previene transiciones inválidas automáticamente
5. **Performance**: Queue y HashMap son O(1), muy eficientes

---

## 🐛 Debugging

Ver información detallada:

```typescript
// Estadísticas del caché
console.log(cache.getStatistics());
// { size: 10, maxSize: 100, hits: 45, misses: 5, hitRate: '90.00%', ... }

// Info detallada del caché
console.log(cache.getDetailedInfo());

// Historial de máquina de estados
console.log(machine.getHistory());

// Grafo de estados (para visualizar)
console.log(machine.getStateGraph());

// Información de cola
console.log(taskQueue.getQueueInfo());
```

---

¡Listo! Ya tienes las 3 estructuras de datos core de Fase 1 funcionando. 🎉
