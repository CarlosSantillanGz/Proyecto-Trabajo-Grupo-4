import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.css',
})
export class CartDrawerComponent {
  protected readonly cart = inject(CartService);
  private readonly inventory = inject(InventoryService);
  protected readonly checkingProductId = signal<number | null>(null);
  protected readonly stockErrors = signal<Record<number, string>>({});

  protected async increase(productId: number, quantity: number): Promise<void> {
    if (this.checkingProductId() !== null) return;
    this.checkingProductId.set(productId);
    this.clearStockError(productId);
    try {
      const result = await this.inventory.consultarDisponibilidad(productId, quantity + 1);
      if (result.puedeAtender) {
        this.cart.increase(productId);
      } else {
        this.setStockError(productId, `Stock máximo disponible: ${result.stock}.`);
      }
    } catch {
      this.setStockError(productId, 'No se pudo consultar el stock. Intenta nuevamente.');
    } finally {
      this.checkingProductId.set(null);
    }
  }

  private setStockError(productId: number, message: string): void {
    this.stockErrors.update((errors) => ({ ...errors, [productId]: message }));
  }

  private clearStockError(productId: number): void {
    this.stockErrors.update((errors) => {
      const { [productId]: _removed, ...remaining } = errors;
      return remaining;
    });
  }
}
