import { Injectable, inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { JwtService } from './jwt.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private jwt = inject(JwtService);

  buildHeaders(contentType = 'application/json'): HttpHeaders {
    const token = this.jwt.getToken();
    let headers = new HttpHeaders({ 'Content-Type': contentType });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }
}