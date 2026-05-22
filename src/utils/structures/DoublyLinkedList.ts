/**
 * Implementación de una Lista Doblemente Enlazada (Doubly Linked List)
 * 
 * Casos de uso en Arq-AI 3D:
 * - Galería navegable de renders (antes/después)
 * - Carrusel de proyectos (izquierda/derecha)
 * - Timeline de eventos bidireccional
 * - Reproducción secuencial de versiones
 */

export interface DoublyLinkedListNode<T> {
  data: T;
  next: DoublyLinkedListNode<T> | null;
  prev: DoublyLinkedListNode<T> | null;
}

export class DoublyLinkedList<T> {
  private head: DoublyLinkedListNode<T> | null = null;
  private tail: DoublyLinkedListNode<T> | null = null;
  private size: number = 0;

  /**
   * Inserta elemento al inicio
   * Complejidad: O(1)
   */
  insertAtStart(data: T): void {
    const newNode: DoublyLinkedListNode<T> = {
      data,
      next: this.head,
      prev: null
    };

    if (this.head !== null) {
      this.head.prev = newNode;
    } else {
      this.tail = newNode;
    }

    this.head = newNode;
    this.size++;
  }

  /**
   * Inserta elemento al final
   * Complejidad: O(1)
   */
  insertAtEnd(data: T): void {
    const newNode: DoublyLinkedListNode<T> = {
      data,
      next: null,
      prev: this.tail
    };

    if (this.tail !== null) {
      this.tail.next = newNode;
    } else {
      this.head = newNode;
    }

    this.tail = newNode;
    this.size++;
  }

  /**
   * Inserta elemento en posición específica
   * Complejidad: O(n)
   */
  insertAt(data: T, index: number): boolean {
    if (index < 0 || index > this.size) return false;

    if (index === 0) {
      this.insertAtStart(data);
      return true;
    }

    if (index === this.size) {
      this.insertAtEnd(data);
      return true;
    }

    // Buscar la posición (desde el lado más cercano)
    let current: DoublyLinkedListNode<T> | null;
    if (index < this.size / 2) {
      current = this.head;
      for (let i = 0; i < index - 1; i++) {
        current = current?.next ?? null;
      }
    } else {
      current = this.tail;
      for (let i = this.size - 1; i > index; i--) {
        current = current?.prev ?? null;
      }
      current = current?.prev ?? null;
    }

    if (!current) return false;

    const newNode: DoublyLinkedListNode<T> = {
      data,
      next: current.next,
      prev: current
    };

    if (current.next !== null) {
      current.next.prev = newNode;
    }

    current.next = newNode;
    this.size++;
    return true;
  }

  /**
   * Elimina elemento del inicio
   * Complejidad: O(1)
   */
  removeFromStart(): T | undefined {
    if (!this.head) return undefined;

    const data = this.head.data;
    this.head = this.head.next;

    if (this.head !== null) {
      this.head.prev = null;
    } else {
      this.tail = null;
    }

    this.size--;
    return data;
  }

  /**
   * Elimina elemento del final
   * Complejidad: O(1)
   */
  removeFromEnd(): T | undefined {
    if (!this.tail) return undefined;

    const data = this.tail.data;
    this.tail = this.tail.prev;

    if (this.tail !== null) {
      this.tail.next = null;
    } else {
      this.head = null;
    }

    this.size--;
    return data;
  }

  /**
   * Obtiene elemento en posición
   * Complejidad: O(n) pero optimizado
   */
  getAt(index: number): T | undefined {
    if (index < 0 || index >= this.size) return undefined;

    let current: DoublyLinkedListNode<T> | null;

    // Buscar desde el lado más cercano
    if (index < this.size / 2) {
      current = this.head;
      for (let i = 0; i < index; i++) {
        current = current?.next ?? null;
      }
    } else {
      current = this.tail;
      for (let i = this.size - 1; i > index; i--) {
        current = current?.prev ?? null;
      }
    }

    return current?.data;
  }

  /**
   * Obtiene el siguiente elemento
   * Complejidad: O(n) para encontrar + O(1) para siguiente
   */
  getNextAfter(data: T, predicate: (a: T, b: T) => boolean): T | undefined {
    let current = this.head;

    while (current !== null) {
      if (predicate(current.data, data)) {
        return current.next?.data;
      }
      current = current.next;
    }

    return undefined;
  }

  /**
   * Obtiene el elemento anterior
   * Complejidad: O(n) para encontrar + O(1) para anterior
   */
  getPrevBefore(data: T, predicate: (a: T, b: T) => boolean): T | undefined {
    let current = this.tail;

    while (current !== null) {
      if (predicate(current.data, data)) {
        return current.prev?.data;
      }
      current = current.prev;
    }

    return undefined;
  }

  /**
   * Obtiene primer elemento
   * Complejidad: O(1)
   */
  getFirst(): T | undefined {
    return this.head?.data;
  }

  /**
   * Obtiene último elemento
   * Complejidad: O(1)
   */
  getLast(): T | undefined {
    return this.tail?.data;
  }

  /**
   * Busca elemento
   * Complejidad: O(n)
   */
  find(predicate: (data: T) => boolean): T | undefined {
    let current = this.head;

    while (current !== null) {
      if (predicate(current.data)) {
        return current.data;
      }
      current = current.next;
    }

    return undefined;
  }

  /**
   * Busca desde el final
   * Complejidad: O(n)
   */
  findFromEnd(predicate: (data: T) => boolean): T | undefined {
    let current = this.tail;

    while (current !== null) {
      if (predicate(current.data)) {
        return current.data;
      }
      current = current.prev;
    }

    return undefined;
  }

  /**
   * Obtiene índice
   * Complejidad: O(n)
   */
  indexOf(predicate: (data: T) => boolean): number {
    let current = this.head;
    let index = 0;

    while (current !== null) {
      if (predicate(current.data)) {
        return index;
      }
      current = current.next;
      index++;
    }

    return -1;
  }

  /**
   * Convierte a array
   * Complejidad: O(n)
   */
  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;

    while (current !== null) {
      result.push(current.data);
      current = current.next;
    }

    return result;
  }

  /**
   * Invierte el orden (sin reorganizar nodos, solo inversión lógica)
   * Complejidad: O(1) cambio de punteros
   */
  reverse(): void {
    [this.head, this.tail] = [this.tail, this.head];

    let current = this.head;
    while (current !== null) {
      [current.next, current.prev] = [current.prev, current.next];
      current = current.next;
    }
  }

  /**
   * Obtiene tamaño
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Verifica si está vacía
   */
  isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Limpia la lista
   */
  clear(): void {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  /**
   * Mapa
   * Complejidad: O(n)
   */
  map<U>(callback: (data: T) => U): DoublyLinkedList<U> {
    const newList = new DoublyLinkedList<U>();
    let current = this.head;

    while (current !== null) {
      newList.insertAtEnd(callback(current.data));
      current = current.next;
    }

    return newList;
  }

  /**
   * Filtra
   * Complejidad: O(n)
   */
  filter(predicate: (data: T) => boolean): DoublyLinkedList<T> {
    const newList = new DoublyLinkedList<T>();
    let current = this.head;

    while (current !== null) {
      if (predicate(current.data)) {
        newList.insertAtEnd(current.data);
      }
      current = current.next;
    }

    return newList;
  }
}

/**
 * Interfaz para items de galería
 */
export interface GalleryItem {
  id: string;
  type: 'original' | '2D' | '3D';
  url: string;
  timestamp: number;
  description: string;
}

/**
 * Galería navegable para proyecto
 */
export class ProjectGallery {
  private gallery: DoublyLinkedList<GalleryItem> = new DoublyLinkedList();
  private currentItem: GalleryItem | null = null;

  /**
   * Agrega item a la galería
   */
  addItem(item: GalleryItem): void {
    this.gallery.insertAtEnd(item);
    if (!this.currentItem) {
      this.currentItem = item;
    }
  }

  /**
   * Obtiene item actual
   */
  getCurrent(): GalleryItem | null {
    return this.currentItem;
  }

  /**
   * Navega al siguiente item
   */
  goNext(): GalleryItem | undefined {
    if (!this.currentItem) return undefined;

    const next = this.gallery.getNextAfter(
      this.currentItem,
      (a, b) => a.id === b.id
    );

    if (next) {
      this.currentItem = next;
    }

    return next;
  }

  /**
   * Navega al item anterior
   */
  goPrev(): GalleryItem | undefined {
    if (!this.currentItem) return undefined;

    const prev = this.gallery.getPrevBefore(
      this.currentItem,
      (a, b) => a.id === b.id
    );

    if (prev) {
      this.currentItem = prev;
    }

    return prev;
  }

  /**
   * Va a item específico
   */
  goToItem(predicate: (item: GalleryItem) => boolean): GalleryItem | undefined {
    const item = this.gallery.find(predicate);
    if (item) {
      this.currentItem = item;
    }
    return item;
  }

  /**
   * Obtiene todos los items
   */
  getAllItems(): GalleryItem[] {
    return this.gallery.toArray();
  }

  /**
   * Obtiene items por tipo
   */
  getItemsByType(type: GalleryItem['type']): GalleryItem[] {
    return this.gallery.filter(item => item.type === type).toArray();
  }

  /**
   * Obtiene cantidad de items
   */
  getItemCount(): number {
    return this.gallery.getSize();
  }

  /**
   * ¿Hay siguiente?
   */
  hasNext(): boolean {
    if (!this.currentItem) return false;

    return (
      this.gallery.getNextAfter(
        this.currentItem,
        (a, b) => a.id === b.id
      ) !== undefined
    );
  }

  /**
   * ¿Hay anterior?
   */
  hasPrev(): boolean {
    if (!this.currentItem) return false;

    return (
      this.gallery.getPrevBefore(
        this.currentItem,
        (a, b) => a.id === b.id
      ) !== undefined
    );
  }

  /**
   * Obtiene posición actual
   */
  getCurrentPosition(): number {
    if (!this.currentItem) return -1;

    return this.gallery.indexOf(item => item.id === this.currentItem!.id);
  }

  /**
   * Limpia galería
   */
  clear(): void {
    this.gallery.clear();
    this.currentItem = null;
  }
}

/**
 * Carrusel de proyectos
 */
export interface CarouselProject {
  projectId: string;
  projectName: string;
  imageUrl: string;
  status: string;
}

/**
 * Carrusel navegable de proyectos
 */
export class ProjectCarousel {
  private carousel: DoublyLinkedList<CarouselProject> =
    new DoublyLinkedList();
  private currentProject: CarouselProject | null = null;
  private readonly maxVisible: number;

  constructor(maxVisible: number = 3) {
    this.maxVisible = maxVisible;
  }

  /**
   * Agrega proyecto al carrusel
   */
  addProject(project: CarouselProject): void {
    this.carousel.insertAtEnd(project);
    if (!this.currentProject) {
      this.currentProject = project;
    }
  }

  /**
   * Obtiene proyecto actual
   */
  getCurrent(): CarouselProject | null {
    return this.currentProject;
  }

  /**
   * Navega al siguiente
   */
  next(): void {
    if (!this.currentProject) return;

    const next = this.carousel.getNextAfter(
      this.currentProject,
      (a, b) => a.projectId === b.projectId
    );

    if (next) {
      this.currentProject = next;
    } else {
      // Ciclar al inicio
      this.currentProject = this.carousel.getFirst() ?? null;
    }
  }

  /**
   * Navega al anterior
   */
  prev(): void {
    if (!this.currentProject) return;

    const prev = this.carousel.getPrevBefore(
      this.currentProject,
      (a, b) => a.projectId === b.projectId
    );

    if (prev) {
      this.currentProject = prev;
    } else {
      // Ciclar al final
      this.currentProject = this.carousel.getLast() ?? null;
    }
  }

  /**
   * Obtiene items visibles
   */
  getVisibleItems(): CarouselProject[] {
    const current = this.getCurrentPosition();
    const all = this.carousel.toArray();

    if (current === -1) return [];

    const visible: CarouselProject[] = [];
    const half = Math.floor(this.maxVisible / 2);

    for (let i = -half; i <= half; i++) {
      const idx = (current + i + all.length) % all.length;
      if (visible.length < this.maxVisible) {
        visible.push(all[idx]);
      }
    }

    return visible;
  }

  /**
   * Obtiene posición actual
   */
  getCurrentPosition(): number {
    if (!this.currentProject) return -1;

    return this.carousel.indexOf(
      p => p.projectId === this.currentProject!.projectId
    );
  }

  /**
   * Obtiene cantidad total
   */
  getTotalCount(): number {
    return this.carousel.getSize();
  }

  /**
   * Limpia carrusel
   */
  clear(): void {
    this.carousel.clear();
    this.currentProject = null;
  }
}
