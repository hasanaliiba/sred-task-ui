import { Component } from '@angular/core';

import { TeamGridComponent } from '../../components/team-grid/team-grid.component';
import { ClientHeaderComponent } from '../../components/client-header/client-header.component';

/**
 * Teams page (Manage group): teams with their members and SR&ED vs Unclaimed hours
 * (full year) + CRUD — add / edit / remove teams and assign members. Lives off the
 * Analytics home (which shows only charts/KPIs, no grids).
 */
@Component({
  selector: 'app-teams-page',
  standalone: true,
  imports: [TeamGridComponent, ClientHeaderComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div class="sticky top-14 lg:top-0 z-20 bg-gray-50/95 backdrop-blur py-2">
        <app-client-header></app-client-header>
      </div>
      <header>
        <h1 class="text-2xl font-bold text-ink">Teams</h1>
        <p class="text-sm text-gray-400">Add, edit, and remove teams · assign members · removing a team unassigns its members.</p>
      </header>
      <app-team-grid></app-team-grid>
    </div>
  `,
})
export class TeamsPageComponent {}
