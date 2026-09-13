import { Component } from '@angular/core';
import { CatalogoProductos } from './components/catalogo-productos/catalogo-productos';

@Component({
  imports: [CatalogoProductos],
  selector: 'app-root',
  styleUrl: './app.css',
  template: '<app-catalogo-productos />',
})
export class App {}
