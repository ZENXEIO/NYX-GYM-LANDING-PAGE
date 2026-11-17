import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/legal/legal').then((m) => m.Legal),
    data: { kind: 'privacy' },
  },
  {
    path: 'terms',
    loadComponent: () => import('./pages/legal/legal').then((m) => m.Legal),
    data: { kind: 'terms' },
  },
  { path: '**', redirectTo: '' },
];
