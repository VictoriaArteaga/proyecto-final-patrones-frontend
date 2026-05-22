/**
 * Ejemplos de uso de las estructuras de datos de Fase 1
 */

import { GenerationTask, GenerationTaskQueue } from './structures/Queue';
import { ProjectStatus, ProjectStateMachine, ProjectStateMachineManager } from './structures/ProjectStateMachine';
import { ProjectCache, UserProjectCacheManager } from './cache/ProjectCache';
import type { ProjectResponseDTO } from '../types/project.types';

/**
 * ==========================================
 * EJEMPLO 1: Usar la Cola de Tareas
 * ==========================================
 */
export function exampleQueue() {
  // Crear gestor de cola de generación
  const taskQueue = new GenerationTaskQueue();

  // Agregar tareas de generación
  const task1: GenerationTask = {
    projectId: 'project-001',
    userId: 'user-123',
    type: '2D',
    imagePath: '/uploads/house1.jpg',
    timestamp: Date.now(),
    retries: 0,
    maxRetries: 3
  };

  const task2: GenerationTask = {
    projectId: 'project-002',
    userId: 'user-456',
    type: '3D',
    timestamp: Date.now(),
    retries: 0,
    maxRetries: 3
  };

  // Encolar tareas
  taskQueue.addTask(task1);
  taskQueue.addTask(task2);

  // Obtener información de la cola
  console.log('Info de la cola:', taskQueue.getQueueInfo());
  // Output: { queueLength: 2, processingCount: 0, completedCount: 0 }

  // Procesar tareas (simular worker)
  const nextTask = taskQueue.getNextTask();
  console.log('Procesando:', nextTask?.projectId); // Output: project-001

  // Verificar posición en la cola (antes de procesarse)
  const position = taskQueue.getQueuePosition('project-002');
  console.log('Proyecto 002 está en posición:', position); // Output: 0 (ahora es el primero)

  // Marcar tarea como completa
  taskQueue.markTaskComplete(nextTask!.projectId);

  // Marcar tarea como fallida (reintentará)
  // taskQueue.markTaskFailed('project-002');

  console.log('Info final:', taskQueue.getQueueInfo());
}

/**
 * ==========================================
 * EJEMPLO 2: Usar la Máquina de Estados
 * ==========================================
 */
export function exampleStateMachine() {
  // Para un proyecto individual
  const projectMachine = new ProjectStateMachine();

  console.log('Estado inicial:', projectMachine.getCurrentState());
  // Output: PENDING

  // Ver transiciones válidas
  console.log('Transiciones válidas:', projectMachine.getValidTransitions());
  // Output: [GENERATING_2D, ERROR]

  // Realizar transición válida
  const success1 = projectMachine.transition(ProjectStatus.GENERATING_2D, {
    imageProcessing: 'started'
  });
  console.log('Transición exitosa:', success1); // Output: true

  // Intentar transición inválida
  const success2 = projectMachine.transition(ProjectStatus.COMPLETED);
  console.log('Transición inválida:', success2); // Output: false
  // (porque no se puede ir de GENERATING_2D a COMPLETED directamente)

  // Ver historial
  console.log('Historial:', projectMachine.getHistory());

  // Para múltiples proyectos
  const manager = new ProjectStateMachineManager();

  // Crear máquinas para 2 proyectos
  manager.createMachine('project-001');
  manager.createMachine('project-002');

  // Transiciones en proyecto 1
  manager.transition('project-001', ProjectStatus.GENERATING_2D);
  manager.transition('project-001', ProjectStatus.REVIEW_2D);

  // Transiciones en proyecto 2
  manager.transition('project-002', ProjectStatus.GENERATING_2D);

  // Verificar estados
  console.log('Estado proyecto 1:', manager.getCurrentState('project-001'));
  // Output: REVIEW_2D

  console.log('Estado proyecto 2:', manager.getCurrentState('project-002'));
  // Output: GENERATING_2D

  // Obtener historial completo de un proyecto
  console.log('Historial proyecto 1:', manager.getProjectHistory('project-001'));
}

/**
 * ==========================================
 * EJEMPLO 3: Usar el Caché de Proyectos
 * ==========================================
 */
export function exampleProjectCache() {
  // Crear caché con configuración custom
  const cache = new ProjectCache({
    maxSize: 50,
    defaultTTL: 10 * 60 * 1000, // 10 minutos
    enableAutoCleanup: true,
    cleanupInterval: 2 * 60 * 1000 // Limpiar cada 2 minutos
  });

  // Simular un proyecto
  const mockProject: ProjectResponseDTO = {
    id: 'project-001',
    name: 'Casa moderna',
    status: 'REVIEW_2D',
    image2DUrl: 'https://api.example.com/2d/project-001.png',
    model3DUrl: null,
    createdAt: new Date().toISOString(),
    parameters: null
  };

  // Guardar en caché
  cache.set('project-001', mockProject);

  // Recuperar del caché (búsqueda O(1) muy rápida)
  const cachedProject = cache.get('project-001');
  console.log('Proyecto en caché:', cachedProject?.name); // Output: Casa moderna

  // Verificar si existe
  const exists = cache.has('project-001');
  console.log('¿Existe en caché?', exists); // Output: true

  // Obtener estadísticas
  console.log('Estadísticas:', cache.getStatistics());
  // Output: { size: 1, maxSize: 50, hits: 1, misses: 0, hitRate: '100.00%', ... }

  // Buscar proyectos por criterio
  const proyecto2: ProjectResponseDTO = {
    id: 'project-002',
    name: 'Apartamento',
    status: 'COMPLETED',
    image2DUrl: 'https://api.example.com/2d/project-002.png',
    model3DUrl: 'https://api.example.com/3d/project-002.glb',
    createdAt: new Date().toISOString(),
    parameters: null
  };

  cache.set('project-002', proyecto2);

  // Buscar todos los proyectos completados
  const completedProjects = cache.find(p => p.status === 'COMPLETED');
  console.log('Proyectos completados:', completedProjects.length); // Output: 1

  // Para múltiples usuarios
  const userCacheManager = new UserProjectCacheManager();

  // Usuario 1 guarda proyecto
  userCacheManager.setProject('user-123', 'project-001', mockProject);

  // Usuario 2 guarda proyecto
  userCacheManager.setProject('user-456', 'project-002', proyecto2);

  // Recuperar proyectos de usuario 1
  const user1Projects = userCacheManager.getAllProjects('user-123');
  console.log('Proyectos de user-123:', user1Projects.length); // Output: 1

  // Invalidar caché de usuario 2 (cuando se desautentica)
  userCacheManager.invalidateUser('user-456');

  // Ver estadísticas globales
  console.log('Estadísticas globales:', userCacheManager.getAllStatistics());

  // Limpiar recursos
  cache.destroy();
}

/**
 * ==========================================
 * EJEMPLO 4: Integración Completa
 * ==========================================
 */
export function exampleIntegration() {
  // Escenario: Usuario crea proyecto y genera 2D + 3D

  // 1. Inicializar componentes
  const taskQueue = new GenerationTaskQueue();
  const machineManager = new ProjectStateMachineManager();
  const cacheManager = new UserProjectCacheManager();

  const projectId = 'proyecto-casa-01';
  const userId = 'user-maria';

  // 2. Usuario crea proyecto
  const newProject: ProjectResponseDTO = {
    id: projectId,
    name: 'Mi Casa Soñada',
    status: 'PENDING',
    image2DUrl: null,
    model3DUrl: null,
    createdAt: new Date().toISOString(),
    parameters: null
  };

  // 3. Guardar en caché
  cacheManager.setProject(userId, projectId, newProject);

  // 4. Crear máquina de estados
  machineManager.createMachine(projectId);

  // 5. Usuario sube foto → agregar tarea de generación 2D
  const task2D: GenerationTask = {
    projectId,
    userId,
    type: '2D',
    imagePath: '/uploads/photo.jpg',
    timestamp: Date.now(),
    retries: 0,
    maxRetries: 3
  };

  taskQueue.addTask(task2D);

  console.log('Cola después de agregar tarea:', taskQueue.getQueueInfo());
  // Output: { queueLength: 1, processingCount: 0, completedCount: 0 }

  // 6. Backend procesa tarea
  const currentTask = taskQueue.getNextTask();
  console.log('Procesando:', currentTask?.type); // Output: 2D

  // 7. Estado cambia a GENERATING_2D
  machineManager.transition(projectId, ProjectStatus.GENERATING_2D);

  // 8. Backend completa generación y actualiza caché
  const updatedProject = {
    ...newProject,
    status: 'REVIEW_2D',
    image2DUrl: 'https://api.example.com/2d/proyecto-casa-01.png'
  };

  cacheManager.setProject(userId, projectId, updatedProject);
  taskQueue.markTaskComplete(projectId);
  machineManager.transition(projectId, ProjectStatus.REVIEW_2D);

  // 9. Usuario ve preview en caché
  const projectFromCache = cacheManager.getProject(userId, projectId);
  console.log('Proyecto en caché:', {
    name: projectFromCache?.name,
    status: projectFromCache?.status,
    image2DUrl: projectFromCache?.image2DUrl
  });

  // 10. Usuario aprueba diseño 2D
  machineManager.transition(projectId, ProjectStatus.GENERATING_3D);

  // 11. Agregar tarea de generación 3D
  const task3D: GenerationTask = {
    projectId,
    userId,
    type: '3D',
    timestamp: Date.now(),
    retries: 0,
    maxRetries: 3
  };

  taskQueue.addTask(task3D);

  console.log('Cola con tarea 3D:', taskQueue.getQueueInfo());

  // Ver historial completo del proyecto
  console.log('Historial del proyecto:', machineManager.getProjectHistory(projectId));
}
