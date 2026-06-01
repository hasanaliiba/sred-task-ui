import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { FeedbackModalComponent } from '../components/feedback/feedback-modal.component';

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
  imports: [RouterOutlet, SidebarComponent, FeedbackModalComponent],
  templateUrl: './client-shell.component.html',
})
export class ClientShellComponent {
  navOpen = false;
  feedbackOpen = false;

  openNav(): void {
    this.navOpen = true;
  }
  closeNav(): void {
    this.navOpen = false;
  }
}
