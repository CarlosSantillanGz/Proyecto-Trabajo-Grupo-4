import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService, ModalidadEntrega, Pedido } from '../../services/cart.service';
import { CustomerService } from '../../services/customer.service';

type PasoCheckout = 'datos' | 'entrega' | 'pago' | 'confirmado';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [DecimalPipe, DatePipe, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  protected readonly cart = inject(CartService);
  private readonly customerService = inject(CustomerService);
  protected readonly registrandoCliente = signal(false);
  protected readonly errorRegistroCliente = signal('');
  protected readonly errorCamposCliente =
    'Completa nombres, apellidos, un correo válido y un teléfono de 6 a 20 caracteres.';

  protected paso: PasoCheckout = 'datos';
  protected pedidoActual: Pedido | null = null;

  protected datos = {
    nombre: '',
    apellido: '',
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

  protected modalidadesEntrega: ModalidadEntrega[] = [
    {
      id: 'domicilio',
      nombre: 'Entrega a domicilio',
      detalle: 'Recibe tu pedido en la dirección registrada.',
      tiempo: 'Entre 2 y 5 días hábiles',
      costo: 0,
    },
    {
      id: 'recojo',
      nombre: 'Recojo en punto Fopesa',
      detalle: 'Recoge tu pedido en el punto de atención coordinado.',
      tiempo: 'Te avisaremos cuando esté listo',
      costo: 0,
    },
  ];

  protected modalidadEntrega: ModalidadEntrega | null = null;

  protected tarjeta = {
    numero: '',
    titular: '',
    vencimiento: '',
    cvv: '',
  };

  protected async continuarAPago(form: NgForm): Promise<void> {
    if (form.invalid) {
      form.form.markAllAsTouched();
      this.errorRegistroCliente.set(this.errorCamposCliente);
      return;
    }
    if (this.registrandoCliente()) return;

    this.registrandoCliente.set(true);
    this.errorRegistroCliente.set('');
    try {
      await this.customerService.registrar(this.datos);
      this.paso = 'entrega';
    } catch (error) {
      const serverMessage = error instanceof HttpErrorResponse
        ? error.error?.mensaje
        : null;
      this.errorRegistroCliente.set(
        typeof serverMessage === 'string'
          ? serverMessage
          : 'No se pudieron registrar tus datos. Verifica la conexión e inténtalo nuevamente.',
      );
    } finally {
      this.registrandoCliente.set(false);
    }
  }

  protected volverADatos(): void {
    this.paso = 'datos';
  }

  protected seleccionarEntrega(modalidad: ModalidadEntrega): void {
    this.modalidadEntrega = modalidad;
  }

  protected continuarDesdeEntrega(): void {
    if (this.modalidadEntrega) {
      this.paso = 'pago';
    }
  }

  protected volverAEntrega(): void {
    this.paso = 'entrega';
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
    if (!this.metodoPago || !this.metodoPagoValido || !this.modalidadEntrega) {
      return;
    }

    this.pedidoActual = this.cart.confirmOrder(
      this.datos,
      this.nombreMetodoPago(),
      this.modalidadEntrega,
    );
    this.paso = 'confirmado';
  }

  protected nombreMetodoPago(): string {
    return this.metodosPago.find((m) => m.id === this.metodoPago)?.nombre ?? '';
  }

  protected cerrar(): void {
    this.cart.closeCheckout();
    this.paso = 'datos';
    this.metodoPago = null;
    this.modalidadEntrega = null;
    this.codigoPago = '';
    this.pedidoActual = null;
    this.tarjeta = { numero: '', titular: '', vencimiento: '', cvv: '' };
    this.datos = { nombre: '', apellido: '', email: '', telefono: '', direccion: '' };
  }

  private generarCodigo(): string {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
  }
}
