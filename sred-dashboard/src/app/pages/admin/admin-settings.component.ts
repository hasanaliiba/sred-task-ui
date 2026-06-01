import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';

import { DashboardDataService } from '../../services/dashboard-data.service';

/**
 * Admin client settings (Feature G): edit each client's SR&ED credit rate. The rate
 * feeds that client's credit calculation, so a change here is visible on the client's
 * dashboard. Rate is entered as a percentage and stored as a 0..1 fraction.
 */
@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [AsyncPipe, DatePipe],
  templateUrl: './admin-settings.component.html',
})
export class AdminSettingsComponent {
  private readonly data = inject(DashboardDataService);
  readonly clients$ = this.data.clients$;

  onRate(clientId: string, value: string): void {
    const pct = Number(value);
    this.data.setSredCreditRate(clientId, isNaN(pct) ? 0 : pct / 100);
  }
}
