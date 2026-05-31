import { Component } from '@angular/core';

import { AdminNavbarComponent } from '../../components/navbar/admin-navbar.component';

/** Admin feedback panel (Feature G). Placeholder body — fully built in S22. */
@Component({
  selector: 'app-admin-feedback',
  standalone: true,
  imports: [AdminNavbarComponent],
  template: `
    <app-admin-navbar></app-admin-navbar>
    <main class="max-w-7xl mx-auto px-4 py-8">
      <div class="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-8">
        <h1 class="text-2xl font-bold text-ink mb-1">Feedback</h1>
        <p class="text-gray-500">All-client feedback panel — built in S22.</p>
      </div>
    </main>
  `,
})
export class AdminFeedbackComponent {}
