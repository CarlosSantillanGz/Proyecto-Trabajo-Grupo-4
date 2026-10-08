import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CartService, Pedido } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'app-seguimiento-pedido',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule, RouterLink],
  templateUrl: './seguimiento-pedido.html',
  styleUrl: './seguimiento-pedido.css',
})
export class SeguimientoPedido {
  protected readonly cart = inject(CartService);
  private readonly ordersService = inject(OrdersService);

  protected numeroPedido = '';
  protected contacto = '';
  protected pedidoEncontrado: Pedido | null = null;
  protected buscado = false;
  protected errorBusqueda = '';
  protected buscando = false;

  protected readonly pasosSeguimiento = [
    { titulo: 'Recibimos tu pedido', icono: '📝' },
    { titulo: 'Pedido confirmado', icono: '⏳' },
    { titulo: '¡Tu pedido está listo!', icono: '🛍️' },
    { titulo: 'Pedido entregado', icono: '✅' },
  ];

  protected async buscarPedido(): Promise<void> {
    this.buscado = true;
    this.errorBusqueda = '';
    this.pedidoEncontrado = null;

    const idBuscado = this.numeroPedido.trim().toUpperCase();
    const contactoBuscado = this.contacto.trim().toLowerCase();

    if (!idBuscado || !contactoBuscado) {
      this.errorBusqueda = 'Ingresa el número de pedido y tu correo o teléfono.';
      return;
    }

    this.buscando = true;
    try {
      const order = await this.ordersService.consultar(idBuscado, contactoBuscado);
      const isPickup = order.modalidad.toLowerCase().includes('recojo');
      this.pedidoEncontrado = {
        id: order.idPedido,
        fecha: new Date(order.fecha).getTime(),
        estado: order.estado,
        items: order.items.map((item) => ({
          producto: {
            id: item.idProducto,
            nombre: item.nombre,
            imagen: item.imagen,
            precio: item.precio,
          },
          cantidad: item.cantidad,
        })),
        total: order.total,
        modalidadEntrega: {
          id: isPickup ? 'recojo' : 'domicilio',
          nombre: order.modalidad,
          detalle: '',
          tiempo: '',
          costo: order.costoEntrega,
        },
        cliente: order.cliente,
      };
    } catch (error) {
      const serverMessage = error instanceof HttpErrorResponse ? error.error?.mensaje : null;
      this.errorBusqueda =
        typeof serverMessage === 'string'
          ? serverMessage
          : 'No se pudo consultar el pedido. Verifica la conexión e inténtalo nuevamente.';
    } finally {
      this.buscando = false;
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
