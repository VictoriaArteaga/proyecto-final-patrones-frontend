/**
 * Servicio Real de Búsqueda y Filtrado de Proyectos
 * Usa Binary Search Tree para búsquedas eficientes
 */

import { BinarySearchTree } from '../structures/BinarySearchTree';
import type { ProjectResponseDTO } from '../../types/project.types';

export interface ProjectSearchIndex {
  byName: BinarySearchTree<ProjectSearchNode>;
  byDate: BinarySearchTree<ProjectSearchNode>;
  projectMap: Map<string, ProjectResponseDTO>;
}

export interface ProjectSearchNode {
  projectId: string;
  name?: string;
  createdAtTimestamp?: number;
}

/**
 * Servicio de búsqueda con índices de BST
 */
export class ProjectSearchService {
  private searchIndex: ProjectSearchIndex;

  constructor() {
    // Comparador para búsqueda por nombre (lexicográfico)
    const nameComparator = (a: ProjectSearchNode, b: ProjectSearchNode): number => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB);
    };

    // Comparador para búsqueda por fecha (numérico)
    const dateComparator = (a: ProjectSearchNode, b: ProjectSearchNode): number => {
      const dateA = a.createdAtTimestamp || 0;
      const dateB = b.createdAtTimestamp || 0;
      return dateA - dateB;
    };

    this.searchIndex = {
      byName: new BinarySearchTree(nameComparator),
      byDate: new BinarySearchTree(dateComparator),
      projectMap: new Map()
    };
  }

  /**
   * Indexa un proyecto para búsquedas rápidas
   */
  indexProject(project: ProjectResponseDTO): void {
    const createdAtTimestamp = new Date(project.createdAt).getTime();

    const nameNode: ProjectSearchNode = {
      projectId: project.id,
      name: project.name
    };

    const dateNode: ProjectSearchNode = {
      projectId: project.id,
      createdAtTimestamp
    };

    this.searchIndex.byName.insert(nameNode);
    this.searchIndex.byDate.insert(dateNode);
    this.searchIndex.projectMap.set(project.id, project);
  }

  /**
   * Indexa múltiples proyectos
   */
  indexProjects(projects: ProjectResponseDTO[]): void {
    projects.forEach(project => this.indexProject(project));
  }

  /**
   * Búsqueda exacta por nombre
   */
  searchByName(name: string): ProjectResponseDTO | null {
    const searchNode: ProjectSearchNode = {
      projectId: '',
      name
    };

    const result = this.searchIndex.byName.search(searchNode);
    if (result && result.projectId) {
      return this.searchIndex.projectMap.get(result.projectId) || null;
    }
    return null;
  }

  /**
   * Búsqueda parcial por nombre (por prefijo)
   */
  searchByNamePrefix(prefix: string): ProjectResponseDTO[] {
    const results: ProjectResponseDTO[] = [];

    // Obtener todos los proyectos y filtrar por prefijo
    for (const [, project] of this.searchIndex.projectMap) {
      if (project.name.toLowerCase().startsWith(prefix.toLowerCase())) {
        results.push(project);
      }
    }

    return results;
  }

  /**
   * Búsqueda por rango de fechas
   */
  searchByDateRange(
    startDate: Date,
    endDate: Date
  ): ProjectResponseDTO[] {
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    const minNode: ProjectSearchNode = {
      projectId: '',
      createdAtTimestamp: startTimestamp
    };

    const maxNode: ProjectSearchNode = {
      projectId: '',
      createdAtTimestamp: endTimestamp
    };

    // Nota: rangeSearch debe estar implementado en BST
    // Si no lo está, usar búsqueda lineal como fallback
    const results: ProjectResponseDTO[] = [];
    for (const [, project] of this.searchIndex.projectMap) {
      const projectDate = new Date(project.createdAt).getTime();
      if (projectDate >= startTimestamp && projectDate <= endTimestamp) {
        results.push(project);
      }
    }

    return results;
  }

  /**
   * Obtiene proyectos de los últimos N días
   */
  getRecentProjects(days: number): ProjectResponseDTO[] {
    const now = new Date();
    const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return this.searchByDateRange(past, now);
  }

  /**
   * Obtiene todos los proyectos ordenados por fecha (más recientes primero)
   */
  getAllByDateDescending(): ProjectResponseDTO[] {
    const projects = Array.from(this.searchIndex.projectMap.values());
    return projects.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Obtiene todos los proyectos ordenados por nombre
   */
  getAllByNameAscending(): ProjectResponseDTO[] {
    const projects = Array.from(this.searchIndex.projectMap.values());
    return projects.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Filtra proyectos por estado
   */
  filterByStatus(status: string): ProjectResponseDTO[] {
    const results: ProjectResponseDTO[] = [];
    for (const [, project] of this.searchIndex.projectMap) {
      if (project.status === status) {
        results.push(project);
      }
    }
    return results;
  }

  /**
   * Búsqueda combinada: nombre + estado
   */
  searchByNameAndStatus(
    name: string,
    status: string
  ): ProjectResponseDTO[] {
    return this.searchByNamePrefix(name).filter(p => p.status === status);
  }

  /**
   * Obtiene estadísticas de búsqueda
   */
  getIndexStatistics() {
    return {
      totalProjectsIndexed: this.searchIndex.projectMap.size,
      statuses: this.getStatusDistribution(),
      dateRange: this.getDateRange()
    };
  }

  /**
   * Distribución de proyectos por estado
   */
  private getStatusDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    for (const [, project] of this.searchIndex.projectMap) {
      distribution[project.status] =
        (distribution[project.status] || 0) + 1;
    }
    return distribution;
  }

  /**
   * Rango de fechas en el índice
   */
  private getDateRange() {
    if (this.searchIndex.projectMap.size === 0) {
      return { oldest: null, newest: null };
    }

    let oldest: ProjectResponseDTO | null = null;
    let newest: ProjectResponseDTO | null = null;
    let oldestTime = Infinity;
    let newestTime = -Infinity;

    for (const [, project] of this.searchIndex.projectMap) {
      const time = new Date(project.createdAt).getTime();
      if (time < oldestTime) {
        oldestTime = time;
        oldest = project;
      }
      if (time > newestTime) {
        newestTime = time;
        newest = project;
      }
    }

    return { oldest, newest };
  }

  /**
   * Limpia el índice
   */
  clear(): void {
    this.searchIndex.projectMap.clear();
    this.searchIndex.byName = new BinarySearchTree((a, b) =>
      (a.name || '').localeCompare(b.name || '')
    );
    this.searchIndex.byDate = new BinarySearchTree((a, b) =>
      (a.createdAtTimestamp || 0) - (b.createdAtTimestamp || 0)
    );
  }
}

// Singleton para uso global
export const projectSearchService = new ProjectSearchService();
