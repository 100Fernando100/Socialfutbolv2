import { User, AuthState, LoginCredentials, LoginResponse } from './types';

const TOKEN_KEY = 'ops1_token';
const USER_KEY = 'ops1_user';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setAuthData(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthData(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAuthState(): AuthState {
  const token = getStoredToken();
  const user = getStoredUser();
  return {
    token,
    user,
    isAuthenticated: !!token && !!user,
  };
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() >= exp;
  } catch {
    return true;
  }
}

export function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Mock login for development - replace with real API call
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  // In production, this would call the actual auth endpoint
  // For now, we'll simulate a successful login for demo purposes

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Demo credentials check
  if (credentials.email && credentials.password) {
    const mockUser: User = {
      id: 'client-001',
      email: credentials.email,
      clientName: credentials.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      configId: 'config-001',
    };

    // Generate a mock JWT token (for demo purposes only)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: mockUser.id,
      email: mockUser.email,
      clientName: mockUser.clientName,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    }));
    const signature = btoa('mock-signature');
    const token = `${header}.${payload}.${signature}`;

    return { token, user: mockUser };
  }

  throw new Error('Invalid credentials');
}

export async function logout(): Promise<void> {
  clearAuthData();
}
