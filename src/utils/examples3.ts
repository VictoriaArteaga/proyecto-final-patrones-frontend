/**
 * Ejemplos de Fase 3: Binary Search Tree y Doubly Linked List
 * 
 * Demuestra casos de uso reales en la aplicación Arq-AI 3D
 */

import {
  BinarySearchTree,
  ProjectDateIndex,
  ProjectNameIndex,
  DoublyLinkedList,
  ProjectGallery,
  ProjectCarousel
} from './index';

/**
 * Ejemplo 1: Búsqueda en árbol binario básica
 */
export function exampleBinarySearchTreeBasic() {
  console.log('=== BST Básico: Números ===');

  const bst = new BinarySearchTree<number>((a, b) => a - b);

  // Insertamos números aleatorios
  const numbers = [50, 30, 70, 20, 40, 60, 80];
  numbers.forEach(n => bst.insert(n));

  console.log('Insertados:', numbers);
  console.log('In-Order (ordenado):', bst.inOrder()); // [20, 30, 40, 50, 60, 70, 80]
  console.log('Pre-Order:', bst.preOrder());
  console.log('Post-Order:', bst.postOrder());

  // Búsqueda
  console.log('Buscar 40:', bst.search(40)); // 40
  console.log('Buscar 25:', bst.search(25)); // null

  // Minimo y maximo
  console.log('Min:', bst.getMin()); // 20
  console.log('Max:', bst.getMax()); // 80

  // Estadísticas
  console.log('Altura:', bst.getHeight()); // 2 o 3
  console.log('¿Balanceado?:', bst.isBalanced());
  console.log('Tamaño:', bst.getSize());
}

/**
 * Ejemplo 2: Índice de proyectos por fecha
 */
export function exampleProjectDateIndex() {
  console.log('\n=== Índice de Proyectos por Fecha ===');

  const dateIndex = new ProjectDateIndex();

  // Agregamos proyectos con fechas diferentes
  const projects = [
    {
      projectId: 'p1',
      projectName: 'Casa Moderna',
      createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 días atrás
      status: 'COMPLETED'
    },
    {
      projectId: 'p2',
      projectName: 'Villa Mediterránea',
      createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 días atrás
      status: 'COMPLETED'
    },
    {
      projectId: 'p3',
      projectName: 'Apartamento Urbano',
      createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 días atrás
      status: 'GENERATING_3D'
    },
    {
      projectId: 'p4',
      projectName: 'Casa Campestre',
      createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 día atrás
      status: 'COMPLETED'
    },
    {
      projectId: 'p5',
      projectName: 'Oficina Moderna',
      createdAt: Date.now(), // Hoy
      status: 'REVIEW_2D'
    }
  ];

  projects.forEach(p => dateIndex.addProject(p));

  // Obtener todos ordenados por fecha
  console.log('Todos (ordenados por fecha):');
  dateIndex.getAllSorted().forEach(p => {
    console.log(`  - ${p.projectName} (${new Date(p.createdAt).toLocaleDateString()})`);
  });

  // Proyectos recientes
  console.log('\nÚltimos 7 días:');
  const recent = dateIndex.getRecentProjects(7);
  console.log(`  ${recent.length} proyectos encontrados`);

  // Rango de fechas
  const startDate = Date.now() - 6 * 24 * 60 * 60 * 1000;
  const endDate = Date.now() - 1 * 24 * 60 * 60 * 1000;
  console.log('\nProyectos en rango (6-1 días atrás):');
  const rangeProjects = dateIndex.getProjectsByDateRange(startDate, endDate);
  rangeProjects.forEach(p => {
    console.log(`  - ${p.projectName}`);
  });

  // Información
  console.log('\nEstadísticas:', dateIndex.getStatistics());

  // Mostrar estructura
  console.log('\nEstructura del árbol:');
  console.log(dateIndex.visualize());
}

/**
 * Ejemplo 3: Índice de proyectos por nombre
 */
export function exampleProjectNameIndex() {
  console.log('\n=== Índice de Proyectos por Nombre ===');

  const nameIndex = new ProjectNameIndex();

  const projects = [
    { projectId: 'p1', projectName: 'Casa Moderna', createdAt: 0, status: 'COMPLETED' },
    { projectId: 'p2', projectName: 'Casa Colonial', createdAt: 0, status: 'COMPLETED' },
    { projectId: 'p3', projectName: 'Apartamento Urbano', createdAt: 0, status: 'GENERATING_3D' },
    { projectId: 'p4', projectName: 'Departamento Céntrico', createdAt: 0, status: 'COMPLETED' },
    { projectId: 'p5', projectName: 'Villa Campestre', createdAt: 0, status: 'REVIEW_2D' },
    { projectId: 'p6', projectName: 'Vivienda Ecológica', createdAt: 0, status: 'COMPLETED' }
  ];

  projects.forEach(p => nameIndex.addProject(p));

  // Búsqueda por prefijo
  console.log('Proyectos que comienzan con "Casa":');
  nameIndex.searchByPrefix('Casa').forEach(p => {
    console.log(`  - ${p.projectName}`);
  });

  console.log('\nProyectos que comienzan con "Vivienda":');
  nameIndex.searchByPrefix('Vivienda').forEach(p => {
    console.log(`  - ${p.projectName}`);
  });

  // Todos ordenados
  console.log('\nTodos (orden alfabético):');
  nameIndex.getAllSorted().forEach(p => {
    console.log(`  - ${p.projectName}`);
  });
}

/**
 * Ejemplo 4: Lista Doblemente Enlazada Básica
 */
export function exampleDoublyLinkedListBasic() {
  console.log('\n=== Lista Doblemente Enlazada Básica ===');

  const list = new DoublyLinkedList<string>();

  // Insertar
  list.insertAtEnd('Proyecto A');
  list.insertAtEnd('Proyecto B');
  list.insertAtEnd('Proyecto C');

  console.log('Lista:', list.toArray());

  // Insertar al inicio
  list.insertAtStart('Proyecto 0');
  console.log('Después de insertar al inicio:', list.toArray());

  // Insertar en posición
  list.insertAt('Proyecto 1.5', 2);
  console.log('Después de insertar en posición 2:', list.toArray());

  // Obtener
  console.log('Primer elemento:', list.getFirst());
  console.log('Último elemento:', list.getLast());
  console.log('Elemento en index 2:', list.getAt(2));

  // Búsqueda
  console.log('Encuentra "Proyecto B":', list.find(p => p === 'Proyecto B'));
  console.log('Índice de "Proyecto C":', list.indexOf(p => p === 'Proyecto C'));

  // Invertir
  list.reverse();
  console.log('Después de invertir:', list.toArray());

  // Tamaño
  console.log('Tamaño:', list.getSize());
}

/**
 * Ejemplo 5: Galería de Renders
 */
export function exampleProjectGallery() {
  console.log('\n=== Galería de Renders (Navegación Bidireccional) ===');

  const gallery = new ProjectGallery();

  // Agregar renders
  gallery.addItem({
    id: 'original1',
    type: 'original',
    url: '/images/original-photo.jpg',
    timestamp: Date.now(),
    description: 'Foto original del terreno'
  });

  gallery.addItem({
    id: 'render2d',
    type: '2D',
    url: '/renders/2d-design.png',
    timestamp: Date.now() + 1000,
    description: 'Render 2D aprobado'
  });

  gallery.addItem({
    id: 'render3d_v1',
    type: '3D',
    url: '/renders/3d-v1.glb',
    timestamp: Date.now() + 2000,
    description: 'Modelo 3D versión 1'
  });

  gallery.addItem({
    id: 'render3d_v2',
    type: '3D',
    url: '/renders/3d-v2.glb',
    timestamp: Date.now() + 3000,
    description: 'Modelo 3D versión 2 (mejorado)'
  });

  console.log('Cantidad total:', gallery.getItemCount());
  console.log('Item actual:', gallery.getCurrent()?.description);

  // Navegar
  console.log('\nNavegando hacia adelante:');
  gallery.goNext();
  console.log('Actual:', gallery.getCurrent()?.description);
  gallery.goNext();
  console.log('Actual:', gallery.getCurrent()?.description);

  // Navegar hacia atrás
  console.log('\nNavegando hacia atrás:');
  gallery.goPrev();
  console.log('Actual:', gallery.getCurrent()?.description);

  // Obtener por tipo
  console.log('\n3D Renders:', gallery.getItemsByType('3D').length);
  console.log('2D Renders:', gallery.getItemsByType('2D').length);

  // Controles
  console.log('\n¿Hay siguiente?', gallery.hasNext());
  gallery.goNext();
  gallery.goNext();
  console.log('¿Hay siguiente?', gallery.hasNext());
  console.log('¿Hay anterior?', gallery.hasPrev());
}

/**
 * Ejemplo 6: Carrusel de Proyectos
 */
export function exampleProjectCarousel() {
  console.log('\n=== Carrusel de Proyectos ===');

  const carousel = new ProjectCarousel(3); // Mostrar 3 items a la vez

  // Agregar proyectos
  const projectsData = [
    { projectId: 'p1', projectName: 'Casa Moderna', imageUrl: '/images/p1.jpg', status: 'COMPLETED' },
    { projectId: 'p2', projectName: 'Villa Campestre', imageUrl: '/images/p2.jpg', status: 'COMPLETED' },
    { projectId: 'p3', projectName: 'Apartamento', imageUrl: '/images/p3.jpg', status: 'COMPLETED' },
    { projectId: 'p4', projectName: 'Oficina', imageUrl: '/images/p4.jpg', status: 'REVIEW_2D' },
    { projectId: 'p5', projectName: 'Casa Ecológica', imageUrl: '/images/p5.jpg', status: 'GENERATING_3D' }
  ];

  projectsData.forEach(p => carousel.addProject(p));

  console.log('Total de proyectos:', carousel.getTotalCount());

  // Mostrar visibles
  console.log('\nProyectos visibles (Inicio):');
  carousel.getVisibleItems().forEach(p => console.log(`  - ${p.projectName}`));

  // Navegar
  console.log('\nNavegando al siguiente:');
  carousel.next();
  console.log('Actual:', carousel.getCurrent()?.projectName);
  carousel.getVisibleItems().forEach(p => console.log(`  - ${p.projectName}`));

  console.log('\nNavegando al siguiente:');
  carousel.next();
  carousel.getVisibleItems().forEach(p => console.log(`  - ${p.projectName}`));

  // Navegar hacia atrás
  console.log('\nNavegando hacia atrás:');
  carousel.prev();
  console.log('Actual:', carousel.getCurrent()?.projectName);
}

/**
 * Ejemplo 7: Búsqueda de Rango (Performance)
 */
export function exampleRangeSearch() {
  console.log('\n=== Búsqueda de Rango: Performance ===');

  const bst = new BinarySearchTree<number>((a, b) => a - b);

  // Insertamos 1000 números
  const numbers: number[] = [];
  for (let i = 0; i < 1000; i++) {
    numbers.push(Math.floor(Math.random() * 10000));
  }

  const insertStart = performance.now();
  numbers.forEach(n => bst.insert(n));
  const insertEnd = performance.now();

  console.log(`Insertados 1000 números en ${(insertEnd - insertStart).toFixed(2)}ms`);

  // Búsqueda de rango
  const rangeStart = performance.now();
  const inRange = bst.rangeSearch(2500, 7500);
  const rangeEnd = performance.now();

  console.log(`Búsqueda de rango [2500-7500] encontró ${inRange.length} números`);
  console.log(`Tiempo: ${(rangeEnd - rangeStart).toFixed(2)}ms`);

  // Comparar con array lineal
  const linearStart = performance.now();
  const linearResult = numbers.filter(n => n >= 2500 && n <= 7500);
  const linearEnd = performance.now();

  console.log(`Array lineal encontró ${linearResult.length} números en ${(linearEnd - linearStart).toFixed(2)}ms`);
}

/**
 * Ejemplo 8: Integración Fase 3
 */
export function examplePhase3Integration() {
  console.log('\n=== INTEGRACIÓN FASE 3: Sistema Completo ===\n');

  // Escenario: Usuario trabaja con múltiples proyectos
  console.log('1️⃣ Usuario crea varios proyectos...');
  const dateIndex = new ProjectDateIndex();

  for (let i = 0; i < 5; i++) {
    dateIndex.addProject({
      projectId: `proj${i}`,
      projectName: `Proyecto ${i + 1}`,
      createdAt: Date.now() - i * 24 * 60 * 60 * 1000,
      status: i % 2 === 0 ? 'COMPLETED' : 'GENERATING_3D'
    });
  }

  console.log(`✓ ${dateIndex.getStatistics().totalProjects} proyectos creados`);

  // Búsqueda rápida
  console.log('\n2️⃣ Usuario busca proyectos del último mes...');
  const recent = dateIndex.getRecentProjects(30);
  console.log(`✓ Encontrados ${recent.length} proyectos`);

  // Galería de renders
  console.log('\n3️⃣ Usuario visualiza proyecto con galería de renders...');
  const gallery = new ProjectGallery();

  gallery.addItem({
    id: 'orig',
    type: 'original',
    url: '/original.jpg',
    timestamp: Date.now(),
    description: 'Original'
  });

  gallery.addItem({
    id: '2d',
    type: '2D',
    url: '/2d.png',
    timestamp: Date.now() + 1000,
    description: 'Render 2D'
  });

  gallery.addItem({
    id: '3d',
    type: '3D',
    url: '/3d.glb',
    timestamp: Date.now() + 2000,
    description: 'Modelo 3D Final'
  });

  console.log(`✓ Galería con ${gallery.getItemCount()} items`);
  console.log(`  - Actual: ${gallery.getCurrent()?.description}`);

  // Carrusel para explorar
  console.log('\n4️⃣ Usuario explora proyectos en carrusel...');
  const carousel = new ProjectCarousel(3);

  for (let i = 0; i < 5; i++) {
    carousel.addProject({
      projectId: `p${i}`,
      projectName: `Casa ${String.fromCharCode(65 + i)}`,
      imageUrl: `/thumb${i}.jpg`,
      status: 'COMPLETED'
    });
  }

  console.log(`✓ Carrusel con ${carousel.getTotalCount()} proyectos`);
  carousel.next();
  console.log(`  - Mostrado: ${carousel.getCurrent()?.projectName}`);

  // Historial con búsqueda bidireccional
  console.log('\n5️⃣ Usuario navega por historial bidireccional...');
  const history = new DoublyLinkedList<string>();

  history.insertAtEnd('Vista: Dashboard');
  history.insertAtEnd('Vista: Nuevo Proyecto');
  history.insertAtEnd('Vista: 2D Review');
  history.insertAtEnd('Vista: 3D Generación');
  history.insertAtEnd('Vista: Galería Final');

  console.log(`✓ ${history.getSize()} vistas en historial`);
  console.log(`  - Actual: ${history.getLast()}`);

  console.log('\n✨ FASE 3 COMPLETADA - Sistema optimizado para búsqueda y navegación\n');
}
