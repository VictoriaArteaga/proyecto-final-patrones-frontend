/**
 * Índice de exportación de Estructuras de Datos
 * Solo clases especializadas para Arq-AI 3D (sin clases educativas genéricas)
 */

// ============ FASE 1: CORE ============

// QUEUE ESPECIALIZADA
export { 
  GenerationTaskQueue,
  type GenerationTask 
} from './structures/Queue';

// STATE MACHINE
export { 
  ProjectStateMachine, 
  ProjectStateMachineManager,
  ProjectStatus,
  type StateTransitionEvent 
} from './structures/ProjectStateMachine';

// CACHE
export { 
  ProjectCache, 
  UserProjectCacheManager,
  type CacheEntry,
  type CacheMetadata,
  type CacheConfig 
} from './cache/ProjectCache';

// ============ FASE 2: UX AVANZADO ============

// STACK ESPECIALIZADO
export { 
  UndoRedoManager, 
  StepNavigationManager,
  BoundedStack,
  type WizardStepState 
} from './structures/Stack';

// LINKED LIST ESPECIALIZADO
export { 
  ProjectHistory, 
  ProjectVersions,
  type ProjectHistoryItem 
} from './structures/LinkedList';

// ============ EJEMPLOS ============

// Fase 1
export {
  exampleQueue,
  exampleStateMachine,
  exampleProjectCache,
  exampleIntegration
} from './examples';

// Fase 2
export {
  exampleStackBasic,
  exampleUndoRedo,
  exampleStepNavigation,
  exampleLinkedListBasic,
  exampleProjectHistory,
  exampleProjectVersions,
  exampleBoundedStack,
  examplePhase2Integration
} from './examples2';

// ============ FASE 3: BÚSQUEDA Y NAVEGACIÓN ============

// BINARY SEARCH TREE ESPECIALIZADO
export { 
  ProjectDateIndex, 
  ProjectNameIndex,
  type IndexedProject 
} from './structures/BinarySearchTree';

// DOUBLY LINKED LIST ESPECIALIZADO
export { 
  ProjectGallery, 
  ProjectCarousel,
  type GalleryItem,
  type CarouselProject 
} from './structures/DoublyLinkedList';

// Fase 3
export {
  exampleBinarySearchTreeBasic,
  exampleProjectDateIndex,
  exampleProjectNameIndex,
  exampleDoublyLinkedListBasic,
  exampleProjectGallery,
  exampleProjectCarousel,
  exampleRangeSearch,
  examplePhase3Integration
} from './examples3';
