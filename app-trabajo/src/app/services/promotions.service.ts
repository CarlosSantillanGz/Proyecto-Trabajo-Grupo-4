import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CartProduct } from './cart.service';
import { PROMOTIONS_API_URL } from './api-endpoints';

interface PromotionApiItem {
  id_prom: number | string;
  promocion_nombre: string;
  promocion_descripcion: string;
  descuento: number | string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: boolean | number | string;
  id_producto: number | string;
  producto_nombre: string;
  producto_descripcion: string;
  precio: number | string;
  imagen: string | null;
}

interface PromotionsApiResponse {
  promociones: PromotionApiItem[];
}

export interface Promocion {
  id: number;
  titulo: string;
  beneficio: string;
  detalle: string;
  etiqueta: string;
  producto: CartProduct;
}

@Injectable({ providedIn: 'root' })
export class PromotionsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(PROMOTIONS_API_URL).replace(/\/$/, '');

  async listar(): Promise<Promocion[]> {
    const params = new HttpParams().set('accion', 'listar_promociones');
    const response = await firstValueFrom(
      this.http.get<PromotionsApiResponse>(this.apiUrl, { params }),
    );
    const today = new Date().toISOString().slice(0, 10);

    return response.promociones
      .filter((promotion) => this.isActive(promotion.estado))
      .filter((promotion) => promotion.fecha_inicio <= today && promotion.fecha_fin >= today)
      .map((promotion) => {
        const discount = Number(promotion.descuento);
        return {
          id: Number(promotion.id_prom),
          titulo: promotion.promocion_nombre,
          beneficio: promotion.promocion_descripcion,
          detalle: `${promotion.producto_descripcion} Vigencia: ${promotion.fecha_inicio} al ${promotion.fecha_fin}.`,
          etiqueta: `${Number.isFinite(discount) ? discount : 0}% de descuento`,
          producto: {
            id: Number(promotion.id_producto),
            nombre: promotion.producto_nombre,
            precio: Number(promotion.precio),
            imagen: promotion.imagen || '',
            lineaNombre: 'Promoción',
            descripcion: promotion.producto_descripcion,
          },
        };
      });
  }

  private isActive(status: PromotionApiItem['estado']): boolean {
    return status === true || status === 1 || status === '1' || status === 'true';
  }
}