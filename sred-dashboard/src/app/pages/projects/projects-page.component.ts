import { Component } from '@angular/core';

import { ProjectGridComponent } from '../../components/project-grid/project-grid.component';
import { ClientHeaderComponent } from '../../components/client-header/client-header.component';

/** Projects management page (Manage group): project list + CRUD (cascade on delete). */
@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [ProjectGridComponent, ClientHeaderComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div class="sticky top-14 lg:top-0 z-20 bg-gray-50/95 backdrop-blur py-2">
        <app-client-header></app-client-header>
      </div>
      <header>
        <h1 class="text-2xl font-bold text-ink">Projects</h1>
        <p class="text-sm text-gray-400">Add, edit, and remove projects · removing one cascades to its hours and invoices.</p>
      </header>
      <app-project-grid></app-project-grid>
    </div>
  `,
})
export class ProjectsPageComponent {}
