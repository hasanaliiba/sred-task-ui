import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { RevealDirective } from '../../shared';

/**
 * Dashboard shell (Req 1–6). S6 adds the navbar and the section scaffold the nav
 * anchors scroll to; later sprints fill each section (header, grids, charts, etc.).
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AsyncPipe, NavbarComponent, RevealDirective],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly data = inject(DashboardDataService);

  readonly client$ = this.data.client$;

  /** Section scaffold — each is filled by its sprint. */
  readonly sections = [
    { id: 'overview', title: 'Overview', note: 'Client header — S7' },
    { id: 'employees', title: 'Employees', note: 'Salary grid (S9), CRUD (S10), detail (S11), hours chart (S12)' },
    { id: 'teams', title: 'Teams', note: 'Teams table (S13) + team hours chart (S14)' },
    { id: 'projects', title: 'Projects', note: 'Per-project chart (S15), CRUD (S16), all-projects summary (S17)' },
    { id: 'expenses', title: 'Other Expenses', note: 'Vendor invoices (S18) + government assistance & credit (S19)' },
    { id: 'projection', title: 'Year Projection', note: 'YTD vs projected full-year + credit (S20)' },
  ];
}
