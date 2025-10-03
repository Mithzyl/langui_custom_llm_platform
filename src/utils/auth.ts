import { config } from "@/config/config";

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

export const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
};

export const login = async (email: string, password: string): Promise<any> => {
  try {
    const response = await fetch(`${config.backendUrl}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const token = await response.json();
    if (!token) {
      throw new Error('No token received from server');
    }
    setAuthToken(token);
    return token;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
