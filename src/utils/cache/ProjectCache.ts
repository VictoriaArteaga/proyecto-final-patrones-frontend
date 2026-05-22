/**
 * Sistema de Caché para Proyectos - Implementación usando HashMap
 * 
 * Beneficios:
 * - Búsqueda instantánea O(1)
 * - Reduce llamadas al API
 * - Mejora la experiencia del usuario
 * - Sincronización con servidor
 */

import type { ProjectResponseDTO } from '../../types/project.types';

/**
 * Metadatos de caché para un proyecto
 */
export interface CacheMetadata {
  cachedAt: number;
  expiresAt: number;
  hitCount: number;
  lastAccessed: number;
}

/**
 * Entrada en caché
 */
export interface CacheEntry<T> {
  data: T;
  metadata: CacheMetadata;
}

/**
 * Configuración del caché
 */
export interface CacheConfig {
  maxSize: number;
  defaultTTL: number; // Time To Live en milisegundos
  enableAutoCleanup: boolean;
  cleanupInterval: number;
}

/**
 * HashMap para caché de proyectos
 */
export class ProjectCache {
  private cache: Map<string, CacheEntry<ProjectResponseDTO>> = new Map();
  private config: CacheConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private statistics = {
    hits: 0,
    misses: 0,
    evictions: 0
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 100,
      defaultTTL: config.defaultTTL || 5 * 60 * 1000, // 5 minutos por defecto
      enableAutoCleanup: config.enableAutoCleanup !== false,
      cleanupInterval: config.cleanupInterval || 60 * 1000 // Cada minuto
    };

    if (this.config.enableAutoCleanup) {
      this.startAutoCleanup();
    }
  }

  /**
   * Almacena un proyecto en caché
   * Complejidad: O(1) amortizado
   */
  set(projectId: string, project: ProjectResponseDTO, ttl?: number): void {
    // Si llegamos al máximo, eviccionamos (FIFO simple)
    if (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      this.statistics.evictions++;
    }

    const now = Date.now();
    const entry: CacheEntry<ProjectResponseDTO> = {
      data: project,
      metadata: {
        cachedAt: now,
        expiresAt: now + (ttl || this.config.defaultTTL),
        hitCount: 0,
        lastAccessed: now
      }
    };

    this.cache.set(projectId, entry);
  }

  /**
   * Obtiene un proyecto del caché
   * Complejidad: O(1)
   */
  get(projectId: string): ProjectResponseDTO | undefined {
    const entry = this.cache.get(projectId);

    if (!entry) {
      this.statistics.misses++;
      return undefined;
    }

    // Verificar si ha expirado
    if (Date.now() > entry.metadata.expiresAt) {
      this.cache.delete(projectId);
      this.statistics.misses++;
      return undefined;
    }

    // Actualizar metadata
    entry.metadata.hitCount++;
    entry.metadata.lastAccessed = Date.now();
    this.statistics.hits++;

    return entry.data;
  }

  /**
   * Verifica si un proyecto está en caché
   * Complejidad: O(1)
   */
  has(projectId: string): boolean {
    const entry = this.cache.get(projectId);
    if (!entry) return false;

    // Verificar expiración
    if (Date.now() > entry.metadata.expiresAt) {
      this.cache.delete(projectId);
      return false;
    }

    return true;
  }

  /**
   * Elimina un proyecto del caché
   * Complejidad: O(1)
   */
  delete(projectId: string): boolean {
    return this.cache.delete(projectId);
  }

  /**
   * Limpia toda la caché
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Obtiene todos los proyectos en caché (array)
   * Complejidad: O(n)
   */
  getAll(): ProjectResponseDTO[] {
    const result: ProjectResponseDTO[] = [];
    
    this.cache.forEach((entry, projectId) => {
      // Verificar expiración
      if (Date.now() <= entry.metadata.expiresAt) {
        result.push(entry.data);
      } else {
        this.cache.delete(projectId);
      }
    });

    return result;
  }

  /**
   * Busca proyectos por predicado
   * Complejidad: O(n)
   */
  find(predicate: (project: ProjectResponseDTO) => boolean): ProjectResponseDTO[] {
    const result: ProjectResponseDTO[] = [];
    const now = Date.now();

    this.cache.forEach((entry, projectId) => {
      // Ignorar expirados
      if (now > entry.metadata.expiresAt) {
        this.cache.delete(projectId);
        return;
      }

      if (predicate(entry.data)) {
        result.push(entry.data);
      }
    });

    return result;
  }

  /**
   * Invalida la caché de un proyecto específico
   * (lo marca para que se recargue del servidor)
   */
  invalidate(projectId: string): void {
    this.delete(projectId);
  }

  /**
   * Invalida todos los proyectos del caché
   */
  invalidateAll(): void {
    this.clear();
  }

  /**
   * Limpia entradas expiradas
   * Complejidad: O(n)
   */
  cleanup(): void {
    const now = Date.now();
    let removed = 0;

    this.cache.forEach((entry, projectId) => {
      if (now > entry.metadata.expiresAt) {
        this.cache.delete(projectId);
        removed++;
      }
    });

    return removed;
  }

  /**
   * Inicia limpieza automática
   */
  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Detiene limpieza automática
   */
  stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Obtiene estadísticas del caché
   */
  getStatistics() {
    const total = this.statistics.hits + this.statistics.misses;
    const hitRate = total > 0 ? (this.statistics.hits / total) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hits: this.statistics.hits,
      misses: this.statistics.misses,
      hitRate: hitRate.toFixed(2) + '%',
      evictions: this.statistics.evictions,
      utilizationPercentage: ((this.cache.size / this.config.maxSize) * 100).toFixed(2) + '%'
    };
  }

  /**
   * Obtiene información detallada del caché
   */
  getDetailedInfo() {
    const entries: Record<string, any> = {};
    const now = Date.now();

    this.cache.forEach((entry, projectId) => {
      const isExpired = now > entry.metadata.expiresAt;
      entries[projectId] = {
        project: entry.data,
        metadata: {
          ...entry.metadata,
          expiresIn: isExpired ? 'EXPIRED' : `${Math.round((entry.metadata.expiresAt - now) / 1000)}s`,
          age: `${Math.round((now - entry.metadata.cachedAt) / 1000)}s`
        }
      };
    });

    return {
      statistics: this.getStatistics(),
      entries
    };
  }

  /**
   * Destructor: limpia recursos
   */
  destroy(): void {
    this.stopAutoCleanup();
    this.clear();
  }
}

/**
 * Cache por usuario (múltiples usuarios pueden tener distintos proyectos)
 */
export class UserProjectCacheManager {
  private userCaches: Map<string, ProjectCache> = new Map();
  private config: CacheConfig;

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      maxSize: config?.maxSize || 100,
      defaultTTL: config?.defaultTTL || 5 * 60 * 1000,
      enableAutoCleanup: config?.enableAutoCleanup !== false,
      cleanupInterval: config?.cleanupInterval || 60 * 1000
    };
  }

  /**
   * Obtiene o crea el caché de un usuario
   */
  getOrCreateCache(userId: string): ProjectCache {
    if (!this.userCaches.has(userId)) {
      this.userCaches.set(userId, new ProjectCache(this.config));
    }
    return this.userCaches.get(userId)!;
  }

  /**
   * Almacena un proyecto en caché del usuario
   */
  setProject(userId: string, projectId: string, project: ProjectResponseDTO): void {
    const cache = this.getOrCreateCache(userId);
    cache.set(projectId, project);
  }

  /**
   * Obtiene un proyecto del caché del usuario
   */
  getProject(userId: string, projectId: string): ProjectResponseDTO | undefined {
    const cache = this.userCaches.get(userId);
    return cache?.get(projectId);
  }

  /**
   * Obtiene todos los proyectos de un usuario
   */
  getAllProjects(userId: string): ProjectResponseDTO[] {
    const cache = this.userCaches.get(userId);
    return cache?.getAll() ?? [];
  }

  /**
   * Invalida caché de un usuario
   */
  invalidateUser(userId: string): void {
    const cache = this.userCaches.get(userId);
    if (cache) {
      cache.invalidateAll();
      this.userCaches.delete(userId);
    }
  }

  /**
   * Invalida caché de todos los usuarios
   */
  invalidateAll(): void {
    this.userCaches.forEach(cache => cache.destroy());
    this.userCaches.clear();
  }

  /**
   * Obtiene estadísticas de todos los cachés
   */
  getAllStatistics() {
    const stats: Record<string, any> = {};
    this.userCaches.forEach((cache, userId) => {
      stats[userId] = cache.getStatistics();
    });
    return stats;
  }
}
