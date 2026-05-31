import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { AuthService } from '../../services/auth.service';

/**
 * Dashboard shell (Req 1–6 + features). For S5 this is a placeholder proving the
 * authenticated, client-scoped route works. S6+ add the navbar, header, period
 * selector, grids, and charts here.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <main class="min-h-screen p-8">
      <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8">
        <p class="text-sm text-gray-500">Signed in to</p>
        <h1 class="text-3xl font-bold text-ink mb-2">{{ (client$ | async)?.name }}</h1>
        <p class="text-gray-500 mb-6">
          Dashboard shell — content is added in the next sprints (navbar, header, period
          selector, grids, charts, projection).
        </p>
        <button
          type="button"
          (click)="logout()"
          class="text-white bg-brand-600 hover:bg-brand-700 rounded-lg text-sm px-5 py-2.5 transition-colors"
        >
          Log out
        </button>
      </div>
    </main>
  `,
})
export class DashboardComponent {
  private readonly data = inject(DashboardDataService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly client$ = this.data.client$;

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
