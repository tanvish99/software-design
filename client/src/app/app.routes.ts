import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./auth/register.component').then(m => m.RegisterComponent) },

  {
    path: '',
    loadChildren: () => import('./layouts/main-layout/main-layout-routing').then(m => m.MainLayoutRoutes),
    canActivate: [AuthGuard]
  },

  // MUST BE LAST
  { path: '**', redirectTo: 'login' }
];