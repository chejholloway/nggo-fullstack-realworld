import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  { path: '', loadComponent: () => import('@conduit/articles-feature-feed').then(m => m.FeatureFeed) },
  { path: 'login', loadComponent: () => import('@conduit/auth-feature-login').then(m => m.FeatureLogin) },
  { path: 'register', loadComponent: () => import('@conduit/auth-feature-register').then(m => m.FeatureRegister) },
  { path: 'article/:slug', loadComponent: () => import('@conduit/articles-feature-article').then(m => m.FeatureArticle) },
  { path: 'editor', loadComponent: () => import('@conduit/articles-feature-editor').then(m => m.FeatureEditor) },
  { path: 'profile/:username', loadComponent: () => import('@conduit/profile-feature-profile').then(m => m.ProfileFeatureProfile) }
];