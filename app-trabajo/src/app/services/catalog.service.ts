import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CATALOG_API_URL } from './api-endpoints';

export interface CategoriaCatalogo {
  idCategoria: number;
  nombre: string;
  descripcion: string;
}

export interface ProductoCatalogo {
  idProducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
}

interface CategoriasResponse {
  categorias: CategoriaCatalogo[];
}

export interface ProductosCategoriaResponse {
  idCategoria: number;
  productos: ProductoCatalogo[];
  mensaje?: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(CATALOG_API_URL).replace(/\/$/, '');

  consultarCategorias(): Promise<CategoriaCatalogo[]> {
    return firstValueFrom(
      this.http.get<CategoriasResponse>(`${this.apiUrl}/categorias`),
    ).then((response) => response.categorias);
  }

  consultarProductos(idCategoria: number): Promise<ProductosCategoriaResponse> {
    return firstValueFrom(
      this.http.get<ProductosCategoriaResponse>(
        `${this.apiUrl}/categorias/${idCategoria}/productos`,
      ),
    );
  }
}
