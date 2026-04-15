import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'proyectos',
    loadComponent: () =>
      import('./pages/projects-page/projects-page.component').then(m => m.ProjectsPageComponent),
  },
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./pages/admin/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin-shell/admin-shell.component').then(m => m.AdminShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'projects',
        pathMatch: 'full',
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./pages/admin/projects-crud/projects-crud.component').then(m => m.ProjectsCrudComponent),
      },
      {
        path: 'content',
        loadComponent: () =>
          import('./pages/admin/content-editor/content-editor.component').then(m => m.ContentEditorComponent),
      },
      {
        path: 'contacts',
        loadComponent: () =>
          import('./pages/admin/contacts/contacts.component').then(m => m.ContactsComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
