import { Component, inject } from '@angular/core';
import { AsyncPipe, DecimalPipe } from '@angular/common';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { HoursSplit } from '../../models';

/**
 * Teams table (Feature D). One row per team (plus an "Unassigned" group) with the
 * member count and aggregated SR&ED / Unclaimed / total hours for the selected
 * period. Period-reactive via teamHoursBreakdown$.
 */
@Component({
  selector: 'app-teams-table',
  standalone: true,
  imports: [AsyncPipe, DecimalPipe],
  templateUrl: './teams-table.component.html',
})
export class TeamsTableComponent {
  private readonly data = inject(DashboardDataService);
  readonly teams$ = this.data.teamHoursBreakdownFull$;

  /** Joined member names for display (string interpolation — safe to call in template). */
  names(members: HoursSplit[]): string {
    return members.map((m) => m.name).join(', ');
  }
}
