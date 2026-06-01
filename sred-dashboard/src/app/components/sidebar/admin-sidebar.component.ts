import { Component, EventEmitter, Output, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../services/auth.service';

/**
 * Admin sidebar (Phase 2) — the admin counterpart of the client SidebarComponent.
 * Same dark styling and layout, but navigates the admin routes (Feedback / Client
 * Settings) via routerLink + routerLinkActive, with the signed-in admin and Log out
 * at the bottom. Emits `navigate` so the shell can close the mobile drawer.
 */
@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [AsyncPipe, RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.component.html',
})
export class AdminSidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  @Output() navigate = new EventEmitter<void>();

  readonly currentUser$ = this.auth.currentUser$;

  readonly links = [
    { path: '/admin/feedback', label: 'Feedback' },
    { path: '/admin/settings', label: 'Client Settings' },
  ];

  onNavigate(): void {
    this.navigate.emit();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
