import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class JwtService {
  private readonly TOKEN_KEY = 'token';

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  removeToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  decode<T = any>(): T | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode<T>(token);
    } catch {
      return null;
    }
  }

  isExpired(): boolean {
    const decoded: any = this.decode();
    if (!decoded || !decoded.exp) return true;
    // exp is in seconds
    return Date.now() > decoded.exp * 1000;
  }
}