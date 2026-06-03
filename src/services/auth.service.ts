import api from './api';

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
}

export interface User {
    id: number;
    email: string;
    name: string;
    role: string;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    user: User;
}

export const authService = {
    async login(data: LoginData): Promise<LoginResponse> {
        const response = await api.post('/auth/login', data);
        return response.data;
    },

    async register(data: RegisterData): Promise<LoginResponse> {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getToken(): string | null {
        return localStorage.getItem('token');
    },

    getUser(): User | null {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    },
};