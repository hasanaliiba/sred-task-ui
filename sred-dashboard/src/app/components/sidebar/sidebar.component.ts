import { Component, EventEmitter, Output, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { AuthService } from '../../services/auth.service';

/**
 * Client sidebar (Phase 2): brand, an "Analytics" home link and a nested "Manage"
 * group (Employees / Projects / Invoices) using routerLink + routerLinkActive, with
 * Feedback (opens the modal) above Log out. Emits `navigate` so the shell can close
 * the mobile drawer on navigation, and `feedback` to open the feedback modal.
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [AsyncPipe, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private readonly data = inject(DashboardDataService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  @Output() navigate = new EventEmitter<void>();
  @Output() feedback = new EventEmitter<void>();

  readonly client$ = this.data.client$;
  readonly currentUser$ = this.auth.currentUser$;

  readonly manage = [
    { path: '/employees', label: 'Employees' },
    { path: '/projects', label: 'Projects' },
    { path: '/invoices', label: 'Invoices' },
  ];

  onNavigate(): void {
    this.navigate.emit();
  }

  openFeedback(): void {
    this.feedback.emit();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
