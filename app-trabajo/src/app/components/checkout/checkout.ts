import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService, Pedido } from '../../services/cart.service';

type PasoCheckout = 'datos' | 'pago' | 'confirmado';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [DecimalPipe, DatePipe, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  protected readonly cart = inject(CartService);

  protected paso: PasoCheckout = 'datos';
  protected pedidoActual: Pedido | null = null;

  protected datos = {
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
  };

  protected metodosPago = [
    { id: 'yape', nombre: 'Yape', icono: '📱' },
    { id: 'tarjeta', nombre: 'Tarjeta de crédito/débito', icono: '💳' },
    { id: 'pagoefectivo', nombre: 'PagoEfectivo / QR', icono: '🔳' },
  ];

  protected readonly pasosSeguimiento = [
    { titulo: 'Recibimos tu pedido', icono: '📝' },
    { titulo: 'Pedido confirmado', icono: '⏳' },
    { titulo: '¡Tu pedido está listo!', icono: '🛍️' },
    { titulo: 'Pedido entregado', icono: '✅' },
  ];

  protected metodoPago: string | null = null;
  protected codigoPago = '';

  protected tarjeta = {
    numero: '',
    titular: '',
    vencimiento: '',
    cvv: '',
  };

  protected continuarAPago(): void {
    this.paso = 'pago';
  }

  protected volverADatos(): void {
    this.paso = 'datos';
  }

  protected seleccionarMetodo(id: string): void {
    this.metodoPago = id;
    if (id === 'yape' || id === 'pagoefectivo') {
      this.codigoPago = this.generarCodigo();
    }
  }

  protected formatearNumeroTarjeta(): void {
    const limpio = this.tarjeta.numero.replace(/\D/g, '').slice(0, 16);
    this.tarjeta.numero = limpio.replace(/(.{4})/g, '$1 ').trim();
  }

  protected formatearVencimiento(): void {
    const limpio = this.tarjeta.vencimiento.replace(/\D/g, '').slice(0, 4);
    this.tarjeta.vencimiento =
      limpio.length > 2 ? `${limpio.slice(0, 2)}/${limpio.slice(2)}` : limpio;
  }

  protected get metodoPagoValido(): boolean {
    if (this.metodoPago === 'tarjeta') {
      return (
        this.tarjeta.numero.replace(/\s/g, '').length === 16 &&
        this.tarjeta.titular.trim().length > 3 &&
        /^\d{2}\/\d{2}$/.test(this.tarjeta.vencimiento) &&
        this.tarjeta.cvv.length === 3
      );
    }
    return this.metodoPago === 'yape' || this.metodoPago === 'pagoefectivo';
  }

  protected confirmarPedido(): void {
    if (!this.metodoPago || !this.metodoPagoValido) {
      return;
    }

    this.pedidoActual = this.cart.confirmOrder(this.datos, this.nombreMetodoPago());
    this.paso = 'confirmado';
  }

  protected nombreMetodoPago(): string {
    return this.metodosPago.find((m) => m.id === this.metodoPago)?.nombre ?? '';
  }

  protected cerrar(): void {
    this.cart.closeCheckout();
    this.paso = 'datos';
    this.metodoPago = null;
    this.codigoPago = '';
    this.pedidoActual = null;
    this.tarjeta = { numero: '', titular: '', vencimiento: '', cvv: '' };
    this.datos = { nombre: '', email: '', telefono: '', direccion: '' };
  }

  private generarCodigo(): string {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
  }
}
