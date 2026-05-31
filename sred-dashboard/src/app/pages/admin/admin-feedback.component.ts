import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

/** Admin feedback panel (Feature G). Placeholder for S5 — fully built in S22. */
@Component({
  selector: 'app-admin-feedback',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="min-h-screen p-8">
      <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 class="text-2xl font-bold text-ink mb-1">Admin · Feedback</h1>
        <p class="text-gray-500 mb-6">All-client feedback panel — built in S22.</p>
        <div class="flex gap-3">
          <a routerLink="/admin/settings" class="text-brand-600 hover:underline text-sm self-center">Client settings →</a>
          <button
            type="button"
            (click)="logout()"
            class="text-white bg-brand-600 hover:bg-brand-700 rounded-lg text-sm px-5 py-2.5 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </main>
  `,
})
export class AdminFeedbackComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
