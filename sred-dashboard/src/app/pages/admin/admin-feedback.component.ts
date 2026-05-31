import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { AdminNavbarComponent } from '../../components/navbar/admin-navbar.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { Feedback } from '../../models';

type SortKey = 'newest' | 'oldest' | 'highest' | 'lowest';

/** Admin feedback panel (Feature G): all client feedback with filter + sort. */
@Component({
  selector: 'app-admin-feedback',
  standalone: true,
  imports: [AsyncPipe, DatePipe, DecimalPipe, AdminNavbarComponent],
  templateUrl: './admin-feedback.component.html',
})
export class AdminFeedbackComponent {
  private readonly data = inject(DashboardDataService);

  private readonly filterClient$$ = new BehaviorSubject<string>('all');
  private readonly sort$$ = new BehaviorSubject<SortKey>('newest');

  readonly stars = [1, 2, 3, 4, 5];

  readonly vm$ = combineLatest([this.data.feedback$, this.filterClient$$, this.sort$$]).pipe(
    map(([feedback, filterClient, sort]) => {
      const clients = this.distinctClients(feedback);
      const filtered = filterClient === 'all' ? feedback : feedback.filter((f) => f.clientId === filterClient);
      const rows = this.sortFeedback(filtered, sort);
      const avg = rows.length ? rows.reduce((s, f) => s + f.rating, 0) / rows.length : 0;
      return { rows, clients, count: rows.length, avg, filterClient, sort };
    }),
  );

  setFilter(clientId: string): void {
    this.filterClient$$.next(clientId);
  }

  setSort(sort: string): void {
    this.sort$$.next(sort as SortKey);
  }

  private distinctClients(feedback: Feedback[]): { id: string; name: string }[] {
    const byId = new Map(feedback.map((f) => [f.clientId, f.clientName]));
    return [...byId].map(([id, name]) => ({ id, name }));
  }

  private sortFeedback(feedback: Feedback[], sort: SortKey): Feedback[] {
    const copy = [...feedback];
    switch (sort) {
      case 'oldest':
        return copy.sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
      case 'highest':
        return copy.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return copy.sort((a, b) => a.rating - b.rating);
      case 'newest':
      default:
        return copy.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    }
  }
}
