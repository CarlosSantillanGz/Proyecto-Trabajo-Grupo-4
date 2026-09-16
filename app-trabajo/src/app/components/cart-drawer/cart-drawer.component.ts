import { Component, inject } from '@angular/core';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.css',
})
export class CartDrawerComponent {
  protected readonly cart = inject(CartService);
}
