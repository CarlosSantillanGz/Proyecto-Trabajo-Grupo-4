import { computed, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface CartProduct {
  id: number;
  nombre: string;
  imagen: string;
  precio?: number;
  lineaNombre?: string;
  descripcion?: string;
}

export interface CartItem {
  producto: CartProduct;
  cantidad: number;
}

export interface DatosCliente {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
}

export interface Pedido {
  id: string;
  fecha: number;
  items: CartItem[];
  total: number;
  metodoPago: string;
  cliente: DatosCliente;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly pedidosStorageKey = 'fopesa_pedidos';

  private readonly cartItems = signal<CartItem[]>([]);
  private readonly pedidosState = signal<Pedido[]>(
    this.isBrowser ? this.cargarPedidos() : [],
  );

  readonly items = this.cartItems.asReadonly();
  readonly pedidos = this.pedidosState.asReadonly();

  readonly totalItems = computed(() =>
    this.cartItems().reduce((total, item) => total + item.cantidad, 0),
  );
  readonly totalPrice = computed(() =>
    this.cartItems().reduce(
      (total, item) => total + (item.producto.precio ?? 0) * item.cantidad,
      0,
    ),
  );
  readonly isOpen = signal(false);
  readonly checkoutOpen = signal(false);
  readonly orderConfirmed = signal(false);

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

  increase(productId: number): void {
    this.cartItems.update((items) =>
      items.map((item) =>
        item.producto.id === productId
          ? { ...item, cantidad: item.cantidad + 1 }
          : item,
      ),
    );
  }

  decrease(productId: number): void {
    this.cartItems.update((items) =>
      items
        .map((item) =>
          item.producto.id === productId
            ? { ...item, cantidad: item.cantidad - 1 }
            : item,
        )
        .filter((item) => item.cantidad > 0),
    );
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

  openCheckout(): void {
    this.isOpen.set(false);
    this.checkoutOpen.set(true);
  }

  closeCheckout(): void {
    this.checkoutOpen.set(false);
    this.orderConfirmed.set(false);
  }

  confirmOrder(cliente: DatosCliente, metodoPago: string): Pedido {
    const pedido: Pedido = {
      id: 'FOP-' + Date.now().toString().slice(-6),
      fecha: Date.now(),
      items: this.cartItems(),
      total: this.totalPrice(),
      metodoPago,
      cliente,
    };

    this.pedidosState.update((pedidos) => [pedido, ...pedidos]);
    this.guardarPedidos(this.pedidosState());

    this.orderConfirmed.set(true);
    this.clear();

    return pedido;
  }

  estadoPedido(pedido: Pedido): number {
    const minutos = (Date.now() - pedido.fecha) / 60000;
    if (minutos < 1) return 0;
    if (minutos < 3) return 1;
    if (minutos < 6) return 2;
    return 3;
  }

  scrollToContact(event: Event): void {
    event.preventDefault();
    this.close();
    document.getElementById('contacto')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  private cargarPedidos(): Pedido[] {
    try {
      const raw = localStorage.getItem(this.pedidosStorageKey);
      return raw ? (JSON.parse(raw) as Pedido[]) : [];
    } catch {
      return [];
    }
  }

  private guardarPedidos(pedidos: Pedido[]): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(this.pedidosStorageKey, JSON.stringify(pedidos));
    } catch {
      // Si el almacenamiento falla (modo incógnito, cuota llena, etc.), se ignora.
    }
  }
}
