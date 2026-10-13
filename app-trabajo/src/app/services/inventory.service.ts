import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { INVENTORY_API_URL } from './api-endpoints';

export interface DisponibilidadProducto {
  idProducto: number;
  stock: number;
  disponible: boolean;
  cantidadSolicitada: number;
  puedeAtender: boolean;
}

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