/**
 * Implementación de una Cola (Queue) - FIFO (First In, First Out)
 * 
 * Casos de uso en Arq-AI 3D:
 * - Gestión de tareas de generación 2D/3D
 * - Sistema de cola de espera para procesar proyectos
 * - Procesamiento de solicitudes en orden
 */

export interface QueueNode<T> {
  data: T;
  next: QueueNode<T> | null;
}

export class Queue<T> {
  private head: QueueNode<T> | null = null;
  private tail: QueueNode<T> | null = null;
  private size: number = 0;

  /**
   * Añade un elemento al final de la cola
   * Complejidad: O(1)
   */
  enqueue(data: T): void {
    const newNode: QueueNode<T> = {
      data,
      next: null
    };

    if (this.tail === null) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
    }

    this.size++;
  }

  /**
   * Extrae el primer elemento de la cola
   * Complejidad: O(1)
   */
  dequeue(): T | undefined {
    if (this.head === null) {
      return undefined;
    }

    const data = this.head.data;
    this.head = this.head.next;

    if (this.head === null) {
      this.tail = null;
    }

    this.size--;
    return data;
  }

  /**
   * Obtiene el primer elemento sin extraerlo
   * Complejidad: O(1)
   */
  peek(): T | undefined {
    return this.head?.data;
  }

  /**
   * Verifica si la cola está vacía
   */
  isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Obtiene el tamaño de la cola
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Convierte la cola en array (manteniendo el orden FIFO)
   */
  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;

    while (current !== null) {
      result.push(current.data);
      current = current.next;
    }

    return result;
  }

  /**
   * Limpia la cola
   */
  clear(): void {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  /**
   * Obtiene la posición de un elemento en la cola (0-indexed)
   * Complejidad: O(n)
   */
  indexOf(predicate: (data: T) => boolean): number {
    let current = this.head;
    let index = 0;

    while (current !== null) {
      if (predicate(current.data)) {
        return index;
      }
      current = current.next;
      index++;
    }

    return -1;
  }

  /**
   * Busca un elemento en la cola
   * Complejidad: O(n)
   */
  find(predicate: (data: T) => boolean): T | undefined {
    let current = this.head;

    while (current !== null) {
      if (predicate(current.data)) {
        return current.data;
      }
      current = current.next;
    }

    return undefined;
  }
}

/**
 * Interfaz para tareas de generación
 */
export interface GenerationTask {
  projectId: string;
  userId: string;
  type: '2D' | '3D'; // Tipo de generación
  imagePath?: string; // Para 2D
  timestamp: number;
  retries: number;
  maxRetries: number;
}

/**
 * Gestor de tareas de generación con cola
 */
export class GenerationTaskQueue {
  private queue: Queue<GenerationTask> = new Queue();
  private processingTasks: Map<string, GenerationTask> = new Map();
  private completedTasks: Set<string> = new Set();

  /**
   * Añade una tarea a la cola de generación
   */
  addTask(task: GenerationTask): void {
    this.queue.enqueue(task);
  }

  /**
   * Obtiene la siguiente tarea a procesar
   */
  getNextTask(): GenerationTask | undefined {
    const task = this.queue.dequeue();
    if (task) {
      this.processingTasks.set(task.projectId, task);
    }
    return task;
  }

  /**
   * Marca una tarea como completada
   */
  markTaskComplete(projectId: string): void {
    this.processingTasks.delete(projectId);
    this.completedTasks.add(projectId);
  }

  /**
   * Marca una tarea como fallida (para reintentos)
   */
  markTaskFailed(projectId: string): void {
    const task = this.processingTasks.get(projectId);
    if (task && task.retries < task.maxRetries) {
      task.retries++;
      this.queue.enqueue(task); // Reintentar
    }
    this.processingTasks.delete(projectId);
  }

  /**
   * Obtiene la posición de un proyecto en la cola
   */
  getQueuePosition(projectId: string): number {
    return this.queue.indexOf(task => task.projectId === projectId);
  }

  /**
   * Obtiene toda la cola
   */
  getAllTasks(): GenerationTask[] {
    return this.queue.toArray();
  }

  /**
   * Obtiene información de la cola
   */
  getQueueInfo() {
    return {
      queueLength: this.queue.getSize(),
      processingCount: this.processingTasks.size,
      completedCount: this.completedTasks.size
    };
  }

  /**
   * Limpia la cola
   */
  clear(): void {
    this.queue.clear();
    this.processingTasks.clear();
    this.completedTasks.clear();
  }
}
