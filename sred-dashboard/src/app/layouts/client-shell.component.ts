import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { FeedbackModalComponent } from '../components/feedback/feedback-modal.component';
import { DashboardDataService } from '../services/dashboard-data.service';

/**
 * Client shell (Phase 2): fixed left sidebar + slim sticky top bar + <router-outlet>
 * for the routed pages (Analytics / Employees / Projects / Invoices). Owns the mobile
 * off-canvas drawer state and the feedback modal (opened from the sidebar).
 */
@Component({
  selector: 'app-client-shell',
  standalone: true,
  imports: [AsyncPipe, RouterOutlet, SidebarComponent, FeedbackModalComponent],
  templateUrl: './client-shell.component.html',
})
export class ClientShellComponent {
  private readonly data = inject(DashboardDataService);
  readonly client$ = this.data.client$;

  navOpen = false;
  feedbackOpen = false;

  openNav(): void {
    this.navOpen = true;
  }
  closeNav(): void {
    this.navOpen = false;
  }
}
