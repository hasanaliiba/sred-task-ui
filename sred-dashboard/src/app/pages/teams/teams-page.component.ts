import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { TeamGridComponent } from '../../components/team-grid/team-grid.component';
import { StatCardsComponent, StatCard } from '../../components/stat-cards/stat-cards.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { money, hoursLabel } from '../../shared';

/**
 * Teams page (Manage group): full-year stat cards + teams with their members and
 * SR&ED vs Unclaimed hours + CRUD (add / edit / remove teams, assign members).
 */
@Component({
  selector: 'app-teams-page',
  standalone: true,
  imports: [AsyncPipe, TeamGridComponent, StatCardsComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      @if (stats$ | async; as cards) {
        <app-stat-cards [cards]="cards"></app-stat-cards>
      }
      <app-team-grid></app-team-grid>
    </div>
  `,
})
export class TeamsPageComponent {
  private readonly data = inject(DashboardDataService);

  readonly stats$ = combineLatest([
    this.data.teams$,
    this.data.teamHoursBreakdownFull$,
    this.data.expenditureSummaryFull$,
  ]).pipe(
    map(([teams, breakdown, exp]): StatCard[] => {
      const sredHours = breakdown.reduce((sum, t) => sum + t.teamSredHours, 0);
      // Members on real teams (the null "Unassigned" group is excluded from the count).
      const members = breakdown
        .filter((t) => t.teamId !== null)
        .reduce((sum, t) => sum + t.members.length, 0);
      return [
        { label: 'Teams', value: `${teams.length}` },
        { label: 'Members', value: `${members}`, hint: 'assigned to a team' },
        { label: 'SR&ED hours', value: hoursLabel(sredHours), hint: 'full year' },
        { label: 'SR&ED cost', value: money(exp?.sredLabor ?? 0), hint: 'labor, full year' },
      ];
    }),
  );
}
