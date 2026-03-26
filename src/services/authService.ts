import api from "./api";

export interface User {
    name?: string;
    email: string;
    password: string;
}

// REGISTRO
export const registerUser = async (user: User) => {
    const response = await api.post("/api/auth/register", user);
    return response.data;
};

// LOGIN
export const loginUser = async (user: User) => {
    const response = await api.post("/api/auth/login", user);
    return response.data;
};