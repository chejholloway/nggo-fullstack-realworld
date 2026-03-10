import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@conduit/auth-data-access';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router    = inject(Router);
  return authStore.isLoggedIn()
    ? true
    : router.createUrlTree(['/login']);
};