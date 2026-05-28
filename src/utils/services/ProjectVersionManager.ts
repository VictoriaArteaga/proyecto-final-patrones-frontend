/**
 * Servicio Real de Versiones de Proyectos
 * Gestiona las múltiples versiones de renders y modelos 3D
 */

import { LinkedList } from '../structures/LinkedList';
import { DoublyLinkedList } from '../structures/DoublyLinkedList';

export interface ProjectVersionInfo {
  versionNumber: number;
  image2DUrl?: string;
  model3DUrl?: string;
  description?: string;
  createdAt: number;
  approved: boolean;
  metadata?: Record<string, any>;
}

export interface VersionNavigationContext {
  currentVersion: ProjectVersionInfo;
  canGoPrevious: boolean;
  canGoNext: boolean;
  totalVersions: number;
  progress: number;
}

/**
 * Gestor de versiones de proyectos
 * Mantiene múltiples versiones de renders y permite navegar entre ellas
 */
export class ProjectVersionManager {
  // LinkedList para auditoría de todas las versiones (histórico completo)
  private versionHistories: Map<string, LinkedList<ProjectVersionInfo>> =
    new Map();

  // DoublyLinkedList para navegación bidireccional actual
  private currentNavigations: Map<string, DoublyLinkedList<ProjectVersionInfo>> =
    new Map();

  // Índice de posición actual en cada proyecto
  private currentPositions: Map<string, number> = new Map();

  /**
   * Crea un nuevo proyecto sin versiones
   */
  createProject(projectId: string): void {
    if (!this.versionHistories.has(projectId)) {
      this.versionHistories.set(projectId, new LinkedList());
      this.currentNavigations.set(projectId, new DoublyLinkedList());
      this.currentPositions.set(projectId, -1);
    }
  }

  /**
   * Agrega una nueva versión a un proyecto
   */
  addVersion(projectId: string, version: ProjectVersionInfo): void {
    if (!this.versionHistories.has(projectId)) {
      this.createProject(projectId);
    }

    // Agregar al histórico (LinkedList)
    const history = this.versionHistories.get(projectId)!;
    history.insertAtEnd(version);

    // Agregar a la navegación actual (DoublyLinkedList)
    const navigation = this.currentNavigations.get(projectId)!;
    navigation.insertAtEnd(version);

    // Actualizar posición actual
    this.currentPositions.set(projectId, this.getVersionCount(projectId) - 1);
  }

  /**
   * Obtiene una versión específica
   */
  getVersion(projectId: string, versionNumber: number): ProjectVersionInfo | null {
    const history = this.versionHistories.get(projectId);
    if (!history) return null;

    let current: ProjectVersionInfo | null = null;
    history.traverse(version => {
      if (version.versionNumber === versionNumber) {
        current = version;
      }
    });

    return current;
  }

  /**
   * Obtiene el total de versiones
   */
  getVersionCount(projectId: string): number {
    const history = this.versionHistories.get(projectId);
    if (!history) return 0;

    let count = 0;
    history.traverse(() => {
      count++;
    });

    return count;
  }

  /**
   * Obtiene todas las versiones de un proyecto
   */
  getAllVersions(projectId: string): ProjectVersionInfo[] {
    const history = this.versionHistories.get(projectId);
    if (!history) return [];

    const versions: ProjectVersionInfo[] = [];
    history.traverse(version => {
      versions.push(version);
    });

    return versions;
  }

  /**
   * Navega a la siguiente versión
   */
  navigateToNext(projectId: string): ProjectVersionInfo | null {
    const position = this.currentPositions.get(projectId) ?? -1;
    const count = this.getVersionCount(projectId);

    if (position < count - 1) {
      this.currentPositions.set(projectId, position + 1);
      return this.getCurrentVersion(projectId);
    }

    return null;
  }

  /**
   * Navega a la versión anterior
   */
  navigateToPrevious(projectId: string): ProjectVersionInfo | null {
    const position = this.currentPositions.get(projectId) ?? -1;

    if (position > 0) {
      this.currentPositions.set(projectId, position - 1);
      return this.getCurrentVersion(projectId);
    }

    return null;
  }

  /**
   * Navega a una versión específica
   */
  navigateToVersion(projectId: string, versionNumber: number): ProjectVersionInfo | null {
    const versions = this.getAllVersions(projectId);
    const index = versions.findIndex(v => v.versionNumber === versionNumber);

    if (index !== -1) {
      this.currentPositions.set(projectId, index);
      return versions[index];
    }

    return null;
  }

  /**
   * Obtiene la versión actual
   */
  getCurrentVersion(projectId: string): ProjectVersionInfo | null {
    const position = this.currentPositions.get(projectId) ?? -1;
    const versions = this.getAllVersions(projectId);

    if (position >= 0 && position < versions.length) {
      return versions[position];
    }

    return null;
  }

  /**
   * Obtiene contexto de navegación actual
   */
  getNavigationContext(projectId: string): VersionNavigationContext | null {
    const current = this.getCurrentVersion(projectId);
    if (!current) return null;

    const position = this.currentPositions.get(projectId) ?? -1;
    const total = this.getVersionCount(projectId);

    return {
      currentVersion: current,
      canGoPrevious: position > 0,
      canGoNext: position < total - 1,
      totalVersions: total,
      progress: total > 0 ? ((position + 1) / total) * 100 : 0
    };
  }

  /**
   * Obtiene las últimas N versiones
   */
  getRecentVersions(projectId: string, count: number): ProjectVersionInfo[] {
    const versions = this.getAllVersions(projectId);
    return versions.slice(Math.max(0, versions.length - count));
  }

  /**
   * Obtiene versiones aprobadas
   */
  getApprovedVersions(projectId: string): ProjectVersionInfo[] {
    return this.getAllVersions(projectId).filter(v => v.approved);
  }

  /**
   * Obtiene versiones pendientes de aprobación
   */
  getPendingApprovalVersions(projectId: string): ProjectVersionInfo[] {
    return this.getAllVersions(projectId).filter(v => !v.approved);
  }

  /**
   * Marca una versión como aprobada
   */
  approveVersion(projectId: string, versionNumber: number): boolean {
    const version = this.getVersion(projectId, versionNumber);
    if (version) {
      version.approved = true;
      return true;
    }
    return false;
  }

  /**
   * Comparación entre dos versiones
   */
  compareVersions(
    projectId: string,
    version1Number: number,
    version2Number: number
  ): { v1: ProjectVersionInfo; v2: ProjectVersionInfo; differences: string[] } | null {
    const v1 = this.getVersion(projectId, version1Number);
    const v2 = this.getVersion(projectId, version2Number);

    if (!v1 || !v2) return null;

    const differences: string[] = [];

    if (v1.image2DUrl !== v2.image2DUrl) {
      differences.push('Imagen 2D diferente');
    }
    if (v1.model3DUrl !== v2.model3DUrl) {
      differences.push('Modelo 3D diferente');
    }
    if (v1.approved !== v2.approved) {
      differences.push('Estado de aprobación diferente');
    }

    return { v1, v2, differences };
  }

  /**
   * Obtiene estadísticas de versiones
   */
  getVersionStatistics(projectId: string) {
    const versions = this.getAllVersions(projectId);
    if (versions.length === 0) {
      return {
        totalVersions: 0,
        approvedVersions: 0,
        pendingVersions: 0,
        averageCreationInterval: 0,
        timelineMs: 0
      };
    }

    const approved = versions.filter(v => v.approved).length;
    const pending = versions.length - approved;
    const timelineMs =
      versions[versions.length - 1].createdAt - versions[0].createdAt;

    return {
      totalVersions: versions.length,
      approvedVersions: approved,
      pendingVersions: pending,
      averageCreationInterval:
        versions.length > 1 ? timelineMs / (versions.length - 1) : 0,
      timelineMs
    };
  }

  /**
   * Elimina una versión específica
   */
  removeVersion(projectId: string, versionNumber: number): boolean {
    const versions = this.getAllVersions(projectId);
    const index = versions.findIndex(v => v.versionNumber === versionNumber);

    if (index !== -1) {
      // Reconstruir listas sin la versión eliminada
      const newVersions = versions.filter(v => v.versionNumber !== versionNumber);
      
      this.versionHistories.set(projectId, new LinkedList());
      this.currentNavigations.set(projectId, new DoublyLinkedList());

      newVersions.forEach(v => {
        this.versionHistories.get(projectId)!.insertAtEnd(v);
        this.currentNavigations.get(projectId)!.insertAtEnd(v);
      });

      return true;
    }

    return false;
  }

  /**
   * Limpia el historial de un proyecto
   */
  clearProject(projectId: string): void {
    this.versionHistories.delete(projectId);
    this.currentNavigations.delete(projectId);
    this.currentPositions.delete(projectId);
  }
}

// Singleton global
export const projectVersionManager = new ProjectVersionManager();
