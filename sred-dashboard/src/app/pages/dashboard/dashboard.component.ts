import { Component } from '@angular/core';

import { ClientHeaderComponent } from '../../components/client-header/client-header.component';
import { PeriodSelectorComponent } from '../../components/period-selector/period-selector.component';
import { EmployeeGridComponent } from '../../components/employee-grid/employee-grid.component';
import { EmployeeHoursChartComponent } from '../../components/employee-hours-chart/employee-hours-chart.component';
import { EmployeeHourAndCostChartComponent } from '../../components/employee-hour-and-cost-chart/employee-hour-and-cost-chart.component';
import { TeamsTableComponent } from '../../components/teams-table/teams-table.component';
import { TeamHoursChartComponent } from '../../components/team-hours-chart/team-hours-chart.component';
import { ProjectChartComponent } from '../../components/project-chart/project-chart.component';
import { ProjectManagerComponent } from '../../components/project-manager/project-manager.component';
import { ProjectsSummaryComponent } from '../../components/projects-summary/projects-summary.component';
import { VendorInvoicesComponent } from '../../components/vendor-invoices/vendor-invoices.component';
import { ExpenditureSummaryComponent } from '../../components/expenditure-summary/expenditure-summary.component';
import { YearProjectionComponent } from '../../components/year-projection/year-projection.component';
import { RevealDirective } from '../../shared';

/**
 * Analytics page (Phase 2). Rendered inside the client shell's <router-outlet>.
 * P2.2 trims this to charts/KPIs only (CRUD moves to the Manage pages in P2.3).
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    ClientHeaderComponent,
    PeriodSelectorComponent,
    EmployeeGridComponent,
    EmployeeHoursChartComponent,
    EmployeeHourAndCostChartComponent,
    TeamsTableComponent,
    TeamHoursChartComponent,
    ProjectChartComponent,
    ProjectManagerComponent,
    ProjectsSummaryComponent,
    VendorInvoicesComponent,
    ExpenditureSummaryComponent,
    YearProjectionComponent,
    RevealDirective,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {}
