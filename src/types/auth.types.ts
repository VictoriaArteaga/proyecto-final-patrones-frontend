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

export interface UserProfileDTO {
  id: number;
  username: string;
  email: string;
  role: string;
  recoveryEmail: string | null;
  twoFactorEnabled: boolean;
}