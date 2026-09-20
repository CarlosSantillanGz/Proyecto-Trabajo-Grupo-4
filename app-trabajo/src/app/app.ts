import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartDrawerComponent } from './components/cart-drawer/cart-drawer.component';
import { Checkout } from './components/checkout/checkout';

@Component({
  imports: [RouterOutlet, CartDrawerComponent, Checkout],
  selector: 'app-root',
  styleUrl: './app.css',
  template: `
    <router-outlet></router-outlet>
    <app-cart-drawer></app-cart-drawer>
    <app-checkout></app-checkout>
  `,
})
export class App {}
