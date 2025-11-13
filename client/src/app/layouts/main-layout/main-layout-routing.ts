import { Routes } from '@angular/router';
import { MainLayout } from './main-layout';
import { Dashboard } from '../dashboard/dashboard';


export const MainLayoutRoutes: Routes = [
    {
      path: '',
      component: MainLayout,
      children: [

          { path: 'dashboard', component: Dashboard}
        
      ]
    }
];