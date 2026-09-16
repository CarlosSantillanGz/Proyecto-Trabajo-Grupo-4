import { Component } from '@angular/core';
import { B2bForm } from './components/b2b-form/b2b-form';
import { CatalogoProductos } from './components/catalogo-productos/catalogo-productos';
import { CartDrawerComponent } from './components/cart-drawer/cart-drawer.component';
import { Hero } from './components/hero/hero';

@Component({
  imports: [Hero, CatalogoProductos, B2bForm, CartDrawerComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  template: `
    <app-hero></app-hero>
    <section id="catalogo">
      <app-catalogo-productos></app-catalogo-productos>
    </section>
    <section id="contacto">
      <app-b2b-form></app-b2b-form>
    </section>
    <app-cart-drawer></app-cart-drawer>
  `,
})
export class App {}
