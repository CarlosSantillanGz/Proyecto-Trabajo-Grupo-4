import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CartProduct } from '../../services/cart.service';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  templateUrl: './product-modal.component.html',
  styleUrl: './product-modal.component.css',
})
export class ProductModalComponent {
  @Input() producto: CartProduct | null = null;
  @Output() cerrado = new EventEmitter<void>();
  @Output() agregado = new EventEmitter<CartProduct>();

  protected cerrar(): void {
    this.cerrado.emit();
  }

  protected agregarAlCarrito(): void {
    if (this.producto) {
      this.agregado.emit(this.producto);
    }
  }
}
