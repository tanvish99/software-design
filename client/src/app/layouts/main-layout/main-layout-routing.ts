import { Routes } from '@angular/router';
import { MainLayout } from './main-layout';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { TransactionsComponent } from 'src/app/transactions/transactions.component';
import { BudgetsComponent } from 'src/app/budgets/budgets.component';
import { SettingsComponent } from 'src/app/settings/settings.component';

export const MainLayoutRoutes: Routes = [
    {
      path: '',
      component: MainLayout,
      children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

          { path: 'dashboard', component: DashboardComponent},
          { path: 'transactions', component: TransactionsComponent },
          { path: 'budgets', component: BudgetsComponent },
          { path: 'settings', component: SettingsComponent }
        
      ]
    }
];