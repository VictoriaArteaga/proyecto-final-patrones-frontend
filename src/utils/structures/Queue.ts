/**
 * Gestor de tareas de generación con cola
 * Especializado para Arq-AI 3D
 */

export interface GenerationTask {
  projectId: string;
  userId: string;
  type: '2D' | '3D';
  imagePath?: string;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

interface QueueNode {
  data: GenerationTask;
  next: QueueNode | null;
}

export class GenerationTaskQueue {
  private head: QueueNode | null = null;
  private tail: QueueNode | null = null;
  private queueSize: number = 0;
  private processingTasks: Map<string, GenerationTask> = new Map();
  private completedTasks: Set<string> = new Set();

  addTask(task: GenerationTask): void {
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
  }

  getNextTask(): GenerationTask | undefined {
    if (this.head === null) {
      return undefined;
    }

    const task = this.head.data;
    this.head = this.head.next;

    if (this.head === null) {
      this.tail = null;
    }

    this.queueSize--;
    this.processingTasks.set(task.projectId, task);
    return task;
  }

  markTaskComplete(projectId: string): void {
    this.processingTasks.delete(projectId);
    this.completedTasks.add(projectId);
  }

  markTaskFailed(projectId: string): void {
    const task = this.processingTasks.get(projectId);
    if (task && task.retries < task.maxRetries) {
      task.retries++;
      this.addTask(task);
    }
    this.processingTasks.delete(projectId);
  }

  getQueuePosition(projectId: string): number {
    let current = this.head;
    let index = 0;

    while (current !== null) {
      if (current.data.projectId === projectId) {
        return index;
      }
      current = current.next;
      index++;
    }

    return -1;
  }

  getAllTasks(): GenerationTask[] {
    const result: GenerationTask[] = [];
    let current = this.head;

    while (current !== null) {
      result.push(current.data);
      current = current.next;
    }

    return result;
  }

  getQueueInfo() {
    return {
      queueLength: this.queueSize,
      processingCount: this.processingTasks.size,
      completedCount: this.completedTasks.size,
      pendingByType: {
        '2D': this.getAllTasks().filter(t => t.type === '2D').length,
        '3D': this.getAllTasks().filter(t => t.type === '3D').length
      }
    };
  }

  clear(): void {
    this.head = null;
    this.tail = null;
    this.queueSize = 0;
    this.processingTasks.clear();
    this.completedTasks.clear();
  }
}
