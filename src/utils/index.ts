/**
 * Índice de exportación de Estructuras de Datos
 * 
 * Importa cualquiera de estas estructuras así:
 * import { Queue, ProjectStateMachine, ProjectCache, Stack, LinkedList } from '@/utils/index';
 */

// ============ FASE 1: CORE ============

// QUEUE (COLA)
export { 
  Queue, 
  GenerationTaskQueue,
  type QueueNode,
  type GenerationTask 
} from './structures/Queue';

// STATE MACHINE (GRAFO)
export { 
  ProjectStateMachine, 
  ProjectStateMachineManager,
  ProjectStatus,
  type StateNode,
  type StateTransitionEvent 
} from './structures/ProjectStateMachine';

// CACHE (HASHMAP)
export { 
  ProjectCache, 
  UserProjectCacheManager,
  type CacheEntry,
  type CacheMetadata,
  type CacheConfig 
} from './cache/ProjectCache';

// ============ FASE 2: UX AVANZADO ============

// STACK (PILA)
export { 
  Stack, 
  UndoRedoManager, 
  StepNavigationManager,
  BoundedStack,
  type StackNode,
  type WizardStepState 
} from './structures/Stack';

// LINKED LIST
export { 
  LinkedList, 
  ProjectHistory, 
  ProjectVersions,
  type LinkedListNode,
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

// BINARY SEARCH TREE
export { 
  BinarySearchTree, 
  ProjectDateIndex, 
  ProjectNameIndex,
  type BSTNode,
  type IndexedProject 
} from './structures/BinarySearchTree';

// DOUBLY LINKED LIST
export { 
  DoublyLinkedList, 
  ProjectGallery, 
  ProjectCarousel,
  type DoublyLinkedListNode,
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
