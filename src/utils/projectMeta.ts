import {
  Apartment as ApartmentIcon,
  Chair as ChairIcon,
  HelpOutlined as HelpOutlineIcon,
} from '@mui/icons-material';
import type { DesignCategory } from '../types/project.types';

// Metadatos de cada categoría: etiqueta humana, color de la paleta e ícono.
export const CATEGORY_META: Record<
  DesignCategory,
  { label: string; color: string; icon: typeof ApartmentIcon }
> = {
  EXTERIOR_ARCHITECTURE: {
    label: 'Arquitectura Exterior',
    color: '#6B9BD1', // lightBlue
    icon: ApartmentIcon,
  },
  FURNITURE_ITEM: {
    label: 'Mueble u Objeto',
    color: '#2C4A6D', // darkBlue
    icon: ChairIcon,
  },
};

export const getCategoryMeta = (category?: DesignCategory | null) =>
  (category && CATEGORY_META[category]) || {
    label: 'Sin categoría',
    color: '#9AA0A6',
    icon: HelpOutlineIcon,
  };

// Etiquetas humanas y colores para cada estado del proyecto.
const STATUS_META: Record<string, { label: string; color: string }> = {
  IMAGE_UPLOADED: { label: 'Imagen cargada', color: '#6B9BD1' },
  GENERATING_2D: { label: 'Generando diseño 2D', color: '#6B9BD1' },
  WAITING_2D_APPROVAL: { label: 'Esperando tu aprobación', color: '#9E8DAD' },
  REJECTED_2D: { label: 'Diseño descartado', color: '#E74C3C' },
  GENERATING_2D_WITH_PARAMS: { label: 'Generando diseño 2D', color: '#6B9BD1' },
  WAITING_FINAL_APPROVAL: { label: 'Listo para generar 3D', color: '#9E8DAD' },
  GENERATING_3D_MODEL: { label: 'Generando modelo 3D', color: '#6B9BD1' },
  COMPLETED: { label: 'Completado', color: '#27AE60' },
  FAILED: { label: 'Falló la generación', color: '#E74C3C' },
  DELETED: { label: 'Eliminado', color: '#9AA0A6' },
};

export const getStatusMeta = (status?: string | null) =>
  (status && STATUS_META[status]) || {
    label: status || 'Desconocido',
    color: '#9AA0A6',
  };
