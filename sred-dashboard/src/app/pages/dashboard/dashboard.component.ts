import { Component } from '@angular/core';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ClientHeaderComponent } from '../../components/client-header/client-header.component';
import { PeriodSelectorComponent } from '../../components/period-selector/period-selector.component';
import { RevealDirective } from '../../shared';

/**
 * Dashboard shell (Req 1–6). Sections are added by their sprints; remaining ones
 * show a labeled placeholder so the navbar anchors have targets.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, ClientHeaderComponent, PeriodSelectorComponent, RevealDirective],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  /** Sections not yet built — rendered as labeled placeholders. */
  readonly pending = [
    { id: 'employees', title: 'Employees', note: 'Salary grid (S9), CRUD (S10), detail (S11), hours chart (S12)' },
    { id: 'teams', title: 'Teams', note: 'Teams table (S13) + team hours chart (S14)' },
    { id: 'projects', title: 'Projects', note: 'Per-project chart (S15), CRUD (S16), all-projects summary (S17)' },
    { id: 'expenses', title: 'Other Expenses', note: 'Vendor invoices (S18) + government assistance & credit (S19)' },
    { id: 'projection', title: 'Year Projection', note: 'YTD vs projected full-year + credit (S20)' },
  ];
}
