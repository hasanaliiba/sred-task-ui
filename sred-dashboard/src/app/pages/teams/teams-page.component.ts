import { Component } from '@angular/core';

import { TeamsTableComponent } from '../../components/teams-table/teams-table.component';
import { ClientHeaderComponent } from '../../components/client-header/client-header.component';

/**
 * Teams page (Manage group): read-only roster of teams with their members and
 * SR&ED vs Unclaimed hours for the selected period. Moved off the Analytics home
 * (which now shows only charts/KPIs, no grids).
 */
@Component({
  selector: 'app-teams-page',
  standalone: true,
  imports: [TeamsTableComponent, ClientHeaderComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div class="sticky top-14 lg:top-0 z-20 bg-gray-50/95 backdrop-blur py-2">
        <app-client-header></app-client-header>
      </div>
      <header>
        <h1 class="text-2xl font-bold text-ink">Teams</h1>
        <p class="text-sm text-gray-400">Members and SR&amp;ED vs Unclaimed hours per team for the selected period.</p>
      </header>
      <app-teams-table></app-teams-table>
    </div>
  `,
})
export class TeamsPageComponent {}
