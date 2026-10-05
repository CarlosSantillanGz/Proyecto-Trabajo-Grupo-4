import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface DisponibilidadProducto {
  idProducto: number;
  stock: number;
  disponible: boolean;
  cantidadSolicitada: number;
  puedeAtender: boolean;
}

export const INVENTORY_API_URL = new InjectionToken<string>('INVENTORY_API_URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:8000',
});

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(INVENTORY_API_URL).replace(/\/$/, '');

  consultarDisponibilidad(
    productId: number,
    cantidad = 1,
  ): Promise<DisponibilidadProducto> {
    const params = new HttpParams().set('cantidad', cantidad);
    return firstValueFrom(
      this.http.get<DisponibilidadProducto>(
        `${this.apiUrl}/productos/${productId}/disponibilidad`,
        { params },
      ),
    );
  }
}