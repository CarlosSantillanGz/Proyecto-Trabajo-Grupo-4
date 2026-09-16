import { Component } from '@angular/core';
import { B2bForm } from './components/b2b-form/b2b-form';
import { Hero } from './components/hero/hero';
import { CatalogoProductos } from './components/catalogo-productos/catalogo-productos';

@Component({
  imports: [Hero, B2bForm, CatalogoProductos],
  selector: 'app-root',
  styleUrl: './app.css',
  template: `
    <main class="page-shell">
      <app-hero></app-hero>
      <section id="catalogo">
        <app-catalogo-productos></app-catalogo-productos>
      </section>
      <section id="contacto">
        <app-b2b-form></app-b2b-form>
      </section>
    </main>
  `,
})
export class App {}
