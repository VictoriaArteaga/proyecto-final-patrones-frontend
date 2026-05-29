// Categorías de diseño soportadas por el backend (enum DesignCategory).
export type DesignCategory =
  | 'EXTERIOR_ARCHITECTURE'
  | 'INTERIOR_ROOM'
  | 'FURNITURE_ITEM';

// Parámetros estructurados que se envían al regenerar un diseño rechazado.
// Todos opcionales; cada categoría usa un subconjunto distinto.
export interface ProjectParametersInput {
  lotWidth?: number;
  lotLength?: number;
  totalArea?: number;
  constructionType?: string;
  color?: string;
  numberOfFloors?: number;
  numberOfRooms?: number;
  numberOfBathrooms?: number;
  additionalElements?: string[];
  detailDescription?: string;
  roomType?: string;
  furnitureType?: string;
  furnitureWidthCm?: number;
  furnitureHeightCm?: number;
  furnitureDepthCm?: number;
  materials?: string;
  styleTrend?: string;
  placement?: string;
}

export interface ProjectResponseDTO {
  id: string;
  name: string;
  status: string;
  category: DesignCategory | null;
  imageOriginalUrl: string | null;
  image2DUrl: string | null;
  model3DUrl: string | null;
  createdAt: string;
  parameters: any | null;
}
