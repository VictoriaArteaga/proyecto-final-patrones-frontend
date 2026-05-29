// =====================================================================
// Lista doblemente enlazada genérica
// =====================================================================
// Cada nodo guarda un valor y dos referencias: al nodo anterior (prev) y
// al siguiente (next). Esto permite recorrer la lista en ambos sentidos y
// eliminar un nodo en O(1) una vez localizado (reconectando sus vecinos),
// sin desplazar el resto de elementos como ocurre en un arreglo.

class DLLNode<T> {
  value: T;
  prev: DLLNode<T> | null = null;
  next: DLLNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export class DoublyLinkedList<T> {
  private head: DLLNode<T> | null = null;
  private tail: DLLNode<T> | null = null;
  private count = 0;

  // Cantidad de elementos. O(1).
  get size(): number {
    return this.count;
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  // Inserta al final. O(1).
  addLast(value: T): void {
    const node = new DLLNode(value);

    if (this.tail === null) {
      this.head = node;
      this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }

    this.count++;
  }

  // Inserta al inicio. O(1).
  addFirst(value: T): void {
    const node = new DLLNode(value);

    if (this.head === null) {
      this.head = node;
      this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }

    this.count++;
  }

  // Elimina el primer nodo que cumpla el predicado.
  // Buscarlo es O(n); desenlazarlo es O(1). Devuelve true si eliminó algo.
  remove(predicate: (value: T) => boolean): boolean {
    let current = this.head;

    while (current !== null) {
      if (predicate(current.value)) {
        // Reconectamos el anterior con el siguiente.
        if (current.prev !== null) {
          current.prev.next = current.next;
        } else {
          this.head = current.next; // era la cabeza
        }

        if (current.next !== null) {
          current.next.prev = current.prev;
        } else {
          this.tail = current.prev; // era la cola
        }

        this.count--;
        return true;
      }

      current = current.next;
    }

    return false;
  }

  // Recorre la lista y devuelve una NUEVA lista con los que cumplan el
  // predicado, conservando el orden. O(n).
  filter(predicate: (value: T) => boolean): DoublyLinkedList<T> {
    const result = new DoublyLinkedList<T>();
    let current = this.head;
    while (current !== null) {
      if (predicate(current.value)) {
        result.addLast(current.value);
      }
      current = current.next;
    }
    return result;
  }

  // Devuelve el primer valor que cumpla el predicado (o null). O(n).
  find(predicate: (value: T) => boolean): T | null {
    let current = this.head;
    while (current !== null) {
      if (predicate(current.value)) return current.value;
      current = current.next;
    }
    return null;
  }

  // Recorrido normal (cabeza → cola) como arreglo. Útil para renderizar.
  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current !== null) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  // Recorrido inverso (cola → cabeza). Aprovecha los punteros prev.
  toArrayReverse(): T[] {
    const result: T[] = [];
    let current = this.tail;
    while (current !== null) {
      result.push(current.value);
      current = current.prev;
    }
    return result;
  }

  // Permite usar for...of y el spread (...) sobre la lista.
  *[Symbol.iterator](): IterableIterator<T> {
    let current = this.head;
    while (current !== null) {
      yield current.value;
      current = current.next;
    }
  }

  // Copia superficial: nuevos nodos, mismos valores. Sirve para entregar una
  // instancia nueva a React (cambia la referencia) y que vuelva a renderizar.
  clone(): DoublyLinkedList<T> {
    return DoublyLinkedList.from(this);
  }

  // Construye una lista a partir de cualquier iterable (arreglo, otra lista...).
  static from<T>(items: Iterable<T>): DoublyLinkedList<T> {
    const list = new DoublyLinkedList<T>();
    for (const item of items) {
      list.addLast(item);
    }
    return list;
  }
}
