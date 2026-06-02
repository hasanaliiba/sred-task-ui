import { Component } from '@angular/core';

import { ClientHeaderComponent } from '../../components/client-header/client-header.component';
import { DateRangePickerComponent } from '../../components/date-range-picker/date-range-picker.component';
import { MetricToggleComponent } from '../../components/metric-toggle/metric-toggle.component';
import { SummaryTilesComponent } from '../../components/summary-tiles/summary-tiles.component';
import { EmployeeHoursChartComponent } from '../../components/employee-hours-chart/employee-hours-chart.component';
import { EmployeeHourAndCostChartComponent } from '../../components/employee-hour-and-cost-chart/employee-hour-and-cost-chart.component';
import { TeamHoursChartComponent } from '../../components/team-hours-chart/team-hours-chart.component';
import { TeamHourAndCostChartComponent } from '../../components/team-hour-and-cost-chart/team-hour-and-cost-chart.component';
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
    DateRangePickerComponent,
    MetricToggleComponent,
    SummaryTilesComponent,
    EmployeeHoursChartComponent,
    EmployeeHourAndCostChartComponent,
    TeamHoursChartComponent,
    TeamHourAndCostChartComponent,
    ProjectChartComponent,
    ProjectsSummaryComponent,
    YearProjectionComponent,
    RevealDirective,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {}
