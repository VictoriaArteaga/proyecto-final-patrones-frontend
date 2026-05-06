export interface ProjectResponseDTO {
  id: string;
  name: string;
  status: string;
  image2DUrl: string | null;
  model3DUrl: string | null;
  createdAt: string;
  parameters: any | null;
}
