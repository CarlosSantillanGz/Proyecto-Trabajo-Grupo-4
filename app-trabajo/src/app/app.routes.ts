import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'mis-pedidos',
    loadComponent: () =>
      import('./pages/seguimiento-pedido/seguimiento-pedido').then(
        (m) => m.SeguimientoPedido,
      ),
  },
];
