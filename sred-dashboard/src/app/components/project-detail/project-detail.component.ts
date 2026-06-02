import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { ProjectContributor, ProjectSummary } from '../../models';
import { projectMetricValue } from '../../core/derivations';

/**
 * Read-only per-project detail modal (full year). Shows the project's hours and a
 * cost breakdown (labor / vendor / total) plus its SR&ED credit. Credit is derived
 * from the active client's rate via the shared projectMetricValue helper.
 */
@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DecimalPipe],
  templateUrl: './project-detail.component.html',
})
export class ProjectDetailComponent implements OnInit {
  @Input({ required: true }) summary!: ProjectSummary;
  @Output() close = new EventEmitter<void>();

  private readonly data = inject(DashboardDataService);

  /** SR&ED credit for this project, using the active client's credit rate. */
  credit$: Observable<number> = of(0);
  /** Employees (+ team) who logged hours on this project. */
  contributors$: Observable<ProjectContributor[]> = of([]);

  ngOnInit(): void {
    this.credit$ = this.data.client$.pipe(
      map((c) => projectMetricValue(this.summary, 'credit', c?.sredCreditRate ?? 0)),
    );
    this.contributors$ = this.data.projectContributorsFull$(this.summary.projectId);
  }

  onClose(): void {
    this.close.emit();
  }
}
