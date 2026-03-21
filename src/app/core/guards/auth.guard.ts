import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Wait for auth state to be resolved
  while (auth.isLoading()) {
    await new Promise(r => setTimeout(r, 50));
  }

  if (auth.isLoggedIn) return true;
  return router.createUrlTree(['/admin/login']);
};
