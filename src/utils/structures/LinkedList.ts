/**
 * Implementación de una Lista Enlazada Simple (Linked List)
 * 
 * Casos de uso en Arq-AI 3D:
 * - Historial de proyectos del usuario
 * - Lista de comentarios en proyecto
 * - Versiones/iteraciones de un proyecto
 * - Auditoría de cambios
 */

export interface LinkedListNode<T> {
  data: T;
  next: LinkedListNode<T> | null;
}

export class LinkedList<T> {
  private head: LinkedListNode<T> | null = null;
  private tail: LinkedListNode<T> | null = null;
  private size: number = 0;

  /**
   * Inserta elemento al inicio de la lista
   * Complejidad: O(1)
   */
  insertAtStart(data: T): void {
    const newNode: LinkedListNode<T> = {
      data,
      next: this.head
    };

    this.head = newNode;

    if (this.tail === null) {
      this.tail = newNode;
    }

    this.size++;
  }

  /**
   * Inserta elemento al final de la lista
   * Complejidad: O(1) si tenemos tail, O(n) si no
   */
  insertAtEnd(data: T): void {
    const newNode: LinkedListNode<T> = {
      data,
      next: null
    };

    if (this.head === null) {
      this.head = newNode;
      this.tail = newNode;
    } else if (this.tail !== null) {
      this.tail.next = newNode;
      this.tail = newNode;
    }

    this.size++;
  }

  /**
   * Inserta elemento en posición específica
   * Complejidad: O(n)
   */
  insertAt(data: T, index: number): boolean {
    if (index < 0 || index > this.size) {
      return false;
    }

    if (index === 0) {
      this.insertAtStart(data);
      return true;
    }

    if (index === this.size) {
      this.insertAtEnd(data);
      return true;
    }

    const newNode: LinkedListNode<T> = {
      data,
      next: null
    };

    let current = this.head;
    let previous: LinkedListNode<T> | null = null;
    let count = 0;

    while (count < index) {
      previous = current;
      current = current?.next ?? null;
      count++;
    }

    if (previous !== null) {
      newNode.next = current;
      previous.next = newNode;
      this.size++;
      return true;
    }

    return false;
  }

  /**
   * Elimina elemento del inicio
   * Complejidad: O(1)
   */
  removeFromStart(): T | undefined {
    if (this.head === null) {
      return undefined;
    }

    const data = this.head.data;
    this.head = this.head.next;

    if (this.head === null) {
      this.tail = null;
    }

    this.size--;
    return data;
  }

  /**
   * Elimina elemento del final
   * Complejidad: O(n)
   */
  removeFromEnd(): T | undefined {
    if (this.head === null) {
      return undefined;
    }

    if (this.head === this.tail) {
      const data = this.head.data;
      this.head = null;
      this.tail = null;
      this.size--;
      return data;
    }

    let current = this.head;
    while (current?.next !== this.tail) {
      current = current?.next ?? null;
    }

    const data = this.tail?.data;

    if (current !== null) {
      current.next = null;
      this.tail = current;
    }

    this.size--;
    return data;
  }

  /**
   * Elimina elemento en posición específica
   * Complejidad: O(n)
   */
  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this.size) {
      return undefined;
    }

    if (index === 0) {
      return this.removeFromStart();
    }

    let current = this.head;
    let previous: LinkedListNode<T> | null = null;
    let count = 0;

    while (count < index) {
      previous = current;
      current = current?.next ?? null;
      count++;
    }

    if (previous !== null && current !== null) {
      previous.next = current.next;

      if (current === this.tail) {
        this.tail = previous;
      }

      this.size--;
      return current.data;
    }

    return undefined;
  }

  /**
   * Obtiene elemento en posición específica
   * Complejidad: O(n)
   */
  getAt(index: number): T | undefined {
    if (index < 0 || index >= this.size) {
      return undefined;
    }

    let current = this.head;
    let count = 0;

    while (count < index) {
      current = current?.next ?? null;
      count++;
    }

    return current?.data;
  }

  /**
   * Busca un elemento que cumpla con el predicado
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
   * Obtiene el índice de un elemento
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
   * Obtiene el primer elemento
   * Complejidad: O(1)
   */
  getFirst(): T | undefined {
    return this.head?.data;
  }

  /**
   * Obtiene el último elemento
   * Complejidad: O(1)
   */
  getLast(): T | undefined {
    return this.tail?.data;
  }

  /**
   * Convierte la lista a array
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
   * Obtiene el tamaño de la lista
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Verifica si la lista está vacía
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
   * Invierte la lista
   * Complejidad: O(n)
   */
  reverse(): void {
    if (this.size <= 1) return;

    let current = this.head;
    let previous: LinkedListNode<T> | null = null;

    while (current !== null) {
      const next = current.next;
      current.next = previous;
      previous = current;
      current = next;
    }

    [this.head, this.tail] = [this.tail, this.head];
  }

  /**
   * Mapea cada elemento a un nuevo valor
   * Complejidad: O(n)
   */
  map<U>(callback: (data: T) => U): LinkedList<U> {
    const newList = new LinkedList<U>();
    let current = this.head;

    while (current !== null) {
      newList.insertAtEnd(callback(current.data));
      current = current.next;
    }

    return newList;
  }

  /**
   * Filtra elementos que cumplen el predicado
   * Complejidad: O(n)
   */
  filter(predicate: (data: T) => boolean): LinkedList<T> {
    const newList = new LinkedList<T>();
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
 * Interfaz para proyecto en historial
 */
export interface ProjectHistoryItem {
  projectId: string;
  projectName: string;
  status: string;
  addedAt: number;
  lastModified: number;
  imageUrl?: string;
}

/**
 * Historial de proyectos del usuario
 */
export class ProjectHistory {
  private list: LinkedList<ProjectHistoryItem> = new LinkedList();
  private maxItems: number = 100;

  /**
   * Agrega nuevo proyecto al inicio del historial (más reciente)
   */
  addProject(item: ProjectHistoryItem): void {
    this.list.insertAtStart(item);

    // Limitar tamaño
    if (this.list.getSize() > this.maxItems) {
      this.list.removeFromEnd();
    }
  }

  /**
   * Actualiza proyecto en el historial
   */
  updateProject(projectId: string, updates: Partial<ProjectHistoryItem>): boolean {
    const index = this.list.indexOf(p => p.projectId === projectId);

    if (index === -1) return false;

    const current = this.list.getAt(index);
    if (!current) return false;

    const updated: ProjectHistoryItem = {
      ...current,
      ...updates,
      lastModified: Date.now()
    };

    this.list.removeAt(index);
    this.list.insertAtStart(updated);

    return true;
  }

  /**
   * Obtiene proyecto por ID
   */
  getProject(projectId: string): ProjectHistoryItem | undefined {
    return this.list.find(p => p.projectId === projectId);
  }

  /**
   * Obtiene todos los proyectos
   */
  getAllProjects(): ProjectHistoryItem[] {
    return this.list.toArray();
  }

  /**
   * Obtiene proyectos por estado
   */
  getProjectsByStatus(status: string): ProjectHistoryItem[] {
    return this.list.filter(p => p.status === status).toArray();
  }

  /**
   * Obtiene proyectos modificados recientemente
   */
  getRecentProjects(limit: number = 10): ProjectHistoryItem[] {
    const all = this.list.toArray();
    return all.slice(0, limit);
  }

  /**
   * Elimina proyecto del historial
   */
  removeProject(projectId: string): boolean {
    const index = this.list.indexOf(p => p.projectId === projectId);
    if (index === -1) return false;

    this.list.removeAt(index);
    return true;
  }

  /**
   * Limpia todo el historial
   */
  clear(): void {
    this.list.clear();
  }

  /**
   * Obtiene cantidad de proyectos
   */
  getSize(): number {
    return this.list.getSize();
  }

  /**
   * Busca proyectos por nombre
   */
  searchByName(query: string): ProjectHistoryItem[] {
    const lowerQuery = query.toLowerCase();
    return this.list.filter(p =>
      p.projectName.toLowerCase().includes(lowerQuery)
    ).toArray();
  }

  /**
   * Obtiene estadísticas del historial
   */
  getStatistics() {
    const all = this.list.toArray();
    const statuses = new Map<string, number>();

    all.forEach(p => {
      const count = statuses.get(p.status) || 0;
      statuses.set(p.status, count + 1);
    });

    return {
      totalProjects: this.list.getSize(),
      byStatus: Object.fromEntries(statuses),
      oldestProject: this.list.getLast(),
      newestProject: this.list.getFirst()
    };
  }
}

/**
 * Lista de versiones de un proyecto
 */
export class ProjectVersions {
  private versions: LinkedList<{
    version: number;
    timestamp: number;
    description: string;
    data: any;
  }> = new LinkedList();
  private nextVersion: number = 1;

  /**
   * Agrega nueva versión
   */
  addVersion(description: string, data: any): number {
    const version = this.nextVersion;
    this.versions.insertAtEnd({
      version,
      timestamp: Date.now(),
      description,
      data
    });
    this.nextVersion++;
    return version;
  }

  /**
   * Obtiene versión específica
   */
  getVersion(versionNumber: number): any {
    const v = this.versions.find(v => v.version === versionNumber);
    return v?.data;
  }

  /**
   * Obtiene todas las versiones
   */
  getAllVersions() {
    return this.versions.toArray();
  }

  /**
   * Obtiene la versión más reciente
   */
  getLatestVersion(): any {
    return this.versions.getLast()?.data;
  }

  /**
   * Obtiene versión anterior a la especificada
   */
  getPreviousVersion(versionNumber: number): any {
    const all = this.versions.toArray();
    const index = all.findIndex(v => v.version === versionNumber);

    if (index > 0) {
      return all[index - 1].data;
    }

    return undefined;
  }

  /**
   * Compara dos versiones
   */
  compareVersions(v1: number, v2: number) {
    const version1 = this.versions.find(v => v.version === v1);
    const version2 = this.versions.find(v => v.version === v2);

    if (!version1 || !version2) return null;

    return {
      v1: {
        version: version1.version,
        timestamp: version1.timestamp,
        description: version1.description
      },
      v2: {
        version: version2.version,
        timestamp: version2.timestamp,
        description: version2.description
      },
      timeDiff: version2.timestamp - version1.timestamp
    };
  }

  /**
   * Obtiene cantidad de versiones
   */
  getVersionCount(): number {
    return this.versions.getSize();
  }

  /**
   * Limpia historial de versiones
   */
  clear(): void {
    this.versions.clear();
    this.nextVersion = 1;
  }
}
