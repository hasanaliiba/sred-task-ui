import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/** Allows the route only for an authenticated user; otherwise redirects to /login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated ? true : router.createUrlTree(['/login']);
};

/**
 * Allows the route only for an authenticated admin.
 * Unauthenticated → /login; authenticated non-admin → /dashboard.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated) {
    return router.createUrlTree(['/login']);
  }
  return auth.isAdmin ? true : router.createUrlTree(['/dashboard']);
};
