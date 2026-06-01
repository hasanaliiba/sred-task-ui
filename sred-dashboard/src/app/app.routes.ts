import { Routes } from '@angular/router';

import { authGuard, adminGuard } from './core/guards';
import { LoginComponent } from './pages/login/login.component';
import { ClientShellComponent } from './layouts/client-shell.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EmployeesPageComponent } from './pages/employees/employees-page.component';
import { ProjectsPageComponent } from './pages/projects/projects-page.component';
import { InvoicesPageComponent } from './pages/invoices/invoices-page.component';
import { AdminFeedbackComponent } from './pages/admin/admin-feedback.component';
import { AdminSettingsComponent } from './pages/admin/admin-settings.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // Client area: sidebar shell + routed pages (any authenticated user; scoped to their client).
  {
    path: '',
    component: ClientShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'analytics', component: DashboardComponent },
      { path: 'employees', component: EmployeesPageComponent },
      { path: 'projects', component: ProjectsPageComponent },
      { path: 'invoices', component: InvoicesPageComponent },
      { path: '', pathMatch: 'full', redirectTo: 'analytics' },
    ],
  },

  // Admin area.
  { path: 'admin/feedback', component: AdminFeedbackComponent, canActivate: [adminGuard] },
  { path: 'admin/settings', component: AdminSettingsComponent, canActivate: [adminGuard] },

  { path: '**', redirectTo: 'login' },
];
