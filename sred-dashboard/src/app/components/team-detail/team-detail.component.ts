import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Observable, of } from 'rxjs';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { TeamDetail } from '../../models';

/**
 * Read-only per-team detail modal (full year). Shows the team's SR&ED-vs-Unclaimed
 * allocation plus hours, cost (expenses) and SR&ED credit. No per-member breakdown.
 */
@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DecimalPipe, PercentPipe],
  templateUrl: './team-detail.component.html',
})
export class TeamDetailComponent implements OnInit {
  @Input() teamId: string | null = null;
  @Output() close = new EventEmitter<void>();

  private readonly data = inject(DashboardDataService);
  detail$: Observable<TeamDetail | null> = of(null);

  ngOnInit(): void {
    this.detail$ = this.data.teamDetailFull$(this.teamId);
  }

  widthPct(part: number, total: number): number {
    return total > 0 ? (part / total) * 100 : 0;
  }

  onClose(): void {
    this.close.emit();
  }
}
