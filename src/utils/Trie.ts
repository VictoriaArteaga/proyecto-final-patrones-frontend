// =====================================================================
// Trie (árbol de prefijos) para autocompletado de búsqueda
// =====================================================================
// En vez de recorrer los N proyectos comparando strings (búsqueda lineal
// O(n)) cada vez que el usuario teclea, el Trie indexa los nombres por sus
// caracteres. Al escribir "mi", baja por los nodos  m → i  y en ese nodo ya
// tiene guardados TODOS los ids de proyectos que pasan por ese prefijo.
//
// Complejidad de la consulta: O(k), donde k es la longitud de lo escrito —
// no depende de cuántos proyectos haya. Para lograrlo, al insertar una
// palabra guardamos su id en CADA nodo del camino (no solo en el final).
//
// Con insertAllSubstrings() (trie de sufijos) la misma búsqueda por prefijo
// también encuentra coincidencias por SUBCADENA, no solo por inicio del texto.

class TrieNode {
  // Hijos por carácter.
  children: Map<string, TrieNode> = new Map();
  // Ids de los proyectos cuyo texto pasa por este nodo (prefijo hasta aquí).
  ids: Set<string> = new Set();
}

export class Trie {
  private root = new TrieNode();

  // Normaliza igual en inserción y búsqueda (minúsculas, sin espacios extra).
  private normalize(text: string): string {
    return text.toLowerCase().trim();
  }

  // Inserta una palabra asociada a un id. O(longitud de la palabra).
  insert(word: string, id: string): void {
    const w = this.normalize(word);
    if (!w) return;

    let node = this.root;
    for (const char of w) {
      let child = node.children.get(char);
      if (!child) {
        child = new TrieNode();
        node.children.set(char, child);
      }
      // El id "pasa por" este nodo → autocompletado en O(k) al consultar.
      child.ids.add(id);
      node = child;
    }
  }

  // Inserta TODOS los sufijos del texto. Truco clásico de "trie de sufijos":
  // como cualquier subcadena del texto es el PREFIJO de alguno de sus sufijos,
  // buscar por prefijo encuentra también coincidencias por subcadena
  // (no solo lo que empieza con el texto). Sigue siendo O(k) al consultar.
  // Ej: "casa" inserta "casa", "asa", "sa", "a" → "asa" encuentra el proyecto.
  insertAllSubstrings(text: string, id: string): void {
    const t = this.normalize(text);
    for (let i = 0; i < t.length; i++) {
      this.insert(t.slice(i), id);
    }
  }

  // Devuelve los ids de todo lo que empieza con `prefix`. O(longitud del prefijo).
  // Prefijo vacío → [] (sin filtro por nombre).
  getIdsWithPrefix(prefix: string): string[] {
    const p = this.normalize(prefix);
    if (!p) return [];

    let node = this.root;
    for (const char of p) {
      const child = node.children.get(char);
      if (!child) return []; // ningún proyecto empieza con ese prefijo
      node = child;
    }
    return [...node.ids];
  }
}
