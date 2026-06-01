import { Component } from '@angular/core';

/** Employees management page (Manage group). CRUD content moves here in P2.3. */
@Component({
  selector: 'app-employees-page',
  standalone: true,
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-8">
        <h1 class="text-2xl font-bold text-ink">Employees</h1>
        <p class="text-gray-500 mt-1">Salary grid, add/edit/remove, and SR&amp;ED detail move here in P2.3.</p>
      </div>
    </div>
  `,
})
export class EmployeesPageComponent {}
