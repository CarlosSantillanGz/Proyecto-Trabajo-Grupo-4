import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductModalComponent } from '../../components/product-modal/product-modal.component';
import { CartProduct, CartService } from '../../services/cart.service';
import { Promocion, PromotionsService } from '../../services/promotions.service';

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [DecimalPipe, ProductModalComponent, RouterLink],
  templateUrl: './promociones.html',
  styleUrl: './promociones.css',
})
export class Promociones {
  private readonly cartService = inject(CartService);
  private readonly promotionsService = inject(PromotionsService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly promociones = signal<Promocion[]>([]);
  protected readonly estadoCarga = signal<'loading' | 'loaded' | 'error'>('loading');
  protected readonly promocionSeleccionada = signal<Promocion | null>(null);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      void this.cargarPromociones();
    }
  }

  protected async cargarPromociones(): Promise<void> {
    this.estadoCarga.set('loading');
    try {
      this.promociones.set(await this.promotionsService.listar());
      this.estadoCarga.set('loaded');
    } catch {
      this.estadoCarga.set('error');
    }
  }

  protected seleccionarPromocion(promocion: Promocion): void {
    this.promocionSeleccionada.set(promocion);
  }

  protected cerrarDetalle(): void {
    this.promocionSeleccionada.set(null);
  }

  protected agregarAlCarrito(producto: CartProduct): void {
    this.cartService.add(producto);
    this.cerrarDetalle();
  }
}
