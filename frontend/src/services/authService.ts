import { User } from '@/hooks/useAuth';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

const isBrowser = typeof window !== 'undefined';

class AuthService {
  private token: string | null = null;
  private currentUser: User | null = null;

  constructor() {
    this.initializeAuth();
  }

  initializeAuth() {
    if (isBrowser) {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token) {
        this.token = token;
        this.currentUser = userStr ? JSON.parse(userStr) : null;
      }
    }
  }

  async register(data: RegisterData): Promise<void> {
    const response = await fetch('/api/Auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Kayıt işlemi başarısız oldu');
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch('/api/Auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Giriş işlemi başarısız oldu');
    }

    const authData = await response.json();
    this.token = authData.token;
    this.currentUser = authData.user;
    
    if (isBrowser) {
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
      
      // Custom event dispatch for login
      window.dispatchEvent(new CustomEvent('authChange', {
        detail: { type: 'login', user: authData.user }
      }));
    }

    return authData;
  }

  async getCurrentUser(): Promise<User | null> {
    // İlk olarak localStorage'daki bilgileri kontrol et
    if (isBrowser) {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          this.token = token;
          this.currentUser = user;
          return user;
        } catch (error) {
          // JSON parse hatası varsa localStorage'ı temizle
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.token = null;
          this.currentUser = null;
          return null;
        }
      }
    }

    // localStorage'da bilgi yoksa veya browser değilse null döndür
    return null;
  }

  logout(): void {
    this.token = null;
    this.currentUser = null;
    if (isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  isAuthenticated(): boolean {
    if (isBrowser) {
      const token = localStorage.getItem('token');
      return !!token;
    }
    return !!this.token;
  }

  getToken(): string | null {
    if (isBrowser) {
      return localStorage.getItem('token');
    }
    return this.token;
  }
}

export const authService = new AuthService();