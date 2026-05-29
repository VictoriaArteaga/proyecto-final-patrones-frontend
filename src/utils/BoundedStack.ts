// =====================================================================
// Pila acotada genérica (Bounded Stack / LIFO con capacidad máxima)
// =====================================================================
// Las notificaciones son LIFO por naturaleza: la última en llegar es la
// primera que se muestra. Esta pila guarda solo las últimas `capacity`
// (descarta automáticamente la más antigua cuando se llena), evitando que
// crezca sin control. El "tope" de la pila es el índice 0 (lo más reciente).

export class BoundedStack<T> {
  private items: T[];
  readonly capacity: number;

  constructor(capacity = 20, initialTopFirst: T[] = []) {
    this.capacity = capacity;
    // Se asume que `initialTopFirst` viene del más reciente al más antiguo.
    this.items = initialTopFirst.slice(0, capacity);
  }

  // Apila un elemento en el tope. Si se supera la capacidad, descarta el más
  // antiguo (el del fondo de la pila). O(n) por la copia, pero n es pequeño.
  push(item: T): void {
    this.items = [item, ...this.items].slice(0, this.capacity);
  }

  // Tope de la pila (lo más reciente) sin sacarlo.
  peek(): T | undefined {
    return this.items[0];
  }

  // Devuelve los elementos del más reciente al más antiguo (para renderizar).
  toArray(): T[] {
    return [...this.items];
  }

  get size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // Construye una pila a partir de un arreglo (más reciente primero).
  static from<T>(itemsTopFirst: T[], capacity = 20): BoundedStack<T> {
    return new BoundedStack<T>(capacity, itemsTopFirst);
  }
}
