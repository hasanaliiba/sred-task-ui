import { Component } from '@angular/core';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ClientHeaderComponent } from '../../components/client-header/client-header.component';
import { PeriodSelectorComponent } from '../../components/period-selector/period-selector.component';
import { EmployeeGridComponent } from '../../components/employee-grid/employee-grid.component';
import { EmployeeHoursChartComponent } from '../../components/employee-hours-chart/employee-hours-chart.component';
import { TeamsTableComponent } from '../../components/teams-table/teams-table.component';
import { TeamHoursChartComponent } from '../../components/team-hours-chart/team-hours-chart.component';
import { ProjectChartComponent } from '../../components/project-chart/project-chart.component';
import { ProjectManagerComponent } from '../../components/project-manager/project-manager.component';
import { ProjectsSummaryComponent } from '../../components/projects-summary/projects-summary.component';
import { VendorInvoicesComponent } from '../../components/vendor-invoices/vendor-invoices.component';
import { RevealDirective } from '../../shared';

/**
 * Dashboard shell (Req 1–6). Sections are added by their sprints; remaining ones
 * show a labeled placeholder so the navbar anchors have targets.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NavbarComponent,
    ClientHeaderComponent,
    PeriodSelectorComponent,
    EmployeeGridComponent,
    EmployeeHoursChartComponent,
    TeamsTableComponent,
    TeamHoursChartComponent,
    ProjectChartComponent,
    ProjectManagerComponent,
    ProjectsSummaryComponent,
    VendorInvoicesComponent,
    RevealDirective,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  /** Sections not yet built — rendered as labeled placeholders. */
  readonly pending = [
    { id: 'projection', title: 'Year Projection', note: 'YTD vs projected full-year + credit (S20)' },
  ];
}
