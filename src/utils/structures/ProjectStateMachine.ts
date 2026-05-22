/**
 * Máquina de Estados para Proyectos - Implementación usando Grafo
 * 
 * Estados posibles de un proyecto:
 * - PENDING: Esperando que se procese la imagen inicial
 * - GENERATING_2D: Generando render 2D
 * - REVIEW_2D: Esperando aprobación del usuario
 * - REJECTED_2D: Rechazado, esperando nueva imagen
 * - GENERATING_3D: Generando modelo 3D
 * - COMPLETED: Modelo 3D completado y listo
 * - ERROR: Error durante el proceso
 */

export enum ProjectStatus {
  PENDING = 'PENDING',
  GENERATING_2D = 'GENERATING_2D',
  REVIEW_2D = 'REVIEW_2D',
  REJECTED_2D = 'REJECTED_2D',
  GENERATING_3D = 'GENERATING_3D',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

/**
 * Evento de transición de estado
 */
export interface StateTransitionEvent {
  from: ProjectStatus;
  to: ProjectStatus;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Nodo del grafo de estados
 */
export interface StateNode {
  status: ProjectStatus;
  transitions: ProjectStatus[];
  description: string;
}

/**
 * Máquina de estados para gestionar transiciones válidas
 */
export class ProjectStateMachine {
  private stateGraph: Map<ProjectStatus, StateNode> = new Map();
  private transitionHistory: StateTransitionEvent[] = [];
  private currentState: ProjectStatus = ProjectStatus.PENDING;

  constructor() {
    this.initializeStateGraph();
  }

  /**
   * Inicializa el grafo de estados con todas las transiciones válidas
   */
  private initializeStateGraph(): void {
    const states: StateNode[] = [
      {
        status: ProjectStatus.PENDING,
        transitions: [ProjectStatus.GENERATING_2D, ProjectStatus.ERROR],
        description: 'Proyecto creado, esperando generar 2D'
      },
      {
        status: ProjectStatus.GENERATING_2D,
        transitions: [ProjectStatus.REVIEW_2D, ProjectStatus.ERROR],
        description: 'Generando render 2D con IA'
      },
      {
        status: ProjectStatus.REVIEW_2D,
        transitions: [ProjectStatus.REJECTED_2D, ProjectStatus.GENERATING_3D, ProjectStatus.ERROR],
        description: 'Esperando revisión y aprobación del usuario'
      },
      {
        status: ProjectStatus.REJECTED_2D,
        transitions: [ProjectStatus.PENDING, ProjectStatus.ERROR],
        description: 'Diseño 2D rechazado, volviendo a PENDING'
      },
      {
        status: ProjectStatus.GENERATING_3D,
        transitions: [ProjectStatus.COMPLETED, ProjectStatus.ERROR],
        description: 'Generando modelo 3D'
      },
      {
        status: ProjectStatus.COMPLETED,
        transitions: [], // Estado final
        description: 'Modelo 3D completado exitosamente'
      },
      {
        status: ProjectStatus.ERROR,
        transitions: [ProjectStatus.PENDING, ProjectStatus.REJECTED_2D],
        description: 'Error durante el proceso, opciones limitadas'
      }
    ];

    states.forEach(state => {
      this.stateGraph.set(state.status, state);
    });
  }

  /**
   * Verifica si una transición es válida
   * Complejidad: O(m) donde m es el número de transiciones del estado actual
   */
  isTransitionValid(fromStatus: ProjectStatus, toStatus: ProjectStatus): boolean {
    const stateNode = this.stateGraph.get(fromStatus);
    if (!stateNode) {
      return false;
    }
    return stateNode.transitions.includes(toStatus);
  }

  /**
   * Realiza una transición de estado si es válida
   * Retorna true si la transición fue exitosa, false en caso contrario
   */
  transition(toStatus: ProjectStatus, metadata?: Record<string, any>): boolean {
    if (!this.isTransitionValid(this.currentState, toStatus)) {
      console.error(
        `Transición inválida: ${this.currentState} → ${toStatus}`
      );
      return false;
    }

    const event: StateTransitionEvent = {
      from: this.currentState,
      to: toStatus,
      timestamp: Date.now(),
      metadata
    };

    this.transitionHistory.push(event);
    this.currentState = toStatus;
    return true;
  }

  /**
   * Obtiene el estado actual
   */
  getCurrentState(): ProjectStatus {
    return this.currentState;
  }

  /**
   * Obtiene las transiciones válidas desde el estado actual
   */
  getValidTransitions(): ProjectStatus[] {
    const stateNode = this.stateGraph.get(this.currentState);
    return stateNode?.transitions ?? [];
  }

  /**
   * Obtiene información del estado actual
   */
  getCurrentStateInfo() {
    const stateNode = this.stateGraph.get(this.currentState);
    return {
      status: this.currentState,
      description: stateNode?.description || 'Estado desconocido',
      validTransitions: this.getValidTransitions()
    };
  }

  /**
   * Obtiene el historial completo de transiciones
   */
  getHistory(): StateTransitionEvent[] {
    return [...this.transitionHistory];
  }

  /**
   * Obtiene la visualización del grafo de estados (para debugging)
   */
  getStateGraph(): Map<ProjectStatus, StateNode> {
    return new Map(this.stateGraph);
  }

  /**
   * Resetea la máquina al estado inicial
   */
  reset(): void {
    this.currentState = ProjectStatus.PENDING;
    this.transitionHistory = [];
  }

  /**
   * Obtiene descripción de un estado específico
   */
  getStateDescription(status: ProjectStatus): string {
    return this.stateGraph.get(status)?.description || 'Estado desconocido';
  }
}

/**
 * Gestor de máquinas de estado para múltiples proyectos
 */
export class ProjectStateMachineManager {
  private machines: Map<string, ProjectStateMachine> = new Map();

  /**
   * Crea una nueva máquina de estados para un proyecto
   */
  createMachine(projectId: string): ProjectStateMachine {
    const machine = new ProjectStateMachine();
    this.machines.set(projectId, machine);
    return machine;
  }

  /**
   * Obtiene la máquina de estados de un proyecto
   */
  getMachine(projectId: string): ProjectStateMachine | undefined {
    return this.machines.get(projectId);
  }

  /**
   * Realiza una transición en un proyecto específico
   */
  transition(
    projectId: string,
    toStatus: ProjectStatus,
    metadata?: Record<string, any>
  ): boolean {
    const machine = this.machines.get(projectId);
    if (!machine) {
      console.error(`Máquina de estados no encontrada para proyecto: ${projectId}`);
      return false;
    }
    return machine.transition(toStatus, metadata);
  }

  /**
   * Obtiene el estado actual de un proyecto
   */
  getCurrentState(projectId: string): ProjectStatus | undefined {
    return this.machines.get(projectId)?.getCurrentState();
  }

  /**
   * Obtiene las transiciones válidas para un proyecto
   */
  getValidTransitions(projectId: string): ProjectStatus[] {
    return this.machines.get(projectId)?.getValidTransitions() ?? [];
  }

  /**
   * Obtiene el historial completo de un proyecto
   */
  getProjectHistory(projectId: string): StateTransitionEvent[] {
    return this.machines.get(projectId)?.getHistory() ?? [];
  }

  /**
   * Verifica si una transición es válida para un proyecto
   */
  isTransitionValid(
    projectId: string,
    toStatus: ProjectStatus
  ): boolean {
    const machine = this.machines.get(projectId);
    if (!machine) return false;
    return machine.isTransitionValid(machine.getCurrentState(), toStatus);
  }

  /**
   * Elimina la máquina de estados de un proyecto
   */
  deleteMachine(projectId: string): boolean {
    return this.machines.delete(projectId);
  }

  /**
   * Obtiene todas las máquinas (para debugging)
   */
  getAllMachines(): Map<string, ProjectStateMachine> {
    return new Map(this.machines);
  }
}
