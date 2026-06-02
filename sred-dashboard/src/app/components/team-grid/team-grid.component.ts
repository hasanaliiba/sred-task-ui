import { Component, inject } from '@angular/core';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { Employee, HoursSplit, Team, TeamHoursBreakdown } from '../../models';
import { TeamFormComponent } from '../team-form/team-form.component';
import { PaginatorComponent } from '../paginator/paginator.component';

/**
 * Team list + CRUD. Lists teams with members and SR&ED/Unclaimed hours (full fiscal
 * year), supports add / edit / remove, and assigns members via the form. Membership is
 * `employee.teamId`; removing a team unassigns its members (they are not deleted).
 * The "Unassigned" group is shown for visibility but has no edit/remove actions.
 */
@Component({
  selector: 'app-team-grid',
  standalone: true,
  imports: [AsyncPipe, DecimalPipe, TeamFormComponent, PaginatorComponent],
  templateUrl: './team-grid.component.html',
})
export class TeamGridComponent {
  private readonly data = inject(DashboardDataService);

  readonly pageSize = 10;
  private readonly page$ = new BehaviorSubject<number>(1);

  /** Team rows (full year) + the employee list for the member picker + paging. */
  readonly vm$ = combineLatest([this.data.teamHoursBreakdownFull$, this.data.employees$, this.page$]).pipe(
    map(([teams, employeeRows, page]) => {
      const total = teams.length;
      const pages = Math.max(1, Math.ceil(total / this.pageSize));
      const current = Math.min(page, pages);
      const start = (current - 1) * this.pageSize;
      return {
        rows: teams.slice(start, start + this.pageSize),
        total,
        page: current,
        pageSize: this.pageSize,
        employees: employeeRows.map((r) => r.employee),
      };
    }),
  );

  setPage(page: number): void {
    this.page$.next(page);
  }

  /** Joined member names for display. */
  names(members: HoursSplit[]): string {
    return members.map((m) => m.name).join(', ');
  }

  formOpen = false;
  editing: Team | null = null;
  editingMemberIds: string[] = [];
  allEmployees: Employee[] = [];
  pendingDelete: TeamHoursBreakdown | null = null;

  openAdd(employees: Employee[]): void {
    this.editing = null;
    this.editingMemberIds = [];
    this.allEmployees = employees;
    this.formOpen = true;
  }

  openEdit(team: TeamHoursBreakdown, employees: Employee[]): void {
    this.editing = { id: team.teamId as string, name: team.teamName, color: team.color };
    this.editingMemberIds = employees.filter((e) => e.teamId === team.teamId).map((e) => e.id);
    this.allEmployees = employees;
    this.formOpen = true;
  }

  onSave(payload: { team: Team; memberIds: string[] }): void {
    if (this.editing) {
      this.data.updateTeam(payload.team);
    } else {
      this.data.addTeam(payload.team);
    }
    this.data.assignTeamMembers(payload.team.id, payload.memberIds);
    this.closeForm();
  }

  closeForm(): void {
    this.formOpen = false;
    this.editing = null;
    this.editingMemberIds = [];
  }

  askDelete(team: TeamHoursBreakdown): void {
    this.pendingDelete = team;
  }

  confirmDelete(): void {
    if (this.pendingDelete?.teamId) {
      this.data.removeTeam(this.pendingDelete.teamId);
    }
    this.pendingDelete = null;
  }

  cancelDelete(): void {
    this.pendingDelete = null;
  }
}
