import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import type { ReactNode } from 'react';
import { Queue } from '../utils/Queue';
import { projectService } from '../services/project.service';
import { useNotifications } from './NotificationsContext';

// Una solicitud de generación 3D en la cola.
export interface GenerationJob {
  projectId: string;
  projectName: string;
}

interface GenerationQueueValue {
  // Encola una generación 3D. Si la cola está libre, arranca de inmediato.
  enqueue: (job: GenerationJob) => void;
  // Trabajo que se está generando ahora mismo (o null si no hay ninguno).
  current: GenerationJob | null;
  // Trabajos en espera, en orden FIFO.
  pending: GenerationJob[];
  // ¿Hay alguna generación en curso?
  isProcessing: boolean;
  // Posición de un proyecto: 0 = generando ahora, >=1 = en espera, -1 = no está.
  positionOf: (projectId: string) => number;
}

const GenerationQueueContext = createContext<GenerationQueueValue | null>(null);

// Cada cuánto consultamos el backend para saber si la generación 3D terminó.
const POLL_INTERVAL_MS = 5_000;
// Tope de seguridad para no sondear indefinidamente (~10 min).
const MAX_POLLS = 120;

export function GenerationQueueProvider({ children }: { children: ReactNode }) {
  const { refresh: refreshNotifications } = useNotifications();

  // La cola real (estructura de datos). Vive en un ref porque el worker
  // asíncrono la muta fuera del ciclo de render.
  const queueRef = useRef(new Queue<GenerationJob>());
  // Bandera para garantizar que solo se procesa un trabajo a la vez.
  const processingRef = useRef(false);
  // Espejo del trabajo actual en un ref, para leerlo sin closures obsoletos.
  const currentRef = useRef<GenerationJob | null>(null);
  // Evita setState tras desmontar.
  const mountedRef = useRef(true);

  // Espejos en estado para que la UI se re-renderice.
  const [current, setCurrent] = useState<GenerationJob | null>(null);
  const [pending, setPending] = useState<GenerationJob[]>([]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const syncPending = useCallback(() => {
    if (mountedRef.current) setPending(queueRef.current.toArray());
  }, []);

  const setCurrentJob = useCallback((job: GenerationJob | null) => {
    currentRef.current = job;
    if (mountedRef.current) setCurrent(job);
  }, []);

  // Espera (sondeando el backend) a que la generación 3D del proyecto termine,
  // ya sea con éxito (model3DUrl / COMPLETED), con fallo (FAILED) o porque el
  // usuario la detuvo (deja de estar en GENERATING_3D_MODEL).
  const waitUntilDone = useCallback((projectId: string) => {
    return new Promise<void>((resolve) => {
      let polls = 0;
      const tick = async () => {
        polls++;
        try {
          const p = await projectService.getProject(projectId);
          const finished =
            !!p.model3DUrl || p.status !== 'GENERATING_3D_MODEL';
          if (finished) {
            resolve();
            return;
          }
        } catch {
          // Error transitorio de red: reintentamos en el siguiente tick.
        }
        if (polls >= MAX_POLLS) {
          resolve();
          return;
        }
        setTimeout(tick, POLL_INTERVAL_MS);
      };
      setTimeout(tick, POLL_INTERVAL_MS);
    });
  }, []);

  // Ejecuta un trabajo: dispara la generación 3D y espera a que termine.
  const runJob = useCallback(
    async (job: GenerationJob) => {
      // 1. Dispara la generación 3D en el backend (status -> GENERATING_3D_MODEL).
      await projectService.generate3D(job.projectId);
      refreshNotifications(); // "Comenzó la generación..." (la crea el backend)

      // 2. Espera a que el backend termine antes de pasar al siguiente.
      await waitUntilDone(job.projectId);
      refreshNotifications(); // "Modelo 3D listo" / "Hubo un problema..."
    },
    [refreshNotifications, waitUntilDone]
  );

  // Toma el siguiente trabajo de la cola y lo procesa. Se vuelve a llamar a sí
  // mismo al terminar, vaciando la cola UNA a UNA en orden FIFO.
  const processNext = useCallback(async () => {
    if (processingRef.current) return; // ya hay uno en curso
    const job = queueRef.current.dequeue();
    syncPending();
    if (!job) return; // cola vacía

    processingRef.current = true;
    setCurrentJob(job);

    try {
      await runJob(job);
    } catch (err) {
      console.error('[GenerationQueue] Falló el trabajo', job, err);
    } finally {
      processingRef.current = false;
      setCurrentJob(null);
      // Procesa el siguiente (si quedan).
      void processNext();
    }
  }, [runJob, syncPending, setCurrentJob]);

  const enqueue = useCallback(
    (job: GenerationJob) => {
      // Evitamos encolar dos veces el mismo proyecto.
      const alreadyCurrent = currentRef.current?.projectId === job.projectId;
      const alreadyQueued = queueRef.current
        .toArray()
        .some((j) => j.projectId === job.projectId);
      if (alreadyCurrent || alreadyQueued) return;

      queueRef.current.enqueue(job);
      syncPending();
      void processNext();
    },
    [processNext, syncPending]
  );

  const positionOf = useCallback(
    (projectId: string): number => {
      if (current?.projectId === projectId) return 0;
      const idx = pending.findIndex((j) => j.projectId === projectId);
      return idx === -1 ? -1 : idx + 1;
    },
    [current, pending]
  );

  const value = useMemo<GenerationQueueValue>(
    () => ({
      enqueue,
      current,
      pending,
      isProcessing: current !== null,
      positionOf,
    }),
    [enqueue, current, pending, positionOf]
  );

  return (
    <GenerationQueueContext.Provider value={value}>
      {children}
    </GenerationQueueContext.Provider>
  );
}

export function useGenerationQueue(): GenerationQueueValue {
  const ctx = useContext(GenerationQueueContext);
  if (!ctx) {
    throw new Error(
      'useGenerationQueue debe usarse dentro de <GenerationQueueProvider>'
    );
  }
  return ctx;
}
