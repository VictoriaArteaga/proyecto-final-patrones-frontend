// =====================================================================
// Cola genérica FIFO (First In, First Out)
// =====================================================================
// El primero en entrar es el primero en salir. La usamos para serializar
// las generaciones de modelos 3D: si el usuario lanza varias seguidas, se
// encolan y se procesan UNA a UNA en orden, en vez de dispararse en paralelo
// (lo que perdería el orden y saturaría el backend).
//
// Implementada con lista enlazada simple + puntero a la cola, de modo que
// encolar (enqueue) y desencolar (dequeue) son O(1) — sin el O(n) que tendría
// un Array.shift().

class QueueNode<T> {
  value: T;
  next: QueueNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export class Queue<T> {
  private head: QueueNode<T> | null = null; // frente: el próximo en salir
  private tail: QueueNode<T> | null = null; // final: el último en entrar
  private count = 0;

  // Cantidad de elementos. O(1).
  get size(): number {
    return this.count;
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  // Encola al final. O(1).
  enqueue(value: T): void {
    const node = new QueueNode(value);

    if (this.tail === null) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }

    this.count++;
  }

  // Desencola del frente (el más antiguo). O(1). undefined si está vacía.
  dequeue(): T | undefined {
    if (this.head === null) return undefined;

    const node = this.head;
    this.head = node.next;

    if (this.head === null) {
      this.tail = null; // la cola quedó vacía
    }

    this.count--;
    return node.value;
  }

  // Mira el frente sin sacarlo. O(1).
  peek(): T | undefined {
    return this.head?.value;
  }

  // Frente → final como arreglo (orden de salida). Útil para renderizar.
  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current !== null) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  // Permite for...of y spread sobre la cola.
  *[Symbol.iterator](): IterableIterator<T> {
    let current = this.head;
    while (current !== null) {
      yield current.value;
      current = current.next;
    }
  }

  // Construye una cola a partir de cualquier iterable (respeta el orden).
  static from<T>(items: Iterable<T>): Queue<T> {
    const queue = new Queue<T>();
    for (const item of items) {
      queue.enqueue(item);
    }
    return queue;
  }
}
