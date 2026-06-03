import { Component, inject } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { FeedbackModalComponent } from '../components/feedback/feedback-modal.component';
import { UiPreferencesService } from '../services/ui-preferences.service';

/**
 * Client shell (Phase 2): fixed left sidebar + <router-outlet> for the routed pages
 * (Analytics / Employees / Projects / Invoices). Owns the mobile off-canvas drawer state
 * and the feedback modal (opened from the sidebar). Client identity lives in the blue
 * <app-client-header> on each page; on desktop there is no top bar (the sidebar is always
 * visible), and on mobile a slim strip holds just the menu button.
 */
@Component({
  selector: 'app-client-shell',
  standalone: true,
  imports: [AsyncPipe, NgClass, RouterOutlet, SidebarComponent, FeedbackModalComponent],
  templateUrl: './client-shell.component.html',
})
export class ClientShellComponent {
  private readonly ui = inject(UiPreferencesService);
  /** Sidebar style preference (floating vs flush) — set from admin Settings. */
  readonly floating$ = this.ui.floatingSidebar$;
  /** Sidebar pinned-open vs collapsed icon rail — toggled from the sidebar. */
  readonly pinned$ = this.ui.sidebarPinned$;
  navOpen = false;
  feedbackOpen = false;

  openNav(): void {
    this.navOpen = true;
  }
  closeNav(): void {
    this.navOpen = false;
  }
}
