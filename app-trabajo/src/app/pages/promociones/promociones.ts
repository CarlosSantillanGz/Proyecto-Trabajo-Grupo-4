import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductModalComponent } from '../../components/product-modal/product-modal.component';
import { CartProduct, CartService } from '../../services/cart.service';

interface Promocion {
  id: number;
  titulo: string;
  beneficio: string;
  detalle: string;
  etiqueta: string;
  producto: CartProduct;
}

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [DecimalPipe, ProductModalComponent, RouterLink],
  templateUrl: './promociones.html',
  styleUrl: './promociones.css',
})
export class Promociones {
  private readonly cartService = inject(CartService);

  protected readonly promociones: Promocion[] = [
    {
      id: 1,
      titulo: 'Parrilla lista para compartir',
      beneficio: 'Carbón Arizona 5KG a precio especial',
      detalle: 'Lleva el carbón ideal para tus reuniones y disfruta más de cada parrilla.',
      etiqueta: 'Línea Parrillera',
      producto: {
        id: 204,
        nombre: 'Carbón Arizona 5KG',
        precio: 27.9,
        imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2024/10/5k-carbon.png.webp',
        lineaNombre: 'Línea Parrillera',
        descripcion: 'Carbón Arizona para tus mejores parrillas.',
      },
    },
    {
      id: 2,
      titulo: 'Sabor que rinde',
      beneficio: 'Pack Parrillero Electrónico',
      detalle: 'El encendedor práctico para prender tu parrilla sin complicaciones.',
      etiqueta: 'Línea Joven',
      producto: {
        id: 305,
        nombre: 'Pack Parrillero Electrónico',
        precio: 14.9,
        imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2020/08/71-fosforera-peruana-inti.png.webp',
        lineaNombre: 'Línea Joven',
        descripcion: 'Encendedor electrónico para tus momentos de parrilla.',
      },
    },
    {
      id: 3,
      titulo: 'Mesa práctica',
      beneficio: 'Cubiertos de madera x50',
      detalle: 'Una opción práctica para atender tus reuniones y tu negocio.',
      etiqueta: 'Línea Eco Food',
      producto: {
        id: 501,
        nombre: 'Cubierto en Bolsita Cuchara de Madera x50',
        precio: 12.9,
        imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2020/09/cuchara-bolsa.png.webp',
        lineaNombre: 'Línea Eco Food',
        descripcion: 'Cucharas de madera en presentación individual.',
      },
    },
    {
      id: 4,
      titulo: 'El esencial del hogar',
      beneficio: 'Fósforos familiar 200 luces',
      detalle: 'Una presentación rendidora para tener siempre a la mano.',
      etiqueta: 'Línea Hogar',
      producto: {
        id: 104,
        nombre: 'Fósforos familiar 200 luces Inti',
        precio: 4.5,
        imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2020/08/39-fosforera-peruana-inti.png.webp',
        lineaNombre: 'Línea Hogar',
        descripcion: 'Fósforos Inti de larga duración para el hogar.',
      },
    },
  ];

  protected readonly promocionSeleccionada = signal<Promocion | null>(null);

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
