import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

/** Admin client settings — configurable credit rate (Feature G). Placeholder for S5; built in S23. */
@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="min-h-screen p-8">
      <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 class="text-2xl font-bold text-ink mb-1">Admin · Client Settings</h1>
        <p class="text-gray-500 mb-6">Per-client SR&amp;ED credit rate configuration — built in S23.</p>
        <div class="flex gap-3">
          <a routerLink="/admin/feedback" class="text-brand-600 hover:underline text-sm self-center">← Feedback</a>
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
export class AdminSettingsComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
