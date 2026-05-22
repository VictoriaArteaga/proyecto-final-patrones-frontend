/**
 * Implementación de una Pila (Stack) - LIFO (Last In, First Out)
 * 
 * Casos de uso en Arq-AI 3D:
 * - Undo/Redo de cambios en proyecto
 * - Navegación entre pasos del wizard
 * - Historial de acciones del usuario
 */

export interface StackNode<T> {
  data: T;
  next: StackNode<T> | null;
}

export class Stack<T> {
  private top: StackNode<T> | null = null;
  private size: number = 0;

  /**
   * Inserta elemento en la cima de la pila
   * Complejidad: O(1)
   */
  push(data: T): void {
    const newNode: StackNode<T> = {
      data,
      next: this.top
    };
    this.top = newNode;
    this.size++;
  }

  /**
   * Extrae elemento de la cima
   * Complejidad: O(1)
   */
  pop(): T | undefined {
    if (this.top === null) {
      return undefined;
    }

    const data = this.top.data;
    this.top = this.top.next;
    this.size--;
    return data;
  }

  /**
   * Obtiene elemento de la cima sin extraerlo
   * Complejidad: O(1)
   */
  peek(): T | undefined {
    return this.top?.data;
  }

  /**
   * Verifica si la pila está vacía
   */
  isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Obtiene el tamaño de la pila
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Convierte la pila en array (de cima a base)
   */
  toArray(): T[] {
    const result: T[] = [];
    let current = this.top;

    while (current !== null) {
      result.push(current.data);
      current = current.next;
    }

    return result;
  }

  /**
   * Limpia la pila
   */
  clear(): void {
    this.top = null;
    this.size = 0;
  }

  /**
   * Busca un elemento en la pila
   * Complejidad: O(n)
   */
  find(predicate: (data: T) => boolean): T | undefined {
    let current = this.top;

    while (current !== null) {
      if (predicate(current.data)) {
        return current.data;
      }
      current = current.next;
    }

    return undefined;
  }

  /**
   * Obtiene la posición de un elemento
   * Complejidad: O(n)
   */
  indexOf(predicate: (data: T) => boolean): number {
    let current = this.top;
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
  private undoStack: Stack<WizardStepState> = new Stack();
  private redoStack: Stack<WizardStepState> = new Stack();
  private currentState: WizardStepState | null = null;
  private maxHistory: number = 50;

  /**
   * Guarda un nuevo estado (y limpia el redo)
   */
  saveState(state: WizardStepState): void {
    // Guardar estado actual en undo
    if (this.currentState) {
      this.undoStack.push(this.currentState);
      
      // Limitar tamaño del historial
      if (this.undoStack.getSize() > this.maxHistory) {
        // Extraer desde la base (simulado, sacamos de cima y reconstruimos)
        const temp: WizardStepState[] = [];
        while (!this.undoStack.isEmpty() && temp.length < this.maxHistory - 1) {
          const popped = this.undoStack.pop();
          if (popped) temp.push(popped);
        }
        this.undoStack.clear();
        // Re-insertar en orden inverso (de más antiguo a más reciente)
        for (let i = temp.length - 1; i >= 0; i--) {
          this.undoStack.push(temp[i]);
        }
      }
    }

    this.currentState = state;
    
    // Limpiar redo cuando se guarda un nuevo estado
    this.redoStack.clear();
  }

  /**
   * Deshace la última acción
   */
  undo(): WizardStepState | undefined {
    if (this.undoStack.isEmpty()) {
      return undefined;
    }

    // Guardar estado actual en redo
    if (this.currentState) {
      this.redoStack.push(this.currentState);
    }

    // Obtener estado anterior
    const previousState = this.undoStack.pop();
    if (previousState) {
      this.currentState = previousState;
    }

    return previousState;
  }

  /**
   * Rehace la última acción desecha
   */
  redo(): WizardStepState | undefined {
    if (this.redoStack.isEmpty()) {
      return undefined;
    }

    // Guardar estado actual en undo
    if (this.currentState) {
      this.undoStack.push(this.currentState);
    }

    // Obtener estado siguiente
    const nextState = this.redoStack.pop();
    if (nextState) {
      this.currentState = nextState;
    }

    return nextState;
  }

  /**
   * Obtiene el estado actual
   */
  getCurrentState(): WizardStepState | null {
    return this.currentState;
  }

  /**
   * Verifica si se puede deshacer
   */
  canUndo(): boolean {
    return !this.undoStack.isEmpty();
  }

  /**
   * Verifica si se puede rehacer
   */
  canRedo(): boolean {
    return !this.redoStack.isEmpty();
  }

  /**
   * Obtiene información del historial
   */
  getHistory() {
    return {
      current: this.currentState,
      undoCount: this.undoStack.getSize(),
      redoCount: this.redoStack.getSize(),
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    };
  }

  /**
   * Limpia todo el historial
   */
  clear(): void {
    this.undoStack.clear();
    this.redoStack.clear();
    this.currentState = null;
  }

  /**
   * Obtiene toda la cadena de estados undo
   */
  getUndoHistory(): WizardStepState[] {
    return this.undoStack.toArray();
  }

  /**
   * Obtiene toda la cadena de estados redo
   */
  getRedoHistory(): WizardStepState[] {
    return this.redoStack.toArray();
  }
}

/**
 * Gestor de navegación de pasos con Stack
 */
export class StepNavigationManager {
  private stepStack: Stack<number> = new Stack();
  private totalSteps: number;
  private currentStep: number = 0;

  constructor(totalSteps: number) {
    this.totalSteps = totalSteps;
  }

  /**
   * Avanza a un paso siguiente
   */
  goToStep(step: number): boolean {
    if (step < 0 || step >= this.totalSteps) {
      return false;
    }

    // Guardar paso actual en stack
    this.stepStack.push(this.currentStep);
    this.currentStep = step;
    return true;
  }

  /**
   * Retrocede al paso anterior
   */
  goBack(): boolean {
    const previousStep = this.stepStack.pop();
    
    if (previousStep === undefined) {
      return false;
    }

    this.currentStep = previousStep;
    return true;
  }

  /**
   * Obtiene el paso actual
   */
  getCurrentStep(): number {
    return this.currentStep;
  }

  /**
   * Verifica si se puede retroceder
   */
  canGoBack(): boolean {
    return !this.stepStack.isEmpty();
  }

  /**
   * Obtiene el camino recorrido (stack de pasos)
   */
  getBreadcrumb(): number[] {
    const crumbs = this.stepStack.toArray();
    crumbs.unshift(this.currentStep); // Agregar paso actual al inicio
    return crumbs.reverse(); // Invertir para mostrar en orden cronológico
  }

  /**
   * Reinicia navegación
   */
  reset(): void {
    this.stepStack.clear();
    this.currentStep = 0;
  }
}

/**
 * Pila con capacidad limitada (para no crecer infinitamente)
 */
export class BoundedStack<T> extends Stack<T> {
  private maxCapacity: number;

  constructor(maxCapacity: number = 100) {
    super();
    this.maxCapacity = maxCapacity;
  }

  push(data: T): void {
    if (this.getSize() >= this.maxCapacity) {
      // Al alcanzar capacidad máxima, eliminar elemento de la base
      // Simulamos esto extrayendo todos y re-insertando
      const temp: T[] = [];
      while (!this.isEmpty()) {
        const popped = this.pop();
        if (popped !== undefined) temp.push(popped);
      }

      // Re-insertar todos excepto el más viejo
      for (let i = 1; i < temp.length; i++) {
        super.push(temp[i]);
      }
    }

    super.push(data);
  }

  getMaxCapacity(): number {
    return this.maxCapacity;
  }

  setMaxCapacity(capacity: number): void {
    this.maxCapacity = capacity;
  }
}
