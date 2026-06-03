import { Component, EventEmitter, Output, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { initials } from '../../shared';

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
  /** Initials for the profile-chip avatar (template helper). */
  readonly initials = initials;

  // Heroicons (outline) path data per item — rendered as inline SVGs in the template.
  readonly links = [
    { path: '/admin/feedback', label: 'Feedback', icon: 'M8 10h.01M12 10h.01M16 10h.01M21 12a8 8 0 01-8 8H7l-4 3V12a8 8 0 018-8h2a8 8 0 018 8z' },
    { path: '/admin/settings', label: 'Client Settings', icon: 'M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75' },
  ];

  onNavigate(): void {
    this.navigate.emit();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
