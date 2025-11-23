import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { JwtService } from './jwt.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  API_URL = environment.apiUrl;

  constructor(private http: HttpClient, private jwt: JwtService, private router: Router) {}

  login(email: string, password: string) {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<any>(
      `${this.API_URL}/auth/jwt/login`,
      body.toString(),
      { headers }
    ).pipe(
      tap(res => {
        // fastapi-users returns { access_token, token_type }
        this.jwt.setToken(res.access_token);
      })
    );
  }

  register(data: any) {
    return this.http.post(`${this.API_URL}/auth/register`, data)
      .pipe(
        catchError(err => throwError(() => err))
      );
  }

  logout() {
    this.jwt.removeToken();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}