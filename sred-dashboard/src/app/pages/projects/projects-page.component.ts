import { Component } from '@angular/core';

/** Projects management page (Manage group). CRUD content moves here in P2.3. */
@Component({
  selector: 'app-projects-page',
  standalone: true,
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-8">
        <h1 class="text-2xl font-bold text-ink">Projects</h1>
        <p class="text-gray-500 mt-1">Project list + add/edit/remove (with cascade) move here in P2.3.</p>
      </div>
    </div>
  `,
})
export class ProjectsPageComponent {}
