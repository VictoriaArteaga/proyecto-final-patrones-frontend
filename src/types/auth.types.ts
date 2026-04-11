export interface LoginRequestDTO {
  email: string; 
  password: string;
}

export interface RegisterRequestDTO {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  message?: string; 
}