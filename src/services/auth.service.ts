import api from './api';
import type { LoginRequestDTO, RegisterRequestDTO, AuthResponseDTO } from '../types/auth.types';

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
  }

};