import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { Project, ProjectSummary } from '../../models';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { ProjectDetailComponent } from '../project-detail/project-detail.component';
import { PaginatorComponent } from '../paginator/paginator.component';

/**
 * Project list + CRUD (Feature F). Lists projects with their period hours/$,
 * supports add / edit / remove (cascade), and paginates the table client-side
 * (~10/page). Removing a project cascades to its timesheet hours and vendor invoices.
 */
@Component({
  selector: 'app-project-grid',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DecimalPipe, ProjectFormComponent, ProjectDetailComponent, PaginatorComponent],
  templateUrl: './project-grid.component.html',
})
export class ProjectGridComponent {
  private readonly data = inject(DashboardDataService);

  readonly pageSize = 10;
  private readonly page$ = new BehaviorSubject<number>(1);

  /** Paged view: clamps the page to the project count and slices the rows. */
  readonly vm$ = combineLatest([this.data.projectSummariesFull$, this.page$]).pipe(
    map(([rows, page]) => {
      const total = rows.length;
      const pages = Math.max(1, Math.ceil(total / this.pageSize));
      const current = Math.min(page, pages);
      const start = (current - 1) * this.pageSize;
      return { rows: rows.slice(start, start + this.pageSize), total, page: current, pageSize: this.pageSize };
    }),
  );

  setPage(page: number): void {
    this.page$.next(page);
  }

  formOpen = false;
  editing: Project | null = null;
  pendingDelete: ProjectSummary | null = null;
  detailSummary: ProjectSummary | null = null;

  openDetail(summary: ProjectSummary): void {
    this.detailSummary = summary;
  }

  closeDetail(): void {
    this.detailSummary = null;
  }

  openAdd(): void {
    this.editing = null;
    this.formOpen = true;
  }

  openEdit(summary: ProjectSummary): void {
    this.editing = this.toProject(summary);
    this.formOpen = true;
  }

  onSave(project: Project): void {
    if (this.editing) {
      this.data.updateProject(project);
    } else {
      this.data.addProject(project);
    }
    this.closeForm();
  }

  closeForm(): void {
    this.formOpen = false;
    this.editing = null;
  }

  askDelete(summary: ProjectSummary): void {
    this.pendingDelete = summary;
  }

  confirmDelete(): void {
    if (this.pendingDelete) {
      this.data.removeProject(this.pendingDelete.projectId);
    }
    this.pendingDelete = null;
  }

  cancelDelete(): void {
    this.pendingDelete = null;
  }

  private toProject(s: ProjectSummary): Project {
    return { id: s.projectId, name: s.name, color: s.color, isSred: s.isSred };
  }
}
