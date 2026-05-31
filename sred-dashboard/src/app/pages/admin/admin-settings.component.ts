import { Component } from '@angular/core';

import { AdminNavbarComponent } from '../../components/navbar/admin-navbar.component';

/** Admin client settings — configurable credit rate (Feature G). Placeholder body; built in S23. */
@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [AdminNavbarComponent],
  template: `
    <app-admin-navbar></app-admin-navbar>
    <main class="max-w-7xl mx-auto px-4 py-8">
      <div class="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-8">
        <h1 class="text-2xl font-bold text-ink mb-1">Client Settings</h1>
        <p class="text-gray-500">Per-client SR&amp;ED credit rate configuration — built in S23.</p>
      </div>
    </main>
  `,
})
export class AdminSettingsComponent {}
