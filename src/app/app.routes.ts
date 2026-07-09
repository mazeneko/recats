import { Routes } from '@angular/router';
import { NotFoundPageUi } from './controller/gui/not-found-page.ui';

export const routes: Routes = [
  { path: '', redirectTo: '/skills', pathMatch: 'full' },
  {
    path: 'skills',
    loadComponent: () => import('./controller/gui/skill/skill-page.ui').then((m) => m.SkillPageUi),
  },
  { path: '**', component: NotFoundPageUi },
];
