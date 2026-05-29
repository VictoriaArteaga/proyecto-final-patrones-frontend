import api from './api';
import type { LoginRequestDTO, RegisterRequestDTO, AuthResponseDTO, UserProfileDTO } from '../types/auth.types';

export const authService = {
  
  // Función que ya tenías para iniciar sesión
  login: async (credentials: LoginRequestDTO): Promise<AuthResponseDTO> => {
    const response = await api.post<AuthResponseDTO>('/auth/login', credentials);
    return response.data;
  },

  // NUEVA: Función para registrar un usuario
  register: async (userData: RegisterRequestDTO) => {
    // Nota: Revisa que la ruta '/register' sea la correcta según tu AuthController en Java
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Función para verificar cuenta
  verify: async (token: string) => {
    const response = await api.get(`/auth/verify?token=${token}`);
    return response.data;
  },

  // Cierra sesión: el backend borra la cookie HttpOnly del navegador.
  logout: async () => {
    await api.post('/auth/logout');
  },

  // Datos del usuario autenticado (para "Mi perfil")
  getProfile: async (): Promise<UserProfileDTO> => {
    const response = await api.get<UserProfileDTO>('/users/me');
    return response.data;
  },

  // Guarda/actualiza la foto de perfil en el backend (ligada a la cuenta).
  // `avatar` es un data-URL base64 (data:image/...;base64,....).
  updateAvatar: async (avatar: string): Promise<UserProfileDTO> => {
    const response = await api.put<UserProfileDTO>('/users/me/avatar', { avatar });
    return response.data;
  },

  // Elimina la foto de perfil del backend.
  deleteAvatar: async (): Promise<void> => {
    await api.delete('/users/me/avatar');
  },
};