import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'admin',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'admin/login',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'admin/**',
    renderMode: RenderMode.Server,
  },
  // Proyectos page fetches from Firebase — render on client
  {
    path: 'proyectos',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
