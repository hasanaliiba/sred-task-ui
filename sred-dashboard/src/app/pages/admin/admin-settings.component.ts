import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { UiPreferencesService } from '../../services/ui-preferences.service';

/**
 * Admin client settings (Feature G): edit each client's SR&ED credit rate, and an
 * Appearance toggle for the sidebar style (floating vs flush). The rate feeds that
 * client's credit calculation; the sidebar toggle is an app-wide UI preference.
 */
@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [AsyncPipe, DatePipe],
  templateUrl: './admin-settings.component.html',
})
export class AdminSettingsComponent {
  private readonly data = inject(DashboardDataService);
  private readonly ui = inject(UiPreferencesService);

  readonly clients$ = this.data.clients$;
  readonly floatingSidebar$ = this.ui.floatingSidebar$;

  onRate(clientId: string, value: string): void {
    const pct = Number(value);
    this.data.setSredCreditRate(clientId, isNaN(pct) ? 0 : pct / 100);
  }

  setFloatingSidebar(on: boolean): void {
    this.ui.setFloatingSidebar(on);
  }
}
