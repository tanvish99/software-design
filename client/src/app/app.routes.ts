import { Routes } from '@angular/router';


export const routes: Routes = [
  {
        path: '',
        loadChildren: () => import('./layouts/main-layout/main-layout-routing').then(m => m.MainLayoutRoutes)
      }
  ];

