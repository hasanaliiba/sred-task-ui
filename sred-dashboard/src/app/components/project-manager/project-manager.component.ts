import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DecimalPipe } from '@angular/common';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { Project, ProjectSummary } from '../../models';
import { ProjectFormComponent } from '../project-form/project-form.component';

/**
 * Project list + CRUD (Feature F). Lists projects with their period hours/$ and
 * supports add / edit / remove. Removing a project cascades (its timesheet hours
 * and vendor invoices are removed) — surfaced in the delete confirmation.
 */
@Component({
  selector: 'app-project-manager',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DecimalPipe, ProjectFormComponent],
  templateUrl: './project-manager.component.html',
})
export class ProjectManagerComponent {
  private readonly data = inject(DashboardDataService);
  readonly projects$ = this.data.projectSummaries$;

  formOpen = false;
  editing: Project | null = null;
  pendingDelete: ProjectSummary | null = null;

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
