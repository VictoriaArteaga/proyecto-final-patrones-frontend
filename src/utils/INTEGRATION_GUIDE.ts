/**
 * Guía de Integración: Cómo usar las estructuras de datos en el proyecto actual
 * 
 * Este archivo muestra paso a paso cómo integrar Queue, StateMachine y Cache
 * con los servicios y componentes existentes
 */

/**
 * ============================================
 * 1. INTEGRACIÓN CON project.service.ts
 * ============================================
 * 
 * Modificar src/services/project.service.ts para usar caché
 */

import type { ProjectResponseDTO } from '../types/project.types';
import { UserProjectCacheManager, ProjectStateMachineManager, ProjectStatus } from '../utils/index';

// Instancia global (o en context)
const cacheManager = new UserProjectCacheManager({
  maxSize: 100,
  defaultTTL: 5 * 60 * 1000,
  enableAutoCleanup: true
});

const machineManager = new ProjectStateMachineManager();

// Simular userId del usuario autenticado
let currentUserId = 'user-123'; // Se obtendría del localStorage o context

/**
 * Mejorado: getProject con caché
 */
async function getProjectWithCache(projectId: string): Promise<ProjectResponseDTO> {
  // Paso 1: Verificar caché primero
  const cached = cacheManager.getProject(currentUserId, projectId);
  if (cached) {
    console.log('✅ Proyecto desde caché (rápido)');
    return cached;
  }

  // Paso 2: Si no está en caché, traer del API
  console.log('🔄 Trayendo del servidor...');
  try {
    // const response = await api.get<ProjectResponseDTO>(`/projects/${projectId}`);
    // Simulación:
    const response = { data: {
      id: projectId,
      name: 'Casa Test',
      status: 'PENDING',
      image2DUrl: null,
      model3DUrl: null,
      createdAt: new Date().toISOString(),
      parameters: null
    }};

    // Paso 3: Guardar en caché
    cacheManager.setProject(currentUserId, projectId, response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    throw error;
  }
}

/**
 * Mejorado: createProject con máquina de estados
 */
async function createProjectWithStateMachine(file: File, name: string): Promise<ProjectResponseDTO> {
  try {
    // Paso 1: Crear proyecto en backend
    // const response = await api.post<ProjectResponseDTO>('/projects', formData);
    
    // Simulación:
    const newProject: ProjectResponseDTO = {
      id: 'new-project-' + Date.now(),
      name,
      status: 'PENDING',
      image2DUrl: null,
      model3DUrl: null,
      createdAt: new Date().toISOString(),
      parameters: null
    };

    // Paso 2: Crear máquina de estados para este proyecto
    machineManager.createMachine(newProject.id);

    // Paso 3: Guardar en caché
    cacheManager.setProject(currentUserId, newProject.id, newProject);

    // Paso 4: Cambiar estado a GENERATING_2D
    machineManager.transition(newProject.id, ProjectStatus.GENERATING_2D);

    return newProject;
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    throw error;
  }
}

/**
 * Mejorado: generate2D con validación de estados
 */
async function generate2DWithValidation(projectId: string): Promise<ProjectResponseDTO> {
  // Paso 1: Validar que es posible generar 2D
  const validTransitions = machineManager.getValidTransitions(projectId);
  if (!validTransitions.includes(ProjectStatus.GENERATING_2D)) {
    throw new Error(
      `No se puede generar 2D. Estado actual: ${machineManager.getCurrentState(projectId)}`
    );
  }

  try {
    // Paso 2: Cambiar a estado GENERATING_2D
    machineManager.transition(projectId, ProjectStatus.GENERATING_2D);

    // Paso 3: Llamar API
    // const response = await api.post<ProjectResponseDTO>(`/projects/${projectId}/generate-2d`);
    
    // Simulación:
    const updated = await getProjectWithCache(projectId);
    updated.status = 'REVIEW_2D';
    updated.image2DUrl = 'https://api.example.com/2d/' + projectId + '.png';

    // Paso 4: Actualizar en caché
    cacheManager.setProject(currentUserId, projectId, updated);

    // Paso 5: Cambiar a estado REVIEW_2D
    machineManager.transition(projectId, ProjectStatus.REVIEW_2D);

    return updated;
  } catch (error) {
    // Cambiar a ERROR si algo falla
    machineManager.transition(projectId, ProjectStatus.ERROR, { error: String(error) });
    throw error;
  }
}

/**
 * ============================================
 * 2. INTEGRACIÓN CON NewProject.tsx
 * ============================================
 * 
 * Cómo usar las estructuras en el componente
 */

/*
import { useState, useRef, useEffect } from 'react';
import { 
  ProjectCache, 
  ProjectStateMachineManager, 
  ProjectStatus,
  GenerationTaskQueue,
  type GenerationTask 
} from '@/utils';
import { projectService } from '@/services/project.service';

export default function NewProject() {
  // Instancias
  const [stateManager] = useState(() => new ProjectStateMachineManager());
  const [taskQueue] = useState(() => new GenerationTaskQueue());
  
  const [activeStep, setActiveStep] = useState(0);
  const [projectName, setProjectName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [project, setProject] = useState<ProjectResponseDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateAndGenerate2D = async () => {
    if (!projectName || !selectedFile) {
      setError('Por favor ingresa un nombre y selecciona una imagen.');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      // Crear proyecto con máquina de estados
      const createdProject = await createProjectWithStateMachine(selectedFile, projectName);
      setProject(createdProject);
      
      // Crear tarea de generación 2D
      const task: GenerationTask = {
        projectId: createdProject.id,
        userId: currentUserId,
        type: '2D',
        imagePath: selectedFile.name,
        timestamp: Date.now(),
        retries: 0,
        maxRetries: 3
      };

      // Agregar a cola (en backend procesaría esto)
      taskQueue.addTask(task);
      console.log('Posición en cola:', taskQueue.getQueuePosition(createdProject.id));

      // Generar 2D con validación
      const projectWith2D = await generate2DWithValidation(createdProject.id);
      setProject(projectWith2D);
      setActiveStep(1);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar la imagen.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove2D = async () => {
    if (!project) return;
    setError('');
    setLoading(true);
    try {
      // Validar transición
      const canTransition = stateManager.getMachine(project.id)
        ?.isTransitionValid(stateManager.getMachine(project.id)!.getCurrentState(), ProjectStatus.GENERATING_3D);
      
      if (!canTransition) {
        setError('No puedes aprobar desde este estado.');
        return;
      }

      // Ver historial de transiciones
      const history = stateManager.getProjectHistory(project.id);
      console.log('Historial del proyecto:', history);

      // Cambiar estado y actualizar
      stateManager.transition(project.id, ProjectStatus.GENERATING_3D);
      
      // Llamar API y actualizar caché
      const approvedProject = await getProjectWithCache(project.id);
      approvedProject.status = 'GENERATING_3D';
      cacheManager.setProject(currentUserId, project.id, approvedProject);
      
      setProject(approvedProject);
      setActiveStep(2);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al aprobar el diseño.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject2D = async () => {
    if (!project) return;
    setError('');
    setLoading(true);
    try {
      // Cambiar a REJECTED_2D (y luego a PENDING)
      stateManager.transition(project.id, ProjectStatus.REJECTED_2D);
      stateManager.transition(project.id, ProjectStatus.PENDING);

      // Invalidar proyecto del caché para refrescarlo
      cacheManager.invalidateUser(currentUserId);
      
      setError('El diseño fue rechazado. Intenta subir otra imagen.');
      setActiveStep(0);
      setProject(null);
      setSelectedFile(null);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al rechazar el diseño.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... JSX existente ...
  );
}
*/

/**
 * ============================================
 * 3. INTEGRACIÓN CON Dashboard.tsx
 * ============================================
 * 
 * Mostrar proyectos usando caché
 */

/*
import { useEffect, useState } from 'react';
import { UserProjectCacheManager } from '@/utils';
import type { ProjectResponseDTO } from '@/types/project.types';

export default function Dashboard() {
  const [projects, setProjects] = useState<ProjectResponseDTO[]>([]);
  const [cacheManager] = useState(() => new UserProjectCacheManager());
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const loadProjects = async () => {
      const userId = localStorage.getItem('userId') || 'user-123';
      
      // Obtener proyectos del caché
      let userProjects = cacheManager.getAllProjects(userId);

      // Si no hay en caché, traer del API
      if (userProjects.length === 0) {
        try {
          // const response = await api.get(`/projects`);
          // userProjects = response.data;
          // Guardar en caché
          // userProjects.forEach(p => cacheManager.setProject(userId, p.id, p));
        } catch (error) {
          console.error('Error cargando proyectos:', error);
        }
      }

      setProjects(userProjects);

      // Mostrar estadísticas del caché
      const stats = cacheManager.getAllStatistics();
      setStats(stats);
    };

    loadProjects();
  }, []);

  return (
    <div>
      <h1>Panel de Proyectos</h1>
      {stats && (
        <div>
          <p>Caché hit rate: {stats['user-123']?.hitRate}</p>
          <p>Proyectos en caché: {stats['user-123']?.size}/{stats['user-123']?.maxSize}</p>
        </div>
      )}
      {projects.map(p => (
        <div key={p.id}>
          <h3>{p.name}</h3>
          <p>Estado: {p.status}</p>
        </div>
      ))}
    </div>
  );
}
*/

/**
 * ============================================
 * 4. INTEGRACIÓN CON Layout.tsx
 * ============================================
 * 
 * Limpiar recursos al desautenticarse
 */

/*
import { useEffect } from 'react';
import { UserProjectCacheManager } from '@/utils';

const cacheManager = new UserProjectCacheManager();

const handleLogout = () => {
  const userId = localStorage.getItem('userId');
  
  // Limpiar caché del usuario
  if (userId) {
    cacheManager.invalidateUser(userId);
  }

  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  navigate('/login');
};
*/

/**
 * ============================================
 * 5. MONITOREO Y DEBUGGING
 * ============================================
 */

export function debugStateMachine(projectId: string, machineManager: any) {
  const machine = machineManager.getMachine(projectId);
  if (!machine) {
    console.error('Máquina no encontrada');
    return;
  }

  console.log('=== DEBUG Estado Máquina ===');
  console.log('Estado actual:', machine.getCurrentState());
  console.log('Transiciones válidas:', machine.getValidTransitions());
  console.log('Historial:', machine.getHistory());
  console.log('Info detallada:', machine.getCurrentStateInfo());
}

export function debugCache(cacheManager: any, userId: string) {
  const cache = cacheManager.userCaches.get(userId);
  if (!cache) {
    console.error('Cache no encontrado');
    return;
  }

  console.log('=== DEBUG Caché ===');
  console.log('Estadísticas:', cache.getStatistics());
  console.log('Info detallada:', cache.getDetailedInfo());
}

export function debugQueue(taskQueue: any) {
  console.log('=== DEBUG Cola ===');
  console.log('Info cola:', taskQueue.getQueueInfo());
  console.log('Todas las tareas:', taskQueue.getAllTasks());
}

/**
 * ============================================
 * 6. CONFIGURACIÓN INICIAL (main.tsx o App.tsx)
 * ============================================
 */

/*
// En src/main.tsx o src/App.tsx al inicializar
import { exampleIntegration } from '@/utils/examples';

if (process.env.NODE_ENV === 'development') {
  // Correr ejemplo en desarrollo
  console.log('Ejecutando ejemplo de integración...');
  exampleIntegration();
  
  // Hacer disponible en window para debugging
  (window as any).examples = {
    exampleIntegration
  };
}
*/

export { 
  getProjectWithCache, 
  createProjectWithStateMachine, 
  generate2DWithValidation 
};
