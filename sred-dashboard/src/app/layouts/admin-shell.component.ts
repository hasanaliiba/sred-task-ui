import { Component, inject } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { AdminSidebarComponent } from '../components/sidebar/admin-sidebar.component';
import { UiPreferencesService } from '../services/ui-preferences.service';

/**
 * Admin shell (Phase 2): the admin counterpart of ClientShellComponent — fixed left
 * admin sidebar + slim sticky top bar + <router-outlet> for the admin pages (Feedback
 * / Client Settings). Owns the mobile off-canvas drawer state.
 */
@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [AsyncPipe, NgClass, RouterOutlet, AdminSidebarComponent],
  templateUrl: './admin-shell.component.html',
})
export class AdminShellComponent {
  /** Sidebar style preference (floating vs flush) — set from admin Settings. */
  readonly floating$ = inject(UiPreferencesService).floatingSidebar$;
  navOpen = false;

  openNav(): void {
    this.navOpen = true;
  }
  closeNav(): void {
    this.navOpen = false;
  }
}
