import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';

import { DashboardDataService } from '../../services/dashboard-data.service';

/**
 * Client information header (Req 1). Shows the client name, fiscal-year range,
 * the "data as of" date that drives the projection, time zone, and contact.
 */
@Component({
  selector: 'app-client-header',
  standalone: true,
  imports: [AsyncPipe, DatePipe],
  templateUrl: './client-header.component.html',
})
export class ClientHeaderComponent {
  private readonly data = inject(DashboardDataService);
  readonly client$ = this.data.client$;
}
