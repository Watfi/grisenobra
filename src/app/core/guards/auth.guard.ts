import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const platformId = inject(PLATFORM_ID);
  const auth = inject(AuthService);
  const router = inject(Router);

  // Si estamos en el servidor, no validamos (lo hará el cliente)
  // Esto evita bucles infinitos en el SSR de Vercel
  if (isPlatformServer(platformId)) return true;

  // Wait for auth state to be resolved (Solo en el navegador)
  while (auth.isLoading()) {
    await new Promise(r => setTimeout(r, 50));
  }

  if (auth.isLoggedIn) return true;
  return router.createUrlTree(['/admin/login']);
};
