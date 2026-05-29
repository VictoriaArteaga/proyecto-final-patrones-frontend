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
  // El JWT ya NO viaja en el cuerpo: el backend lo fija en una cookie HttpOnly.
  token?: string | null;
  message?: string;
}

export interface UserProfileDTO {
  id: number;
  username: string;
  email: string;
  role: string;
  recoveryEmail: string | null;
  twoFactorEnabled: boolean;
  // Foto de perfil persistida en el backend (URL o data-URL base64). null = sin foto.
  avatarUrl: string | null;
}