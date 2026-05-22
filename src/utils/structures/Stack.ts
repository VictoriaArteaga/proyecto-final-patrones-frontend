/**
 * Implementación de una Pila (Stack) - LIFO (Last In, First Out)
 * 
 * Casos de uso en Arq-AI 3D:
 * - Undo/Redo de cambios en proyecto
 * - Navegación entre pasos del wizard
 * - Historial de acciones del usuario
 */

// Pila interna para UndoRedoManager
interface InternalStackNode<T> {
  data: T;
  next: InternalStackNode<T> | null;
}

class InternalStack<T> {
  private top: InternalStackNode<T> | null = null;
  private size: number = 0;

  push(data: T): void {
    const newNode: InternalStackNode<T> = {
      data,
      next: this.top
    };
    this.top = newNode;
    this.size++;
  }

  pop(): T | undefined {
    if (this.top === null) return undefined;
    const data = this.top.data;
    this.top = this.top.next;
    this.size--;
    return data;
  }

  peek(): T | undefined {
    return this.top?.data;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  getSize(): number {
    return this.size;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.top;
    while (current !== null) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  clear(): void {
    this.top = null;
    this.size = 0;
  }
}

/**
 * Estado de paso en el wizard
 */
export interface WizardStepState {
  step: number;
  name: string;
  projectId: string;
  timestamp: number;
  data: {
    projectName?: string;
    selectedFile?: File;
    image2DUrl?: string | null;
    model3DUrl?: string | null;
    status?: string;
  };
}

/**
 * Gestor de undo/redo para el wizard de proyecto
 */
export class UndoRedoManager {
  private undoStack: InternalStack<WizardStepState> = new InternalStack();
  private redoStack: InternalStack<WizardStepState> = new InternalStack();
  private currentState: WizardStepState | null = null;
  private maxHistory: number = 50;

  saveState(state: WizardStepState): void {
    if (this.currentState) {
      this.undoStack.push(this.currentState);

      if (this.undoStack.getSize() > this.maxHistory) {
        const temp: WizardStepState[] = [];
        while (!this.undoStack.isEmpty() && temp.length < this.maxHistory - 1) {
          const popped = this.undoStack.pop();
          if (popped) temp.push(popped);
        }
        this.undoStack.clear();
        for (let i = temp.length - 1; i >= 0; i--) {
          this.undoStack.push(temp[i]);
        }
      }
    }

    this.currentState = state;
    this.redoStack.clear();
  }

  undo(): WizardStepState | undefined {
    if (this.undoStack.isEmpty()) {
      return undefined;
    }

    if (this.currentState) {
      this.redoStack.push(this.currentState);
    }

    const previousState = this.undoStack.pop();
    if (previousState) {
      this.currentState = previousState;
    }

    return previousState;
  }

  redo(): WizardStepState | undefined {
    if (this.redoStack.isEmpty()) {
      return undefined;
    }

    if (this.currentState) {
      this.undoStack.push(this.currentState);
    }

    const nextState = this.redoStack.pop();
    if (nextState) {
      this.currentState = nextState;
    }

    return nextState;
  }

  getCurrentState(): WizardStepState | null {
    return this.currentState;
  }

  canUndo(): boolean {
    return !this.undoStack.isEmpty();
  }

  canRedo(): boolean {
    return !this.redoStack.isEmpty();
  }

  getHistory() {
    return {
      current: this.currentState,
      undoCount: this.undoStack.getSize(),
      redoCount: this.redoStack.getSize(),
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    };
  }

  clear(): void {
    this.undoStack.clear();
    this.redoStack.clear();
    this.currentState = null;
  }

  getUndoHistory(): WizardStepState[] {
    return this.undoStack.toArray();
  }

  getRedoHistory(): WizardStepState[] {
    return this.redoStack.toArray();
  }
}

/**
 * Gestor de navegación de pasos con Stack
 */
export class StepNavigationManager {
  private stepStack: InternalStack<number> = new InternalStack();
  private totalSteps: number;
  private currentStep: number = 0;

  constructor(totalSteps: number) {
    this.totalSteps = totalSteps;
  }

  goToStep(step: number): boolean {
    if (step < 0 || step >= this.totalSteps) {
      return false;
    }

    this.stepStack.push(this.currentStep);
    this.currentStep = step;
    return true;
  }

  goBack(): boolean {
    const previousStep = this.stepStack.pop();

    if (previousStep === undefined) {
      return false;
    }

    this.currentStep = previousStep;
    return true;
  }

  getCurrentStep(): number {
    return this.currentStep;
  }

  canGoBack(): boolean {
    return !this.stepStack.isEmpty();
  }

  getBreadcrumb(): number[] {
    const crumbs = this.stepStack.toArray();
    crumbs.unshift(this.currentStep);
    return crumbs.reverse();
  }

  reset(): void {
    this.stepStack.clear();
    this.currentStep = 0;
  }
}

/**
 * Pila con capacidad limitada
 */
export class BoundedStack<T> {
  private top: InternalStackNode<T> | null = null;
  private size: number = 0;
  private maxCapacity: number;

  constructor(maxCapacity: number = 100) {
    this.maxCapacity = maxCapacity;
  }

  push(data: T): void {
    if (this.size >= this.maxCapacity) {
      const temp: T[] = [];
      let current = this.top;
      while (current !== null && temp.length < this.maxCapacity - 1) {
        temp.push(current.data);
        current = current.next;
      }
      this.top = null;
      this.size = 0;
      for (let i = temp.length - 1; i >= 0; i--) {
        const newNode: InternalStackNode<T> = {
          data: temp[i],
          next: this.top
        };
        this.top = newNode;
        this.size++;
      }
    }

    const newNode: InternalStackNode<T> = {
      data,
      next: this.top
    };
    this.top = newNode;
    this.size++;
  }

  pop(): T | undefined {
    if (this.top === null) return undefined;
    const data = this.top.data;
    this.top = this.top.next;
    this.size--;
    return data;
  }

  peek(): T | undefined {
    return this.top?.data;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  getSize(): number {
    return this.size;
  }

  getMaxCapacity(): number {
    return this.maxCapacity;
  }

  setMaxCapacity(capacity: number): void {
    this.maxCapacity = capacity;
  }

  clear(): void {
    this.top = null;
    this.size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.top;
    while (current !== null) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }
}
