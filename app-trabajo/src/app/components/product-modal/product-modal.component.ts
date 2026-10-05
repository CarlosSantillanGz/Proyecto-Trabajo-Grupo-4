import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { CartProduct, CartService } from '../../services/cart.service';
import { DisponibilidadProducto, InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './product-modal.component.html',
  styleUrl: './product-modal.component.css',
})
export class ProductModalComponent implements OnChanges {
  private readonly inventory = inject(InventoryService);
  private readonly cart = inject(CartService);
  private availabilityRequest = 0;

  @Input() producto: CartProduct | null = null;
  @Output() cerrado = new EventEmitter<void>();
  @Output() agregado = new EventEmitter<CartProduct>();

  protected readonly disponibilidad = signal<DisponibilidadProducto | null>(null);
  protected readonly verificando = signal(false);
  protected readonly errorDisponibilidad = signal('');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['producto'] && this.producto) {
      void this.cargarDisponibilidad(this.producto.id);
    }
  }

  protected cerrar(): void {
    this.cerrado.emit();
  }

  protected async agregarAlCarrito(): Promise<void> {
    const producto = this.producto;
    if (!producto || this.verificando()) return;

    this.verificando.set(true);
    this.errorDisponibilidad.set('');
    try {
      const cantidadActual = this.cart.items()
        .find((item) => item.producto.id === producto.id)?.cantidad ?? 0;
      const resultado = await this.inventory.consultarDisponibilidad(
        producto.id,
        cantidadActual + 1,
      );
      this.disponibilidad.set(resultado);
      if (!resultado.puedeAtender) {
        this.errorDisponibilidad.set(
          `No hay stock suficiente. Disponible: ${resultado.stock}.`,
        );
        return;
      }
      this.agregado.emit(producto);
    } catch {
      this.errorDisponibilidad.set('No se pudo consultar el stock. Intenta nuevamente.');
    } finally {
      this.verificando.set(false);
    }
  }

  private async cargarDisponibilidad(productId: number): Promise<void> {
    const requestId = ++this.availabilityRequest;
    this.disponibilidad.set(null);
    this.errorDisponibilidad.set('');
    this.verificando.set(true);
    try {
      const resultado = await this.inventory.consultarDisponibilidad(productId);
      if (requestId === this.availabilityRequest) this.disponibilidad.set(resultado);
    } catch {
      if (requestId === this.availabilityRequest) {
        this.errorDisponibilidad.set('No se pudo consultar el stock. Intenta nuevamente.');
      }
    } finally {
      if (requestId === this.availabilityRequest) this.verificando.set(false);
    }
  }
}
