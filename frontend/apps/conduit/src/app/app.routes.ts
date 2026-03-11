import { Routes } from '@angular/router';
import { authGuard } from '@conduit/shared-util-auth';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('@conduit/articles-feature-feed').then(m => m.FeatureFeed)
  },
  {
    path: 'login',
    loadComponent: () => import('@conduit/auth-feature-login').then(m => m.FeatureLogin)
  },
  {
    path: 'register',
    loadComponent: () => import('@conduit/auth-feature-register').then(m => m.FeatureRegister)
  },
  {
    path: 'article/:slug',
    loadComponent: () => import('@conduit/articles-feature-article').then(m => m.FeatureArticle)
  },
  {
    path: 'editor',
    canActivate: [authGuard],
    loadComponent: () => import('@conduit/articles-feature-editor').then(m => m.FeatureEditor)
  },
  {
    path: 'editor/:slug',
    canActivate: [authGuard],
    loadComponent: () => import('@conduit/articles-feature-editor').then(m => m.FeatureEditor)
  },
  {
    path: 'profile/:username',
    loadComponent: () => import('@conduit/profile-feature-profile').then(m => m.ProfileFeatureProfile)
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('@conduit/profile-feature-settings').then(m => m.FeatureSettingsComponent)
  }
];
