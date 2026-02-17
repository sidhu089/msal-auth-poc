import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';

export const routes: Routes = [
  {
    path: 'form',
    loadComponent: () => import('./form/form.component').then(m => m.FormComponent),
    canActivate: [MsalGuard] // Protect the form route with MSAL guard
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [MsalGuard] // Protect the profile route with MSAL guard
  },
  {
    path: '',
    redirectTo: '/profile',
    pathMatch: 'full'
  }
];
