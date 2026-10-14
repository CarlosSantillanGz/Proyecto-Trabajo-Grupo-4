import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ModalidadEntrega } from './cart.service';
import { ModalidadPedido } from './orders.service';
import { DELIVERY_MODES_API_URL } from './api-endpoints';

interface DeliveryModeApiItem {
  id_modalidad: number | string;
  nombre: string;
  descripcion: string;
  costo: number | string;
}

interface DeliveryModesApiResponse {
  modalidades: DeliveryModeApiItem[];
}

export interface ModalidadCheckout extends ModalidadEntrega {
  codigoPedido: ModalidadPedido;
}

@Injectable({ providedIn: 'root' })
export class DeliveryModesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(DELIVERY_MODES_API_URL).replace(/\/$/, '');

  async listar(): Promise<ModalidadCheckout[]> {
    const params = new HttpParams().set('accion', 'listar_modalidades');
    const response = await firstValueFrom(
      this.http.get<DeliveryModesApiResponse>(this.apiUrl, { params }),
    );

    return response.modalidades.flatMap((mode) => {
      const codigoPedido = this.getOrderCode(mode.nombre);
      const costo = Number(mode.costo);
      if (!codigoPedido || !Number.isFinite(costo)) return [];

      return [{
        id: String(mode.id_modalidad),
        nombre: mode.nombre,
        detalle: mode.descripcion,
        tiempo: '',
        costo,
        codigoPedido,
      }];
    });
  }

  private getOrderCode(name: string): ModalidadPedido | null {
    const normalizedName = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (normalizedName.includes('recojo') || normalizedName.includes('pickup')) {
      return 'pickup';
    }
    if (normalizedName.includes('delivery') || normalizedName.includes('domicilio')) {
      return 'delivery';
    }
    return null;
  }
}