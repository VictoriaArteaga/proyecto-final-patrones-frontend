/**
 * Cola Real de Procesamiento de Proyectos
 * Gestiona tareas de generación 2D/3D con reintentos y prioridades
 */

export enum ProcessingTaskType {
  GENERATE_2D = 'GENERATE_2D',
  GENERATE_2D_WITH_PARAMS = 'GENERATE_2D_WITH_PARAMS',
  GENERATE_3D = 'GENERATE_3D',
  EXPORT_MODEL = 'EXPORT_MODEL'
}

export enum ProcessingTaskStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING'
}

export interface ProcessingTask {
  taskId: string;
  projectId: string;
  userId: string;
  type: ProcessingTaskType;
  status: ProcessingTaskStatus;
  priority: number; // 0 = baja, 1 = normal, 2 = alta
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  retries: number;
  maxRetries: number;
  lastError?: string;
  metadata?: Record<string, any>;
}

interface QueueNode {
  data: ProcessingTask;
  next: QueueNode | null;
}

/**
 * Gestor de cola de procesamiento para generación de renders
 */
export class ProjectProcessingQueue {
  private head: QueueNode | null = null;
  private tail: QueueNode | null = null;
  private queueSize: number = 0;
  private processingTasks: Map<string, ProcessingTask> = new Map();
  private completedTasks: Map<string, ProcessingTask> = new Map();
  private failedTasks: Map<string, ProcessingTask> = new Map();
  private listeners: ((task: ProcessingTask) => void)[] = [];

  /**
   * Agrega una tarea a la cola
   */
  addTask(task: ProcessingTask): void {
    const newNode: QueueNode = {
      data: task,
      next: null
    };

    if (this.tail === null) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
    }

    this.queueSize++;
    this.notifyListeners(task);
  }

  /**
   * Obtiene la siguiente tarea a procesar
   */
  getNextTask(): ProcessingTask | undefined {
    if (this.head === null) {
      return undefined;
    }

    const task = this.head.data;
    this.head = this.head.next;

    if (this.head === null) {
      this.tail = null;
    }

    this.queueSize--;
    task.status = ProcessingTaskStatus.PROCESSING;
    task.startedAt = Date.now();
    this.processingTasks.set(task.taskId, task);

    this.notifyListeners(task);
    return task;
  }

  /**
   * Marca una tarea como completada
   */
  markTaskComplete(taskId: string): void {
    const task = this.processingTasks.get(taskId);
    if (task) {
      task.status = ProcessingTaskStatus.COMPLETED;
      task.completedAt = Date.now();
      this.processingTasks.delete(taskId);
      this.completedTasks.set(taskId, task);
      this.notifyListeners(task);
    }
  }

  /**
   * Marca una tarea como fallida y decide si reintentar
   */
  markTaskFailed(taskId: string, error: string): void {
    const task = this.processingTasks.get(taskId);
    if (task) {
      task.lastError = error;

      if (task.retries < task.maxRetries) {
        task.retries++;
        task.status = ProcessingTaskStatus.RETRYING;
        this.addTask(task);
      } else {
        task.status = ProcessingTaskStatus.FAILED;
        this.processingTasks.delete(taskId);
        this.failedTasks.set(taskId, task);
      }

      this.notifyListeners(task);
    }
  }

  /**
   * Obtiene la posición de una tarea en la cola
   */
  getQueuePosition(taskId: string): number {
    let current = this.head;
    let index = 0;

    while (current !== null) {
      if (current.data.taskId === taskId) {
        return index;
      }
      current = current.next;
      index++;
    }

    return -1;
  }

  /**
   * Obtiene información de una tarea
   */
  getTaskInfo(taskId: string): ProcessingTask | null {
    return (
      this.processingTasks.get(taskId) ||
      this.completedTasks.get(taskId) ||
      this.failedTasks.get(taskId) ||
      null
    );
  }

  /**
   * Obtiene todas las tareas pendientes
   */
  getPendingTasks(): ProcessingTask[] {
    const result: ProcessingTask[] = [];
    let current = this.head;

    while (current !== null) {
      result.push(current.data);
      current = current.next;
    }

    return result;
  }

  /**
   * Obtiene todas las tareas en procesamiento
   */
  getProcessingTasks(): ProcessingTask[] {
    return Array.from(this.processingTasks.values());
  }

  /**
   * Obtiene todas las tareas completadas
   */
  getCompletedTasks(): ProcessingTask[] {
    return Array.from(this.completedTasks.values());
  }

  /**
   * Obtiene todas las tareas fallidas
   */
  getFailedTasks(): ProcessingTask[] {
    return Array.from(this.failedTasks.values());
  }

  /**
   * Obtiene tareas de un proyecto específico
   */
  getProjectTasks(projectId: string): ProcessingTask[] {
    const results: ProcessingTask[] = [];

    // Tareas pendientes
    let current = this.head;
    while (current !== null) {
      if (current.data.projectId === projectId) {
        results.push(current.data);
      }
      current = current.next;
    }

    // Tareas en procesamiento
    for (const [, task] of this.processingTasks) {
      if (task.projectId === projectId) {
        results.push(task);
      }
    }

    // Tareas completadas
    for (const [, task] of this.completedTasks) {
      if (task.projectId === projectId) {
        results.push(task);
      }
    }

    return results;
  }

  /**
   * Obtiene información de la cola
   */
  getQueueInfo() {
    return {
      pendingCount: this.queueSize,
      processingCount: this.processingTasks.size,
      completedCount: this.completedTasks.size,
      failedCount: this.failedTasks.size,
      totalTasks:
        this.queueSize +
        this.processingTasks.size +
        this.completedTasks.size +
        this.failedTasks.size,
      pendingByType: this.countByType(),
      successRate: this.calculateSuccessRate()
    };
  }

  /**
   * Cuenta tareas pendientes por tipo
   */
  private countByType(): Record<ProcessingTaskType, number> {
    const counts: Record<ProcessingTaskType, number> = {
      [ProcessingTaskType.GENERATE_2D]: 0,
      [ProcessingTaskType.GENERATE_2D_WITH_PARAMS]: 0,
      [ProcessingTaskType.GENERATE_3D]: 0,
      [ProcessingTaskType.EXPORT_MODEL]: 0
    };

    let current = this.head;
    while (current !== null) {
      counts[current.data.type]++;
      current = current.next;
    }

    return counts;
  }

  /**
   * Calcula la tasa de éxito
   */
  private calculateSuccessRate(): number {
    const total = this.completedTasks.size + this.failedTasks.size;
    if (total === 0) return 0;
    return (this.completedTasks.size / total) * 100;
  }

  /**
   * Registra un listener para cambios de tareas
   */
  onTaskStatusChange(listener: (task: ProcessingTask) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Notifica a los listeners sobre cambios
   */
  private notifyListeners(task: ProcessingTask): void {
    this.listeners.forEach(listener => listener(task));
  }

  /**
   * Cancela una tarea
   */
  cancelTask(taskId: string): boolean {
    const task = this.processingTasks.get(taskId);
    if (task && task.status !== ProcessingTaskStatus.PROCESSING) {
      this.processingTasks.delete(taskId);
      task.status = ProcessingTaskStatus.FAILED;
      task.lastError = 'Tarea cancelada por el usuario';
      this.failedTasks.set(taskId, task);
      this.notifyListeners(task);
      return true;
    }
    return false;
  }

  /**
   * Limpia la cola
   */
  clear(): void {
    this.head = null;
    this.tail = null;
    this.queueSize = 0;
    this.processingTasks.clear();
    this.completedTasks.clear();
    this.failedTasks.clear();
    this.listeners = [];
  }
}

// Singleton global
export const projectProcessingQueue = new ProjectProcessingQueue();
