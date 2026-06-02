import { Component } from '@angular/core';

import { EmployeeGridComponent } from '../../components/employee-grid/employee-grid.component';
import { ClientHeaderComponent } from '../../components/client-header/client-header.component';

/** Employees management page (Manage group): salary grid + CRUD + SR&ED detail. */
@Component({
  selector: 'app-employees-page',
  standalone: true,
  imports: [EmployeeGridComponent, ClientHeaderComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div class="sticky top-14 lg:top-0 z-20 bg-gray-50/95 backdrop-blur py-2">
        <app-client-header></app-client-header>
      </div>
      <header>
        <h1 class="text-2xl font-bold text-ink">Employees</h1>
        <p class="text-sm text-gray-400">Add, edit, and remove staff · click a name for the SR&amp;ED breakdown.</p>
      </header>
      <app-employee-grid></app-employee-grid>
    </div>
  `,
})
export class EmployeesPageComponent {}
