import { Component } from '@angular/core';

import { EmployeeGridComponent } from '../employee-grid/employee-grid.component';
import { InvoiceGridComponent } from '../invoice-grid/invoice-grid.component';
import { TeamGridComponent } from '../team-grid/team-grid.component';
import { ProjectGridComponent } from '../project-grid/project-grid.component';

type GridTab = 'employees' | 'invoices' | 'teams' | 'projects';

/**
 * Records section for the Overview page: one tabbed panel that switches between the
 * Employees / Invoices / Teams / Projects grids (Employees shown by default). The grids
 * are the same components used on the Manage pages — search + inline edit/delete work
 * here too; full creation flows still live on the dedicated Manage pages.
 */
@Component({
  selector: 'app-overview-grids',
  standalone: true,
  imports: [EmployeeGridComponent, InvoiceGridComponent, TeamGridComponent, ProjectGridComponent],
  templateUrl: './overview-grids.component.html',
})
export class OverviewGridsComponent {
  readonly tabs: { key: GridTab; label: string }[] = [
    { key: 'employees', label: 'Employees' },
    { key: 'invoices', label: 'Invoices' },
    { key: 'teams', label: 'Teams' },
    { key: 'projects', label: 'Projects' },
  ];
  active: GridTab = 'employees';

  select(tab: GridTab): void {
    this.active = tab;
  }
}
