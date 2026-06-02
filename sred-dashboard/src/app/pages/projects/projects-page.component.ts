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
      <app-project-grid></app-project-grid>
    </div>
  `,
})
export class ProjectsPageComponent {}
