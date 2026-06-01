import { Component } from '@angular/core';

import { ClientHeaderComponent } from '../../components/client-header/client-header.component';
import { PeriodSelectorComponent } from '../../components/period-selector/period-selector.component';
import { EmployeeHoursChartComponent } from '../../components/employee-hours-chart/employee-hours-chart.component';
import { EmployeeHourAndCostChartComponent } from '../../components/employee-hour-and-cost-chart/employee-hour-and-cost-chart.component';
import { TeamsTableComponent } from '../../components/teams-table/teams-table.component';
import { TeamHoursChartComponent } from '../../components/team-hours-chart/team-hours-chart.component';
import { ProjectChartComponent } from '../../components/project-chart/project-chart.component';
import { ProjectsSummaryComponent } from '../../components/projects-summary/projects-summary.component';
import { YearProjectionComponent } from '../../components/year-projection/year-projection.component';
import { RevealDirective } from '../../shared';

/**
 * Analytics page (Phase 2) — read-only visualizations only, in a mixed grid.
 * The CRUD tables live on the Manage pages (/employees, /projects, /invoices).
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    ClientHeaderComponent,
    PeriodSelectorComponent,
    EmployeeHoursChartComponent,
    EmployeeHourAndCostChartComponent,
    TeamsTableComponent,
    TeamHoursChartComponent,
    ProjectChartComponent,
    ProjectsSummaryComponent,
    YearProjectionComponent,
    RevealDirective,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {}
