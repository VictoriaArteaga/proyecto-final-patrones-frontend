/**
 * INTEGRATION GUIDE - FASE 3
 * 
 * Cómo integrar Binary Search Tree, DoublyLinkedList y derivados
 * en componentes React reales de Arq-AI 3D
 */

// ============================================================================
// 1. INTEGRACIÓN EN SERVICES (project.service.ts)
// ============================================================================

import {
  ProjectDateIndex,
  ProjectNameIndex,
  type IndexedProject
} from '@/utils';

// Singleton instance
const projectDateIndex = new ProjectDateIndex();
const projectNameIndex = new ProjectNameIndex();

// Cachar proyectos al cargar
export async function initializeProjectIndexes() {
  const projects = await api.get('/projects');
  
  projects.forEach((p: any) => {
    const indexed: IndexedProject = {
      projectId: p.id,
      projectName: p.name,
      createdAt: new Date(p.createdAt).getTime(),
      status: p.status
    };
    
    projectDateIndex.addProject(indexed);
    projectNameIndex.addProject(indexed);
  });
}

// Búsqueda rápida
export function searchProjectsByDate(days: number) {
  return projectDateIndex.getRecentProjects(days);
}

export function searchProjectsByName(prefix: string) {
  return projectNameIndex.searchByPrefix(prefix);
}

// Rango de fechas
export function searchProjectsByDateRange(startDate: number, endDate: number) {
  return projectDateIndex.getProjectsByDateRange(startDate, endDate);
}

// ============================================================================
// 2. INTEGRACIÓN EN DASHBOARD.TSX
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  searchProjectsByDate,
  searchProjectsByDateRange
} from '@/services/project.service';
import { ProjectCarousel } from '@/utils';

export function DashboardPage() {
  const [carousel, setCarousel] = useState<ProjectCarousel | null>(null);
  const [recentCount, setRecentCount] = useState(0);

  useEffect(() => {
    // Inicializar carrusel con proyectos recientes
    const carousel = new ProjectCarousel(4);
    
    const recent = searchProjectsByDate(30); // últimos 30 días
    recent.forEach(proj => {
      carousel.addProject({
        projectId: proj.projectId,
        projectName: proj.projectName,
        imageUrl: `/images/project-${proj.projectId}.jpg`,
        status: proj.status
      });
    });

    setCarousel(carousel);
    setRecentCount(recent.length);
  }, []);

  const handleNextProject = () => {
    carousel?.next();
    setCarousel(carousel ? { ...carousel } : null);
  };

  const handlePrevProject = () => {
    carousel?.prev();
    setCarousel(carousel ? { ...carousel } : null);
  };

  if (!carousel) return <div>Cargando...</div>;

  const visible = carousel.getVisibleItems();
  const currentPos = carousel.getCurrentPosition();

  return (
    <div className="dashboard">
      <h1>Mis Proyectos ({recentCount})</h1>

      {/* Carrusel */}
      <div className="carousel-container">
        <button
          onClick={handlePrevProject}
          disabled={visible.length === 0}
        >
          ← Anterior
        </button>

        <div className="carousel-items">
          {visible.map((project) => (
            <div key={project.projectId} className="carousel-item">
              <img src={project.imageUrl} alt={project.projectName} />
              <h3>{project.projectName}</h3>
              <span className="status">{project.status}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleNextProject}
          disabled={visible.length === 0}
        >
          Siguiente →
        </button>
      </div>

      {/* Indicadores */}
      <div className="carousel-info">
        Mostrando {currentPos + 1} de {carousel.getTotalCount()}
      </div>

      {/* Vista en Timeline */}
      <section className="timeline">
        <h2>Timeline</h2>
        <div className="timeline-items">
          {visible.map((project) => (
            <div key={project.projectId} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>{project.projectName}</h4>
                <p>Status: {project.status}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// 3. INTEGRACIÓN EN SEARCH/FILTRO
// ============================================================================

import { useCallback, useState } from 'react';
import { searchProjectsByName, searchProjectsByDate } from '@/services/project.service';

export function ProjectSearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'recent'>('all');

  // Búsqueda por nombre - autocompletar
  const handleSearch = useCallback((value: string) => {
    setQuery(value);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    // BST prefix search: O(log n + k) muy rápido
    const results = searchProjectsByName(value);
    setSuggestions(results);
  }, []);

  // Filtro por fecha
  const handleFilter = useCallback((type: 'all' | 'recent') => {
    setFilter(type);
    if (type === 'recent') {
      const recent = searchProjectsByDate(7); // últimos 7 días
      setSuggestions(recent);
    } else {
      setSuggestions([]);
    }
  }, []);

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Buscar proyectos..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {/* Filtros */}
      <div className="filters">
        <button
          onClick={() => handleFilter('all')}
          className={filter === 'all' ? 'active' : ''}
        >
          Todos
        </button>
        <button
          onClick={() => handleFilter('recent')}
          className={filter === 'recent' ? 'active' : ''}
        >
          Últimos 7 días
        </button>
      </div>

      {/* Sugerencias */}
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((suggestion) => (
            <div key={suggestion.projectId} className="suggestion-item">
              <span className="name">{suggestion.projectName}</span>
              <span className="date">
                {new Date(suggestion.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 4. INTEGRACIÓN EN PROJECT DETAIL (GALERÍA)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { ProjectGallery, type GalleryItem } from '@/utils';

export function ProjectGalleryView({ projectId }: { projectId: string }) {
  const [gallery, setGallery] = useState<ProjectGallery | null>(null);
  const [currentItem, setCurrentItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    // Crear galería y cargar renders
    const gallery = new ProjectGallery();

    // Items en orden: Original → 2D → 3D
    gallery.addItem({
      id: `${projectId}-original`,
      type: 'original',
      url: `/api/projects/${projectId}/original`,
      timestamp: Date.now(),
      description: 'Foto original del terreno'
    });

    gallery.addItem({
      id: `${projectId}-2d`,
      type: '2D',
      url: `/api/projects/${projectId}/render-2d`,
      timestamp: Date.now() + 1000,
      description: 'Render 2D aprobado'
    });

    gallery.addItem({
      id: `${projectId}-3d`,
      type: '3D',
      url: `/api/projects/${projectId}/model-3d`,
      timestamp: Date.now() + 2000,
      description: 'Modelo 3D final'
    });

    setGallery(gallery);
    setCurrentItem(gallery.getCurrent());
  }, [projectId]);

  const handleNext = () => {
    if (!gallery) return;
    gallery.goNext();
    setCurrentItem(gallery.getCurrent());
  };

  const handlePrev = () => {
    if (!gallery) return;
    gallery.goPrev();
    setCurrentItem(gallery.getCurrent());
  };

  if (!currentItem || !gallery) return <div>Cargando galería...</div>;

  const position = gallery.getCurrentPosition() + 1;
  const total = gallery.getItemCount();

  return (
    <div className="gallery-container">
      {/* Imagen principal */}
      <div className="gallery-main">
        <img
          src={currentItem.url}
          alt={currentItem.description}
          className={`render-${currentItem.type}`}
        />
      </div>

      {/* Descripción */}
      <div className="gallery-info">
        <h3>{currentItem.description}</h3>
        <p className="render-type">Tipo: {currentItem.type.toUpperCase()}</p>
        <p className="counter">
          {position} de {total}
        </p>
      </div>

      {/* Controles navegación */}
      <div className="gallery-controls">
        <button
          onClick={handlePrev}
          disabled={!gallery.hasPrev()}
          className="btn-prev"
        >
          ← Anterior
        </button>

        <button
          onClick={handleNext}
          disabled={!gallery.hasNext()}
          className="btn-next"
        >
          Siguiente →
        </button>
      </div>

      {/* Thumbnails */}
      <div className="gallery-thumbnails">
        {gallery.getAllItems().map((item, idx) => (
          <div
            key={item.id}
            className={`thumbnail ${item.id === currentItem.id ? 'active' : ''}`}
            onClick={() => {
              gallery.goToItem((i) => i.id === item.id);
              setCurrentItem(gallery.getCurrent());
            }}
          >
            <img src={item.url} alt={item.description} />
            <span className="index">{idx + 1}</span>
          </div>
        ))}
      </div>

      {/* Filtro por tipo */}
      <div className="gallery-filter">
        <button className="btn-filter active">Todos</button>
        <button className="btn-filter">
          2D ({gallery.getItemsByType('2D').length})
        </button>
        <button className="btn-filter">
          3D ({gallery.getItemsByType('3D').length})
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 5. INTEGRACIÓN EN LAYOUT (Manejo Global)
// ============================================================================

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { initializeProjectIndexes } from '@/services/project.service';

export function LayoutWithIndexes({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Inicializar indexadores al autenticar
      initializeProjectIndexes().catch(console.error);
    }
  }, [user]);

  return (
    <div className="layout">
      <Header />
      <Sidebar />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}

// ============================================================================
// 6. CUSTOM HOOK: useProjectSearch
// ============================================================================

import { useCallback, useMemo, useState } from 'react';

export function useProjectSearch() {
  const [query, setQuery] = useState('');
  const [dateRange, setDateRange] = useState<{
    start: number;
    end: number;
  } | null>(null);

  const results = useMemo(() => {
    if (query) {
      // Búsqueda por nombre
      return searchProjectsByName(query);
    }

    if (dateRange) {
      // Búsqueda por rango de fechas
      return searchProjectsByDateRange(dateRange.start, dateRange.end);
    }

    return [];
  }, [query, dateRange]);

  const search = useCallback((q: string) => {
    setQuery(q);
    setDateRange(null);
  }, []);

  const filterByDate = useCallback((days: number) => {
    const end = Date.now();
    const start = end - days * 24 * 60 * 60 * 1000;
    setDateRange({ start, end });
    setQuery('');
  }, []);

  const reset = useCallback(() => {
    setQuery('');
    setDateRange(null);
  }, []);

  return {
    query,
    results,
    search,
    filterByDate,
    reset,
    hasResults: results.length > 0
  };
}

// Uso:
// const { results, search, filterByDate } = useProjectSearch();
// <input onChange={(e) => search(e.target.value)} />
// <button onClick={() => filterByDate(7)}>Últimos 7 días</button>

// ============================================================================
// 7. PERFS - Monitoreo de Performance
// ============================================================================

export function logPerformanceMetrics() {
  const metrics = {
    dateIndex: projectDateIndex.getStatistics(),
    nameIndex: projectNameIndex.getStatistics(),
    timestamp: Date.now()
  };

  console.table({
    'Date Index Projects': metrics.dateIndex.totalProjects,
    'Date Index Height': metrics.dateIndex.treeHeight,
    'Date Index Balanced': metrics.dateIndex.isBalanced,
    'Name Index Projects': metrics.nameIndex.totalProjects,
    'Name Index Height': metrics.nameIndex.treeHeight,
    'Name Index Balanced': metrics.nameIndex.isBalanced
  });

  // Enviar a analytics
  if (window.analytics) {
    window.analytics.track('indices_performance', metrics);
  }
}

// Llamar cada 5 minutos o en eventos importantes
// setInterval(logPerformanceMetrics, 5 * 60 * 1000);
