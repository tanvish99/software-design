import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { JwtService } from '../services/jwt.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = this.jwt.getToken();

    if (!token) {
      return this.router.createUrlTree(['/login']);
    }

    if (this.jwt.isExpired()) {
      // remove expired token and redirect
      this.jwt.removeToken();
      return this.router.createUrlTree(['/login']);
    }

    return true;
  }
}