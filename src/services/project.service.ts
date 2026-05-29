import api from './api';
import type {
  DesignCategory,
  ProjectResponseDTO,
} from '../types/project.types';

export const projectService = {

  // 1. Crear proyecto subiendo la imagen inicial
  createProject: async (
    file: File,
    name: string,
    category: DesignCategory
  ): Promise<ProjectResponseDTO> => {

    const formData = new FormData();

    formData.append('file', file);
    formData.append('name', name);
    formData.append('category', category);

    const response = await api.post<ProjectResponseDTO>(
      '/projects',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  // 2. Generar render 2D
  generate2D: async (
    projectId: string,
    description: string
  ): Promise<ProjectResponseDTO> => {

    const payload = { description };

    console.log('Payload enviado a generate-2d:', payload);

    const response = await api.post<ProjectResponseDTO>(
      `/projects/${projectId}/generate-2d`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  },

  // 3. Aprobar diseño 2D
  approveProject: async (
    projectId: string
  ): Promise<ProjectResponseDTO> => {

    const response = await api.post<ProjectResponseDTO>(
      `/projects/${projectId}/approve`
    );

    return response.data;
  },

  // 4. Rechazar diseño 2D
  rejectProject: async (
    projectId: string
  ): Promise<ProjectResponseDTO> => {

    const response = await api.post<ProjectResponseDTO>(
      `/projects/${projectId}/reject`
    );

    return response.data;
  },

  // 5. Generar modelo 3D
  generate3D: async (
    projectId: string
  ): Promise<ProjectResponseDTO> => {

    const response = await api.post<ProjectResponseDTO>(
      `/projects/${projectId}/generate-3d`
    );

    return response.data;
  },

  // 6. Obtener detalles del proyecto
  getProject: async (
    projectId: string
  ): Promise<ProjectResponseDTO> => {

    const response = await api.get<ProjectResponseDTO>(
      `/projects/${projectId}`
    );

    return response.data;
  },

  // 7. Listar todos los proyectos del usuario
  getProjects: async (): Promise<ProjectResponseDTO[]> => {

    const response = await api.get<ProjectResponseDTO[]>(
      '/projects'
    );

    return response.data;
  },

  // 8. Eliminar un proyecto
  deleteProject: async (projectId: string): Promise<void> => {

    await api.delete(`/projects/${projectId}`);
  }
};