/**
 * Implementación de un Árbol Binario de Búsqueda (Binary Search Tree - BST)
 * 
 * Casos de uso en Arq-AI 3D:
 * - Búsqueda rápida de proyectos por fecha/nombre
 * - Filtrado por rango de fechas
 * - Ordenamiento automático de proyectos
 * - Reportes y estadísticas
 */

export interface BSTNode<T> {
  data: T;
  left: BSTNode<T> | null;
  right: BSTNode<T> | null;
  height?: number; // Para árbol balanceado
}

export class BinarySearchTree<T> {
  private root: BSTNode<T> | null = null;
  private size: number = 0;
  private compareFn: (a: T, b: T) => number;

  constructor(compareFn: (a: T, b: T) => number) {
    this.compareFn = compareFn;
  }

  /**
   * Inserta un valor en el árbol
   * Complejidad: O(log n) promedio, O(n) peor caso
   */
  insert(data: T): boolean {
    if (this.root === null) {
      this.root = { data, left: null, right: null };
      this.size++;
      return true;
    }

    return this.insertNode(this.root, data);
  }

  private insertNode(node: BSTNode<T>, data: T): boolean {
    const cmp = this.compareFn(data, node.data);

    if (cmp < 0) {
      if (node.left === null) {
        node.left = { data, left: null, right: null };
        this.size++;
        return true;
      }
      return this.insertNode(node.left, data);
    } else if (cmp > 0) {
      if (node.right === null) {
        node.right = { data, left: null, right: null };
        this.size++;
        return true;
      }
      return this.insertNode(node.right, data);
    }

    // Valor duplicado
    return false;
  }

  /**
   * Busca un valor en el árbol
   * Complejidad: O(log n) promedio, O(n) peor caso
   */
  search(data: T): T | null {
    return this.searchNode(this.root, data);
  }

  private searchNode(node: BSTNode<T> | null, data: T): T | null {
    if (node === null) {
      return null;
    }

    const cmp = this.compareFn(data, node.data);

    if (cmp < 0) {
      return this.searchNode(node.left, data);
    } else if (cmp > 0) {
      return this.searchNode(node.right, data);
    } else {
      return node.data;
    }
  }

  /**
   * Obtiene todos los valores en rango [min, max]
   * Complejidad: O(k + log n) donde k es número de resultados
   */
  rangeSearch(min: T, max: T): T[] {
    const result: T[] = [];
    this.rangeSearchNode(this.root, min, max, result);
    return result;
  }

  private rangeSearchNode(
    node: BSTNode<T> | null,
    min: T,
    max: T,
    result: T[]
  ): void {
    if (node === null) return;

    const cmpMin = this.compareFn(node.data, min);
    const cmpMax = this.compareFn(node.data, max);

    if (cmpMin >= 0 && cmpMax <= 0) {
      result.push(node.data);
    }

    if (cmpMin > 0) {
      this.rangeSearchNode(node.left, min, max, result);
    }

    if (cmpMax < 0) {
      this.rangeSearchNode(node.right, min, max, result);
    }

    if (cmpMin >= 0) {
      this.rangeSearchNode(node.left, min, max, result);
    }

    if (cmpMax <= 0) {
      this.rangeSearchNode(node.right, min, max, result);
    }
  }

  /**
   * Obtiene el valor mínimo
   * Complejidad: O(log n)
   */
  getMin(): T | null {
    if (this.root === null) return null;

    let current = this.root;
    while (current.left !== null) {
      current = current.left;
    }

    return current.data;
  }

  /**
   * Obtiene el valor máximo
   * Complejidad: O(log n)
   */
  getMax(): T | null {
    if (this.root === null) return null;

    let current = this.root;
    while (current.right !== null) {
      current = current.right;
    }

    return current.data;
  }

  /**
   * Recorrido In-order (izquierda-raíz-derecha) - Ordenes creciente
   * Complejidad: O(n)
   */
  inOrder(): T[] {
    const result: T[] = [];
    this.inOrderNode(this.root, result);
    return result;
  }

  private inOrderNode(node: BSTNode<T> | null, result: T[]): void {
    if (node === null) return;

    this.inOrderNode(node.left, result);
    result.push(node.data);
    this.inOrderNode(node.right, result);
  }

  /**
   * Recorrido Pre-order (raíz-izquierda-derecha)
   * Complejidad: O(n)
   */
  preOrder(): T[] {
    const result: T[] = [];
    this.preOrderNode(this.root, result);
    return result;
  }

  private preOrderNode(node: BSTNode<T> | null, result: T[]): void {
    if (node === null) return;

    result.push(node.data);
    this.preOrderNode(node.left, result);
    this.preOrderNode(node.right, result);
  }

  /**
   * Recorrido Post-order (izquierda-derecha-raíz)
   * Complejidad: O(n)
   */
  postOrder(): T[] {
    const result: T[] = [];
    this.postOrderNode(this.root, result);
    return result;
  }

  private postOrderNode(node: BSTNode<T> | null, result: T[]): void {
    if (node === null) return;

    this.postOrderNode(node.left, result);
    this.postOrderNode(node.right, result);
    result.push(node.data);
  }

  /**
   * Obtiene la altura del árbol
   * Complejidad: O(n)
   */
  getHeight(): number {
    return this.getHeightNode(this.root);
  }

  private getHeightNode(node: BSTNode<T> | null): number {
    if (node === null) return -1;

    const leftHeight = this.getHeightNode(node.left);
    const rightHeight = this.getHeightNode(node.right);

    return 1 + Math.max(leftHeight, rightHeight);
  }

  /**
   * Verifica si el árbol está balanceado
   * Complejidad: O(n)
   */
  isBalanced(): boolean {
    return this.isBalancedNode(this.root).balanced;
  }

  private isBalancedNode(
    node: BSTNode<T> | null
  ): { balanced: boolean; height: number } {
    if (node === null) {
      return { balanced: true, height: -1 };
    }

    const left = this.isBalancedNode(node.left);
    if (!left.balanced) return { balanced: false, height: 0 };

    const right = this.isBalancedNode(node.right);
    if (!right.balanced) return { balanced: false, height: 0 };

    const balanced = Math.abs(left.height - right.height) <= 1;
    const height = 1 + Math.max(left.height, right.height);

    return { balanced, height };
  }

  /**
   * Elimina un valor del árbol
   * Complejidad: O(log n) promedio
   */
  delete(data: T): boolean {
    const initialSize = this.size;
    this.root = this.deleteNode(this.root, data);
    return this.size < initialSize;
  }

  private deleteNode(node: BSTNode<T> | null, data: T): BSTNode<T> | null {
    if (node === null) return null;

    const cmp = this.compareFn(data, node.data);

    if (cmp < 0) {
      node.left = this.deleteNode(node.left, data);
    } else if (cmp > 0) {
      node.right = this.deleteNode(node.right, data);
    } else {
      // Encontrado el nodo a eliminar
      this.size--;

      // Nodo sin hijos
      if (node.left === null && node.right === null) {
        return null;
      }

      // Nodo con un hijo
      if (node.left === null) return node.right;
      if (node.right === null) return node.left;

      // Nodo con dos hijos: encontrar sucesor (mínimo en subárbol derecho)
      let minRight = node.right;
      while (minRight.left !== null) {
        minRight = minRight.left;
      }

      node.data = minRight.data;
      node.right = this.deleteNode(node.right, minRight.data);
    }

    return node;
  }

  /**
   * Obtiene el tamaño del árbol
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Verifica si el árbol está vacío
   */
  isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Limpia el árbol
   */
  clear(): void {
    this.root = null;
    this.size = 0;
  }

  /**
   * Convierte el árbol a array ordenado (in-order)
   */
  toArray(): T[] {
    return this.inOrder();
  }

  /**
   * Visualiza la estructura del árbol
   */
  visualize(): string {
    return this.visualizeNode(this.root, '', true);
  }

  private visualizeNode(
    node: BSTNode<T> | null,
    prefix: string,
    isLeft: boolean
  ): string {
    if (node === null) return '';

    let result = '';
    const nodeStr = String(node.data);

    result += prefix;
    result += isLeft ? '├── ' : '└── ';
    result += nodeStr + '\n';

    if (node.left || node.right) {
      if (node.left) {
        result += this.visualizeNode(
          node.left,
          prefix + (isLeft ? '│   ' : '    '),
          true
        );
      }
      if (node.right) {
        result += this.visualizeNode(
          node.right,
          prefix + (isLeft ? '│   ' : '    '),
          false
        );
      }
    }

    return result;
  }
}

/**
 * Interfaz para proyecto indexable
 */
export interface IndexedProject {
  projectId: string;
  projectName: string;
  createdAt: number;
  status: string;
  priority?: number;
}

/**
 * Índice de proyectos por fecha
 */
export class ProjectDateIndex {
  private tree: BinarySearchTree<IndexedProject>;

  constructor() {
    this.tree = new BinarySearchTree((a, b) => a.createdAt - b.createdAt);
  }

  /**
   * Agrega proyecto al índice
   */
  addProject(project: IndexedProject): void {
    this.tree.insert(project);
  }

  /**
   * Obtiene proyectos en rango de fechas
   */
  getProjectsByDateRange(startDate: number, endDate: number): IndexedProject[] {
    const min: IndexedProject = {
      projectId: '',
      projectName: '',
      createdAt: startDate,
      status: ''
    };
    const max: IndexedProject = {
      projectId: '',
      projectName: '',
      createdAt: endDate,
      status: ''
    };

    return this.tree.rangeSearch(min, max);
  }

  /**
   * Obtiene proyectos del último N días
   */
  getRecentProjects(days: number): IndexedProject[] {
    const now = Date.now();
    const nDaysAgo = now - days * 24 * 60 * 60 * 1000;
    return this.getProjectsByDateRange(nDaysAgo, now);
  }

  /**
   * Obtiene todos los proyectos ordenados por fecha
   */
  getAllSorted(): IndexedProject[] {
    return this.tree.inOrder();
  }

  /**
   * Obtiene proyecto más antiguo
   */
  getOldest(): IndexedProject | null {
    return this.tree.getMin();
  }

  /**
   * Obtiene proyecto más reciente
   */
  getNewest(): IndexedProject | null {
    return this.tree.getMax();
  }

  /**
   * Elimina proyecto del índice
   */
  removeProject(project: IndexedProject): boolean {
    return this.tree.delete(project);
  }

  /**
   * Obtiene estadísticas del índice
   */
  getStatistics() {
    return {
      totalProjects: this.tree.getSize(),
      treeHeight: this.tree.getHeight(),
      isBalanced: this.tree.isBalanced(),
      oldest: this.tree.getMin(),
      newest: this.tree.getMax()
    };
  }

  /**
   * Visualiza la estructura del árbol
   */
  visualize(): string {
    return this.tree.visualize();
  }
}

/**
 * Índice de proyectos por nombre (búsqueda alfanumérica)
 */
export class ProjectNameIndex {
  private tree: BinarySearchTree<IndexedProject>;

  constructor() {
    this.tree = new BinarySearchTree((a, b) =>
      a.projectName.localeCompare(b.projectName)
    );
  }

  /**
   * Agrega proyecto al índice
   */
  addProject(project: IndexedProject): void {
    this.tree.insert(project);
  }

  /**
   * Busca proyectos que comiencen con prefijo
   */
  searchByPrefix(prefix: string): IndexedProject[] {
    const minProj: IndexedProject = {
      projectId: '',
      projectName: prefix,
      createdAt: 0,
      status: ''
    };

    const maxPrefix = prefix.slice(0, -1) + String.fromCharCode(prefix.charCodeAt(prefix.length - 1) + 1);
    const maxProj: IndexedProject = {
      projectId: '',
      projectName: maxPrefix,
      createdAt: 0,
      status: ''
    };

    return this.tree.rangeSearch(minProj, maxProj);
  }

  /**
   * Obtiene todos los proyectos ordenados alfabéticamente
   */
  getAllSorted(): IndexedProject[] {
    return this.tree.inOrder();
  }

  /**
   * Visualiza la estructura del árbol
   */
  visualize(): string {
    return this.tree.visualize();
  }
}
