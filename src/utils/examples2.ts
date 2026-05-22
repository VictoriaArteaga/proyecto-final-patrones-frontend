/**
 * Ejemplos de uso de las estructuras de datos de Fase 2
 * 
 * Este archivo muestra cómo utilizar:
 * - Stack: Undo/Redo y navegación
 * - LinkedList: Historial y versiones
 */

import { 
  Stack, 
  UndoRedoManager, 
  StepNavigationManager, 
  BoundedStack,
  type WizardStepState 
} from './structures/Stack';
import { 
  LinkedList, 
  ProjectHistory, 
  ProjectVersions,
  type ProjectHistoryItem 
} from './structures/LinkedList';

/**
 * ==========================================
 * EJEMPLO 1: Stack Básico
 * ==========================================
 */
export function exampleStackBasic() {
  const stack = new Stack<number>();

  // Meter elementos
  stack.push(10);
  stack.push(20);
  stack.push(30);

  console.log('Stack:', stack.toArray()); // [30, 20, 10]
  console.log('Cima:', stack.peek()); // 30

  // Sacar elementos
  console.log('Pop:', stack.pop()); // 30
  console.log('Stack después:', stack.toArray()); // [20, 10]
  console.log('Tamaño:', stack.getSize()); // 2
  console.log('¿Vacío?', stack.isEmpty()); // false

  // Buscar
  const found = stack.find(x => x === 20);
  console.log('Encontrado 20:', found); // 20

  const index = stack.indexOf(x => x === 10);
  console.log('Índice de 10:', index); // 1 (desde cima)
}

/**
 * ==========================================
 * EJEMPLO 2: Undo/Redo en Wizard
 * ==========================================
 */
export function exampleUndoRedo() {
  const undoRedo = new UndoRedoManager();

  // Paso 1: Usuario nombra proyecto
  const step1: WizardStepState = {
    step: 0,
    name: 'Nombre del Proyecto',
    projectId: 'proj-001',
    timestamp: Date.now(),
    data: {
      projectName: 'Mi Casa'
    }
  };

  undoRedo.saveState(step1);
  console.log('Estado guardado:', undoRedo.getCurrentState()?.data.projectName);
  // Output: Mi Casa

  // Paso 2: Usuario sube foto
  const step2: WizardStepState = {
    step: 1,
    name: 'Subir Fotografía',
    projectId: 'proj-001',
    timestamp: Date.now(),
    data: {
      projectName: 'Mi Casa',
      selectedFile: new File([], 'house.jpg')
    }
  };

  undoRedo.saveState(step2);
  console.log('Foto subida:', undoRedo.getCurrentState()?.data.selectedFile?.name);
  // Output: house.jpg

  // Paso 3: Usuario genera 2D
  const step3: WizardStepState = {
    step: 2,
    name: 'Render 2D',
    projectId: 'proj-001',
    timestamp: Date.now(),
    data: {
      projectName: 'Mi Casa',
      image2DUrl: 'https://api.example.com/2d.png',
      status: 'REVIEW_2D'
    }
  };

  undoRedo.saveState(step3);
  console.log('2D generado:', undoRedo.getCurrentState()?.data.image2DUrl);
  // Output: https://api.example.com/2d.png

  // Ahora usuario desiste y hace UNDO
  console.log('\n=== UNDO ===');
  console.log('¿Puedo deshacer?', undoRedo.canUndo()); // true
  const undone = undoRedo.undo();
  console.log('Después de undo:', undone?.step); // 1 (volvió a foto)

  console.log('¿Puedo rehacer?', undoRedo.canRedo()); // true
  const redone = undoRedo.redo();
  console.log('Después de redo:', redone?.step); // 2 (volvió a 2D)

  // Ver historial
  console.log('\nHistorial:', undoRedo.getHistory());
}

/**
 * ==========================================
 * EJEMPLO 3: Navegación entre Pasos
 * ==========================================
 */
export function exampleStepNavigation() {
  const nav = new StepNavigationManager(4); // 4 pasos totales

  console.log('Paso inicial:', nav.getCurrentStep()); // 0

  // Ir al paso 1
  nav.goToStep(1);
  console.log('Ahora en paso:', nav.getCurrentStep()); // 1
  console.log('Breadcrumb:', nav.getBreadcrumb()); // [0, 1]

  // Ir al paso 3
  nav.goToStep(3);
  console.log('Ahora en paso:', nav.getCurrentStep()); // 3
  console.log('Breadcrumb:', nav.getBreadcrumb()); // [0, 1, 3]

  // Retroceder
  console.log('¿Puedo retroceder?', nav.canGoBack()); // true
  nav.goBack();
  console.log('Después de retroceder:', nav.getCurrentStep()); // 1
  console.log('Breadcrumb:', nav.getBreadcrumb()); // [0, 1]
}

/**
 * ==========================================
 * EJEMPLO 4: LinkedList Básica
 * ==========================================
 */
export function exampleLinkedListBasic() {
  const list = new LinkedList<string>();

  // Insertar elementos
  list.insertAtEnd('Alice');
  list.insertAtEnd('Bob');
  list.insertAtEnd('Charlie');

  console.log('Lista:', list.toArray()); // [Alice, Bob, Charlie]
  console.log('Tamaño:', list.getSize()); // 3

  // Insertar al inicio
  list.insertAtStart('Zoe');
  console.log('Después de insertar al inicio:', list.toArray());
  // Output: [Zoe, Alice, Bob, Charlie]

  // Insertar en posición específica
  list.insertAt('Diana', 2);
  console.log('Después de insertar en pos 2:', list.toArray());
  // Output: [Zoe, Alice, Diana, Bob, Charlie]

  // Obtener elemento
  console.log('Elemento en pos 2:', list.getAt(2)); // Diana

  // Buscar
  const found = list.find(x => x.startsWith('B'));
  console.log('Primero que empieza con B:', found); // Bob

  // Obtener índice
  const idx = list.indexOf(x => x === 'Charlie');
  console.log('Índice de Charlie:', idx); // 4

  // Primero y último
  console.log('Primero:', list.getFirst()); // Zoe
  console.log('Último:', list.getLast()); // Charlie

  // Eliminar del inicio
  list.removeFromStart();
  console.log('Después de eliminar del inicio:', list.toArray());
  // Output: [Alice, Diana, Bob, Charlie]

  // Eliminar del final
  list.removeFromEnd();
  console.log('Después de eliminar del final:', list.toArray());
  // Output: [Alice, Diana, Bob]

  // Invertir
  list.reverse();
  console.log('Lista invertida:', list.toArray());
  // Output: [Bob, Diana, Alice]

  // Mapear
  const mapped = list.map(x => x.length);
  console.log('Longitud de cada nombre:', mapped.toArray()); // [3, 6, 5]

  // Filtrar
  const filtered = list.filter(x => x.length > 3);
  console.log('Nombres con > 3 letras:', filtered.toArray());
  // Output: [Diana, Alice]
}

/**
 * ==========================================
 * EJEMPLO 5: Historial de Proyectos
 * ==========================================
 */
export function exampleProjectHistory() {
  const history = new ProjectHistory();

  // Agregar proyectos (más recientes primero)
  const proj1: ProjectHistoryItem = {
    projectId: 'p1',
    projectName: 'Casa Moderna',
    status: 'COMPLETED',
    addedAt: Date.now() - 86400000, // Ayer
    lastModified: Date.now() - 86400000,
    imageUrl: 'https://...'
  };

  const proj2: ProjectHistoryItem = {
    projectId: 'p2',
    projectName: 'Apartamento Centro',
    status: 'REVIEW_2D',
    addedAt: Date.now() - 3600000, // Hace 1 hora
    lastModified: Date.now() - 3600000,
    imageUrl: 'https://...'
  };

  const proj3: ProjectHistoryItem = {
    projectId: 'p3',
    projectName: 'Villa Campestre',
    status: 'PENDING',
    addedAt: Date.now(), // Ahora
    lastModified: Date.now(),
    imageUrl: 'https://...'
  };

  history.addProject(proj1);
  history.addProject(proj2);
  history.addProject(proj3);

  console.log('Historial:', history.getAllProjects().map(p => p.projectName));
  // Output: [Villa Campestre, Apartamento Centro, Casa Moderna]

  // Obtener proyecto específico
  const found = history.getProject('p1');
  console.log('Encontrado:', found?.projectName); // Casa Moderna

  // Obtener por estado
  const completed = history.getProjectsByStatus('COMPLETED');
  console.log('Proyectos completados:', completed.map(p => p.projectName));
  // Output: [Casa Moderna]

  // Obtener recientes
  const recent = history.getRecentProjects(2);
  console.log('2 Más recientes:', recent.map(p => p.projectName));
  // Output: [Villa Campestre, Apartamento Centro]

  // Buscar por nombre
  const searched = history.searchByName('Casa');
  console.log('Búsqueda "Casa":', searched.map(p => p.projectName));
  // Output: [Casa Moderna]

  // Actualizar proyecto
  history.updateProject('p2', { status: 'GENERATING_3D' });
  const updated = history.getProject('p2');
  console.log('Estado actualizado:', updated?.status); // GENERATING_3D

  // Ver estadísticas
  console.log('Estadísticas:', history.getStatistics());
  // Output: { totalProjects: 3, byStatus: {COMPLETED: 1, REVIEW_2D: 1, PENDING: 1}, ... }

  // Eliminar proyecto
  history.removeProject('p1');
  console.log('Después de eliminar:', history.getSize()); // 2
}

/**
 * ==========================================
 * EJEMPLO 6: Versiones de Proyecto
 * ==========================================
 */
export function exampleProjectVersions() {
  const versions = new ProjectVersions();

  // Version 1: Foto original
  const v1 = versions.addVersion(
    'Foto original subida',
    {
      image: 'original.jpg',
      status: 'PENDING'
    }
  );
  console.log('Versión creada:', v1); // 1

  // Version 2: Render 2D
  const v2 = versions.addVersion(
    'Render 2D generado',
    {
      image: 'original.jpg',
      render2D: '2d.png',
      status: 'REVIEW_2D'
    }
  );
  console.log('Versión creada:', v2); // 2

  // Version 3: Aprobado
  const v3 = versions.addVersion(
    'Diseño 2D aprobado',
    {
      image: 'original.jpg',
      render2D: '2d.png',
      status: 'GENERATING_3D'
    }
  );
  console.log('Versión creada:', v3); // 3

  // Version 4: Modelo 3D
  const v4 = versions.addVersion(
    'Modelo 3D completado',
    {
      image: 'original.jpg',
      render2D: '2d.png',
      model3D: 'model.glb',
      status: 'COMPLETED'
    }
  );
  console.log('Versión creada:', v4); // 4

  // Obtener versión específica
  console.log('Versión 2:', versions.getVersion(2));

  // Obtener última versión
  const latest = versions.getLatestVersion();
  console.log('Última versión status:', latest.status); // COMPLETED

  // Obtener versión anterior
  const prev = versions.getPreviousVersion(4);
  console.log('Versión anterior a 4:', prev.status); // GENERATING_3D

  // Comparar versiones
  const comparison = versions.compareVersions(2, 4);
  console.log('Comparación 2 vs 4:', comparison);

  // Listar todas las versiones
  const all = versions.getAllVersions();
  console.log('Total versiones:', all.length); // 4
  console.log('Historial:', all.map(v => v.description));
}

/**
 * ==========================================
 * EJEMPLO 7: Stack Acotado
 * ==========================================
 */
export function exampleBoundedStack() {
  const stack = new BoundedStack<number>(5); // Máximo 5 elementos

  // Agregar 8 elementos
  for (let i = 1; i <= 8; i++) {
    stack.push(i);
  }

  console.log('Stack con límite 5 después de 8 push:');
  console.log('Contenido:', stack.toArray()); // Últimos 5: [8, 7, 6, 5, 4]
  console.log('Tamaño:', stack.getSize()); // 5 (no pasó 5)

  // Los 3 primeros (1, 2, 3) fueron removidos automáticamente
}

/**
 * ==========================================
 * EJEMPLO 8: Integración Completa
 * ==========================================
 */
export function examplePhase2Integration() {
  console.log('=== INTEGRACIÓN COMPLETA FASE 2 ===\n');

  // 1. Sistema de undo/redo
  const undoRedo = new UndoRedoManager();
  const step1: WizardStepState = {
    step: 0,
    name: 'Inicio',
    projectId: 'proj-001',
    timestamp: Date.now(),
    data: { projectName: 'Casa V1' }
  };
  undoRedo.saveState(step1);
  console.log('✅ Undo/Redo inicializado');

  // 2. Historial de proyectos
  const history = new ProjectHistory();
  history.addProject({
    projectId: 'proj-001',
    projectName: 'Casa V1',
    status: 'PENDING',
    addedAt: Date.now(),
    lastModified: Date.now()
  });
  console.log('✅ Historial de proyectos inicializado');

  // 3. Versiones del proyecto
  const versions = new ProjectVersions();
  versions.addVersion('Inicial', { status: 'PENDING' });
  console.log('✅ Versiones del proyecto inicializado');

  // 4. Navegación
  const nav = new StepNavigationManager(3);
  nav.goToStep(1);
  console.log('✅ Navegación inicializado');

  // 5. LinkedList general
  const list = new LinkedList<string>();
  list.insertAtEnd('Task 1');
  list.insertAtEnd('Task 2');
  console.log('✅ LinkedList inicializado');

  console.log('\n📊 Sistema Fase 2 completo:');
  console.log('- Undo/Redo activo');
  console.log('- Historial:', history.getSize(), 'proyectos');
  console.log('- Versiones:', versions.getVersionCount(), 'versiones');
  console.log('- Navegación en paso:', nav.getCurrentStep());
  console.log('- Tasks:', list.getSize());
}
