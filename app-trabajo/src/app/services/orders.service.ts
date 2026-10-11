import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { INVENTORY_API_URL } from './inventory.service';

export type EstadoPedido = 'Recibido' | 'Confirmado' | 'Listo' | 'Entregado';
export type ModalidadPedido = 'delivery' | 'pickup';

export interface PedidoApiItem {
  idProducto: number;
  nombre: string;
  imagen: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface PedidoCreado {
  idPedido: string;
  fecha: string;
  estado: EstadoPedido;
  total: number;
  items: PedidoApiItem[];
  modalidad: ModalidadPedido;
}

export interface PedidoConsultado extends Omit<PedidoCreado, 'modalidad'> {
  cliente: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    direccion: string;
  };
  modalidad: string;
  costoEntrega: number;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(INVENTORY_API_URL).replace(/\/$/, '');

  crear(
    idCliente: number,
    items: Array<{ idProducto: number; cantidad: number }>,
    modalidad: ModalidadPedido,
  ): Promise<PedidoCreado> {
    return firstValueFrom(
      this.http.post<PedidoCreado>(`${this.apiUrl}/pedidos`, {
        idCliente,
        items,
        modalidad,
      }),
    );
  }

  actualizarEstado(
    idPedido: string,
    estado: EstadoPedido,
  ): Promise<{ idPedido: string; estado: EstadoPedido }> {
    return firstValueFrom(
      this.http.patch<{ idPedido: string; estado: EstadoPedido }>(
        `${this.apiUrl}/pedidos/${this.idNumerico(idPedido)}/estado`,
        { estado },
      ),
    );
  }

  consultar(idPedido: string, contacto: string): Promise<PedidoConsultado> {
    const params = new HttpParams().set('contacto', contacto);
    return firstValueFrom(
      this.http.get<PedidoConsultado>(`${this.apiUrl}/pedidos/${this.idNumerico(idPedido)}`, {
        params,
      }),
    );
  }

  private idNumerico(idPedido: string): string {
    const match = /^FOP-(\d+)$/i.exec(idPedido.trim());
    if (!match) {
      throw new Error('El número de pedido no es válido');
    }
    return match[1];
  }
}
