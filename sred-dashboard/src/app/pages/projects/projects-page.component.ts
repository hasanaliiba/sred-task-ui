import { Component } from '@angular/core';

import { ProjectManagerComponent } from '../../components/project-manager/project-manager.component';

/** Projects management page (Manage group): project list + CRUD (cascade on delete). */
@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [ProjectManagerComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-4">
      <header>
        <h1 class="text-2xl font-bold text-ink">Projects</h1>
        <p class="text-sm text-gray-400">Add, edit, and remove projects · removing one cascades to its hours and invoices.</p>
      </header>
      <app-project-manager></app-project-manager>
    </div>
  `,
})
export class ProjectsPageComponent {}
