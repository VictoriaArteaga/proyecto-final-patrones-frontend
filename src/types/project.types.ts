// Categorías de diseño soportadas por el backend (enum DesignCategory).
export type DesignCategory =
  | 'EXTERIOR_ARCHITECTURE'
  | 'INTERIOR_ROOM'
  | 'FURNITURE_ITEM';

export interface ProjectResponseDTO {
  id: string;
  name: string;
  status: string;
  category: DesignCategory | null;
  image2DUrl: string | null;
  model3DUrl: string | null;
  createdAt: string;
  parameters: any | null;
}
