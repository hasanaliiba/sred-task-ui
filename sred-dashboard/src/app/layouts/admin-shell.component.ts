import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AdminSidebarComponent } from '../components/sidebar/admin-sidebar.component';

/**
 * Admin shell (Phase 2): the admin counterpart of ClientShellComponent — fixed left
 * admin sidebar + slim sticky top bar + <router-outlet> for the admin pages (Feedback
 * / Client Settings). Owns the mobile off-canvas drawer state.
 */
@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent],
  templateUrl: './admin-shell.component.html',
})
export class AdminShellComponent {
  navOpen = false;

  openNav(): void {
    this.navOpen = true;
  }
  closeNav(): void {
    this.navOpen = false;
  }
}
