import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService, Pedido } from '../../services/cart.service';

@Component({
  selector: 'app-seguimiento-pedido',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule, RouterLink],
  templateUrl: './seguimiento-pedido.html',
  styleUrl: './seguimiento-pedido.css',
})
export class SeguimientoPedido {
  protected readonly cart = inject(CartService);

  protected numeroPedido = '';
  protected contacto = '';
  protected pedidoEncontrado: Pedido | null = null;
  protected buscado = false;
  protected errorBusqueda = '';

  protected readonly pasosSeguimiento = [
    { titulo: 'Recibimos tu pedido', icono: '📝' },
    { titulo: 'Pedido confirmado', icono: '⏳' },
    { titulo: '¡Tu pedido está listo!', icono: '🛍️' },
    { titulo: 'Pedido entregado', icono: '✅' },
  ];

  protected buscarPedido(): void {
    this.buscado = true;
    this.errorBusqueda = '';
    this.pedidoEncontrado = null;

    const idBuscado = this.numeroPedido.trim().toUpperCase();
    const contactoBuscado = this.contacto.trim().toLowerCase();

    if (!idBuscado || !contactoBuscado) {
      this.errorBusqueda = 'Ingresa el número de pedido y tu correo o teléfono.';
      return;
    }

    const pedido = this.cart.pedidos().find((p) => {
      const coincideId = p.id.toUpperCase() === idBuscado;
      const coincideContacto =
        p.cliente.email.toLowerCase() === contactoBuscado ||
        p.cliente.telefono.toLowerCase() === contactoBuscado;
      return coincideId && coincideContacto;
    });

    if (pedido) {
      this.pedidoEncontrado = pedido;
    } else {
      this.errorBusqueda =
        'No encontramos ningún pedido con esos datos. Verifica el número de pedido y el correo o teléfono usados en la compra.';
    }
  }

  protected nuevaBusqueda(): void {
    this.pedidoEncontrado = null;
    this.buscado = false;
    this.numeroPedido = '';
    this.contacto = '';
    this.errorBusqueda = '';
  }
}
