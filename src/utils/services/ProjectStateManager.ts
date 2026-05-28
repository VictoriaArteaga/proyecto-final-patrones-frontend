/**
 * Gestor Real de Estados de Proyectos
 * Implementa la máquina de estados del backend de forma funcional
 * 
 * Estados sincronizados con el backend:
 * - IMAGE_UPLOADED
 * - GENERATING_2D
 * - WAITING_2D_APPROVAL
 * - REJECTED_2D
 * - GENERATING_2D_WITH_PARAMS
 * - WAITING_FINAL_APPROVAL
 * - GENERATING_3D_MODEL
 * - COMPLETED
 * - FAILED
 * - DELETED
 */

export enum ProjectStateEnum {
  IMAGE_UPLOADED = 'IMAGE_UPLOADED',
  GENERATING_2D = 'GENERATING_2D',
  WAITING_2D_APPROVAL = 'WAITING_2D_APPROVAL',
  REJECTED_2D = 'REJECTED_2D',
  GENERATING_2D_WITH_PARAMS = 'GENERATING_2D_WITH_PARAMS',
  WAITING_FINAL_APPROVAL = 'WAITING_FINAL_APPROVAL',
  GENERATING_3D_MODEL = 'GENERATING_3D_MODEL',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DELETED = 'DELETED'
}

export interface ProjectStateTransition {
  projectId: string;
  fromState: ProjectStateEnum;
  toState: ProjectStateEnum;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ProjectStateInfo {
  projectId: string;
  currentState: ProjectStateEnum;
  transitionHistory: ProjectStateTransition[];
  canTransitionTo: ProjectStateEnum[];
  lastUpdate: number;
}

/**
 * Mapeo de transiciones válidas del backend
 * Define qué estados pueden seguir a cada estado
 */
const STATE_TRANSITIONS: Record<ProjectStateEnum, ProjectStateEnum[]> = {
  [ProjectStateEnum.IMAGE_UPLOADED]: [
    ProjectStateEnum.GENERATING_2D,
    ProjectStateEnum.FAILED,
    ProjectStateEnum.DELETED
  ],
  [ProjectStateEnum.GENERATING_2D]: [
    ProjectStateEnum.WAITING_2D_APPROVAL,
    ProjectStateEnum.FAILED
  ],
  [ProjectStateEnum.WAITING_2D_APPROVAL]: [
    ProjectStateEnum.REJECTED_2D,
    ProjectStateEnum.GENERATING_2D_WITH_PARAMS,
    ProjectStateEnum.FAILED
  ],
  [ProjectStateEnum.REJECTED_2D]: [
    ProjectStateEnum.IMAGE_UPLOADED,
    ProjectStateEnum.GENERATING_2D,
    ProjectStateEnum.FAILED
  ],
  [ProjectStateEnum.GENERATING_2D_WITH_PARAMS]: [
    ProjectStateEnum.WAITING_FINAL_APPROVAL,
    ProjectStateEnum.FAILED
  ],
  [ProjectStateEnum.WAITING_FINAL_APPROVAL]: [
    ProjectStateEnum.GENERATING_3D_MODEL,
    ProjectStateEnum.REJECTED_2D,
    ProjectStateEnum.FAILED
  ],
  [ProjectStateEnum.GENERATING_3D_MODEL]: [
    ProjectStateEnum.COMPLETED,
    ProjectStateEnum.FAILED
  ],
  [ProjectStateEnum.COMPLETED]: [
    ProjectStateEnum.GENERATING_3D_MODEL, // Permitir regeneración
    ProjectStateEnum.DELETED
  ],
  [ProjectStateEnum.FAILED]: [
    ProjectStateEnum.IMAGE_UPLOADED,
    ProjectStateEnum.REJECTED_2D,
    ProjectStateEnum.DELETED
  ],
  [ProjectStateEnum.DELETED]: [] // Estado final, sin transiciones
};

/**
 * Gestor centralizado de estados para múltiples proyectos
 */
export class ProjectStateManager {
  private projectStates: Map<string, ProjectStateInfo> = new Map();

  /**
   * Inicializa el estado de un proyecto
   */
  initializeProject(
    projectId: string,
    initialState: ProjectStateEnum = ProjectStateEnum.IMAGE_UPLOADED
  ): ProjectStateInfo {
    const stateInfo: ProjectStateInfo = {
      projectId,
      currentState: initialState,
      transitionHistory: [],
      canTransitionTo: STATE_TRANSITIONS[initialState],
      lastUpdate: Date.now()
    };

    this.projectStates.set(projectId, stateInfo);
    return stateInfo;
  }

  /**
   * Valida si una transición es posible
   */
  canTransition(projectId: string, toState: ProjectStateEnum): boolean {
    const stateInfo = this.projectStates.get(projectId);
    if (!stateInfo) {
      return false;
    }

    return STATE_TRANSITIONS[stateInfo.currentState].includes(toState);
  }

  /**
   * Realiza una transición de estado
   */
  transition(
    projectId: string,
    toState: ProjectStateEnum,
    metadata?: Record<string, any>
  ): boolean {
    const stateInfo = this.projectStates.get(projectId);
    if (!stateInfo) {
      console.error(`Proyecto no encontrado: ${projectId}`);
      return false;
    }

    if (!this.canTransition(projectId, toState)) {
      console.error(
        `Transición inválida: ${stateInfo.currentState} -> ${toState}`
      );
      return false;
    }

    // Registrar transición
    const transition: ProjectStateTransition = {
      projectId,
      fromState: stateInfo.currentState,
      toState,
      timestamp: Date.now(),
      metadata
    };

    stateInfo.transitionHistory.push(transition);
    stateInfo.currentState = toState;
    stateInfo.canTransitionTo = STATE_TRANSITIONS[toState];
    stateInfo.lastUpdate = Date.now();

    return true;
  }

  /**
   * Obtiene el estado actual de un proyecto
   */
  getState(projectId: string): ProjectStateEnum | null {
    return this.projectStates.get(projectId)?.currentState ?? null;
  }

  /**
   * Obtiene información completa del estado
   */
  getStateInfo(projectId: string): ProjectStateInfo | null {
    return this.projectStates.get(projectId) ?? null;
  }

  /**
   * Obtiene el historial de transiciones de un proyecto
   */
  getHistory(projectId: string): ProjectStateTransition[] {
    return this.projectStates.get(projectId)?.transitionHistory ?? [];
  }

  /**
   * Obtiene qué transiciones son válidas ahora
   */
  getValidTransitions(projectId: string): ProjectStateEnum[] {
    return this.projectStates.get(projectId)?.canTransitionTo ?? [];
  }

  /**
   * Elimina un proyecto (limpia su historial)
   */
  deleteProject(projectId: string): void {
    this.projectStates.delete(projectId);
  }

  /**
   * Obtiene estadísticas de proyectos
   */
  getStatistics() {
    const stats = {
      totalProjects: this.projectStates.size,
      byState: {} as Record<ProjectStateEnum, number>,
      recentTransitions: [] as ProjectStateTransition[]
    };

    // Contar proyectos por estado
    for (const [, stateInfo] of this.projectStates) {
      const state = stateInfo.currentState;
      stats.byState[state] = (stats.byState[state] ?? 0) + 1;

      // Recopilar transiciones recientes
      if (stateInfo.transitionHistory.length > 0) {
        const lastTransition = stateInfo.transitionHistory[
          stateInfo.transitionHistory.length - 1
        ];
        stats.recentTransitions.push(lastTransition);
      }
    }

    // Ordenar transiciones recientes por timestamp
    stats.recentTransitions.sort((a, b) => b.timestamp - a.timestamp);

    return stats;
  }

  /**
   * Exportar estado completo para persistencia
   */
  export() {
    return Array.from(this.projectStates.values());
  }

  /**
   * Importar estado desde persistencia
   */
  import(states: ProjectStateInfo[]): void {
    states.forEach(stateInfo => {
      this.projectStates.set(stateInfo.projectId, stateInfo);
    });
  }
}

// Singleton global para uso en toda la aplicación
export const projectStateManager = new ProjectStateManager();
