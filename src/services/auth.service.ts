import axios from 'axios';
import type { LoginRequestDTO, RegisterRequestDTO, AuthResponseDTO } from '../types/auth.types';

const API_URL = 'http://localhost:8080/api/v1/auth';

export const authService = {
  
  // Función que ya tenías para iniciar sesión
  login: async (credentials: LoginRequestDTO): Promise<AuthResponseDTO> => {
    const response = await axios.post<AuthResponseDTO>(`${API_URL}/login`, credentials);
    return response.data;
  },

  // NUEVA: Función para registrar un usuario
  register: async (userData: RegisterRequestDTO) => {
    // Nota: Revisa que la ruta '/register' sea la correcta según tu AuthController en Java
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  }

};