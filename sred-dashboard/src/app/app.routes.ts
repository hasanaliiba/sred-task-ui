import { Routes } from '@angular/router';

import { authGuard, adminGuard } from './core/guards';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminFeedbackComponent } from './pages/admin/admin-feedback.component';
import { AdminSettingsComponent } from './pages/admin/admin-settings.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'admin/feedback', component: AdminFeedbackComponent, canActivate: [adminGuard] },
  { path: 'admin/settings', component: AdminSettingsComponent, canActivate: [adminGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
