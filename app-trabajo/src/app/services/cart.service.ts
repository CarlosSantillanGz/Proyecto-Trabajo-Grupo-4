import { computed, Injectable, signal } from '@angular/core';

export interface CartProduct {
  id: number;
  nombre: string;
  imagen: string;
  lineaNombre?: string;
  descripcion?: string;
}

export interface CartItem {
  producto: CartProduct;
  cantidad: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly cartItems = signal<CartItem[]>([]);

  readonly items = this.cartItems.asReadonly();
  readonly totalItems = computed(() =>
    this.cartItems().reduce((total, item) => total + item.cantidad, 0),
  );
  readonly isOpen = signal(false);

  add(producto: CartProduct): void {
    this.cartItems.update((items) => {
      const existingItem = items.find((item) => item.producto.id === producto.id);

      if (existingItem) {
        return items.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        );
      }

      return [...items, { producto, cantidad: 1 }];
    });

    this.isOpen.set(true);
  }

  remove(productId: number): void {
    this.cartItems.update((items) =>
      items.filter((item) => item.producto.id !== productId),
    );
  }

  clear(): void {
    this.cartItems.set([]);
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  scrollToContact(event: Event): void {
    event.preventDefault();
    this.close();
    document.getElementById('contacto')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}
