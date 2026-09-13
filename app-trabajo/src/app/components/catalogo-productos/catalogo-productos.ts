import { Component, computed, signal } from '@angular/core';

interface Producto {
  id: number;
  nombre: string;
  imagen: string;
}

interface LineaProducto {
  id: number;
  nombre: string;
  imagen: string;
  descripcion: string;
  enlace: string;
  productos: Producto[];
}

@Component({
  selector: 'app-catalogo-productos',
  templateUrl: './catalogo-productos.html',
  styleUrl: './catalogo-productos.css',
})
export class CatalogoProductos {
  protected readonly lineas: LineaProducto[] = [
    {
      id: 1,
      nombre: 'Línea Hogar',
      imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/Fopesa-9-1.png.webp',
      descripcion: 'Fósforos y productos esenciales para el hogar.',
      enlace: 'https://www.fopesa.com.pe/linea-hogar/',
      productos: [
        { id: 101, nombre: 'Fósforos 40 luces Inti', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2020/08/38-fosforera-peruana-inti.png.webp' },
        { id: 102, nombre: 'Fósforos 40 luces La Llama', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2020/08/72-fosforera-peruana-inti.png.webp' },
        { id: 103, nombre: 'Fósforos extra largo', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/fosforos-extralargo-01.jpg.webp' },
        { id: 104, nombre: 'Fósforos familiar 200 luces Inti', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2020/08/39-fosforera-peruana-inti.png.webp' },
        { id: 105, nombre: 'Fósforos familiar 200 luces La Llama', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2020/08/73-fosforera-peruana-inti.png.webp' },
      ],
    },
    {
      id: 2,
      nombre: 'Línea Parrillera',
      imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/Fopesa-10.png.webp',
      descripcion: 'Todo lo necesario para disfrutar una buena parrilla.',
      enlace: 'https://www.fopesa.com.pe/linea-parrillera/',
      productos: [
        { id: 201, nombre: 'Brochetas', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-brochetas.png.webp' },
        { id: 202, nombre: 'Carbón Arizona 2KG', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2024/10/2k-carbon.png.webp' },
        { id: 203, nombre: 'Carbón Arizona 3KG', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2024/10/3k-carbon.png.webp' },
        { id: 204, nombre: 'Carbón Arizona 5KG', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2024/10/5k-carbon.png.webp' },
        { id: 205, nombre: 'Fósforos Parrilleros x 10 unidades', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2020/10/parrilleros_10u.png.webp' },
        { id: 206, nombre: 'Fósforos Parrilleros x 5 unidades', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/08/parrilleros_5u.png.webp' },
        { id: 207, nombre: 'Leña', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2024/10/lena.png.webp' },
        { id: 208, nombre: 'Mechero', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2024/10/mechero.png.webp' },
        { id: 209, nombre: 'Mondadiente c/ Envoltura', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2023/01/thumb-mondadientes-1punta.png.webp' },
        { id: 210, nombre: 'Mondadientes', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2021/11/thumb-mondadientes-caja.png.webp' },
        { id: 211, nombre: 'Mondadientes Bolsa una Punta', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2021/11/thumb-mondadientes-1punta.png.webp' },
        { id: 212, nombre: 'Palitos Anticucheros', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2021/11/thumb-anticucheros.png.webp' },
      ],
    },
    {
      id: 3,
      nombre: 'Línea Joven',
      imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2023/01/Joven1.png.webp',
      descripcion: 'Encendedores prácticos para cada ocasión.',
      enlace: 'https://www.fopesa.com.pe/linea-joven/',
      productos: [
        { id: 301, nombre: 'Encendedor de Piedra Fragata', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2020/08/61-fosforera-peruana-inti.png.webp' },
        { id: 302, nombre: 'Encendedor Electrónico Fragata con linterna', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2020/08/75-fosforera-peruana-inti.png.webp' },
        { id: 303, nombre: 'Encendedor Top Fragata', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/encendedor-top-fragata-01.jpg.webp' },
        { id: 304, nombre: 'Pack Duo Electrónico', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2020/08/69-fosforera-peruana-inti.png.webp' },
        { id: 305, nombre: 'Pack Parrillero Electrónico', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2020/08/71-fosforera-peruana-inti.png.webp' },
      ],
    },
    {
      id: 4,
      nombre: 'Línea Espirales',
      imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2023/01/index-linea-espiral-1-1.png.webp',
      descripcion: 'La protección Tumi para mantener tus espacios libres de mosquitos.',
      enlace: 'https://www.fopesa.com.pe/linea-espirales/',
      productos: [
        { id: 401, nombre: 'Tumi Espirales X 10', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-tumi-1-1.png.webp' },
      ],
    },
    {
      id: 5,
      nombre: 'Línea Eco Food',
      imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2023/01/index-linea-eco-1-1.png.webp',
      descripcion: 'Envases, vasos y cubiertos descartables para tu negocio.',
      enlace: 'https://www.fopesa.com.pe/linea-eco-food/',
      productos: [
        { id: 501, nombre: 'Cubierto en Bolsita Cuchara de Madera x50', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2020/09/cuchara-bolsa.png.webp' },
        { id: 502, nombre: 'Cubierto en Bolsita Cuchillo de Madera x50', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2020/09/cuchillo-bolsa.png.webp' },
        { id: 503, nombre: 'Cubierto en Bolsita Tenedor de Madera x50', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2020/09/tenedor-bolsa.png.webp' },
        { id: 504, nombre: 'Cubierto en Cajita Cuchara de Madera x24', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2020/09/caja_cucharas.png.webp' },
        { id: 505, nombre: 'Cubierto en Cajita Cuchillo de Madera x24', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2020/09/caja_cuchillos.png.webp' },
        { id: 506, nombre: 'Cubierto en Cajita Tenedor de Madera x24', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2020/09/caja_tenedores.png.webp' },
        { id: 507, nombre: 'Cubiertos x100 Cucharas', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2021/11/Thumb-cucharas.png.webp' },
        { id: 508, nombre: 'Cubiertos x100 Cuchillos', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2021/11/cuchillos-thumb.png.webp' },
        { id: 509, nombre: 'Cubiertos x100 Tenedores', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2021/11/Tenedores-thumb.png.webp' },
        { id: 510, nombre: 'Cucharita de Helado', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2021/11/Thumb-Helado.png.webp' },
        { id: 511, nombre: 'Inti Bandeja Rectangular #20 X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-bandeja-rectangular-20-1.png.webp' },
        { id: 512, nombre: 'Inti Bowl Hondo #17 32 oz X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-bowl-17.png.webp' },
        { id: 513, nombre: 'Inti Bowl Hondo #21 32 oz X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-bowl-21.png.webp' },
        { id: 514, nombre: 'Inti Bowl Kraft 1300 X50', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2023/06/inti-bowl-kraft-1200-01.jpg' },
        { id: 515, nombre: 'Inti Bowl Kraft 750 X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2023/06/inti-bowl-kraft-750-01.jpg' },
        { id: 516, nombre: 'Inti Contenedor Ancho #2 X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2023/01/thumb-contenedor-ancho-2.png' },
        { id: 517, nombre: 'Inti Contenedor Chico #3 X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2023/01/thumb-contenedor-chico-3.png' },
        { id: 518, nombre: 'Inti Contenedor Grande #1 x25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2023/01/thumb-contenedor-grande-1.png' },
        { id: 519, nombre: 'Inti contenedor Grande XL x25 Envases Descartables', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2023/01/thumb-contenedor-grande-1.png' },
        { id: 520, nombre: 'Inti Eco Vaso #12 oz X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2023/06/inti-eco-vaso-12-01.jpg' },
        { id: 521, nombre: 'Inti Eco Vaso #8 oz X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2023/06/inti-eco-vaso-8-01.jpg' },
        { id: 522, nombre: 'Inti Heladero #5 oz X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-heladera-5.png' },
        { id: 523, nombre: 'Inti Salsera #2 oz X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-salsera-2.png' },
        { id: 524, nombre: 'Inti Sopera #32 oz X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2023/01/thumb-inti-sopera-32.png' },
        { id: 525, nombre: 'Inti Tapa Bowl Hondo #17 32 oz X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-tapa-bowl-17.png' },
        { id: 526, nombre: 'Inti Tapa Bowl Hondo #21 32 oz X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-tapa-bowl-21.png' },
        { id: 527, nombre: 'Inti Tapa Bowl Kraft 1200 X50', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2023/06/inti-tapa-bowl-kraft-1200-01.jpg' },
        { id: 528, nombre: 'Inti Tapa Bowl Kraft 750 X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2023/06/inti-tapa-bowl-kraft-1200-01-1.jpg' },
        { id: 529, nombre: 'Inti Tapa Sopera #32 oz X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-tapa-sopera-32-1.png' },
        { id: 530, nombre: 'Inti Tapa Vaso #12 oz X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-tapa-vaso-12.png' },
        { id: 531, nombre: 'Inti Tapa Vaso #16 oz X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-tapa-vaso-16.png' },
        { id: 532, nombre: 'Inti Tapa Vaso 8 oz X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-tapa-vaso-8.png' },
        { id: 533, nombre: 'Inti Vaso #12 oz X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-vaso-12.png' },
        { id: 534, nombre: 'Inti Vaso #16 oz X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-vaso-16.png' },
        { id: 535, nombre: 'Inti Vaso #4 oz X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2023/06/inti-vaso-4-01.jpg' },
        { id: 536, nombre: 'Inti Vaso #8 oz X25', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-vaso-8.png' },
        { id: 537, nombre: 'Removedores de bebidas 140', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2021/11/Removedor-thumn.png' },
        { id: 538, nombre: 'Removedores de bebidas 178', imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2021/11/Removedor-170-thumb.png' },
      ],
    },
  ];

  protected readonly textoBusqueda = signal('');
  protected readonly lineaFiltro = signal<number | null>(null);

  protected readonly productosFiltrados = computed(() => {
    const texto = this.normalizar(this.textoBusqueda());
    const lineaId = this.lineaFiltro();

    return this.lineas.flatMap((linea) =>
      linea.productos
        .filter((producto) => {
          const coincideTexto =
            !texto ||
            this.normalizar(producto.nombre).includes(texto);

          const coincideLinea =
            lineaId === null || linea.id === lineaId;

          return coincideTexto && coincideLinea;
        })
        .map((producto) => ({
          ...producto,
          lineaId: linea.id,
          lineaNombre: linea.nombre,
        })),
    );
  });

  protected actualizarBusqueda(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.textoBusqueda.set(input.value);
  }

  protected actualizarLinea(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.lineaFiltro.set(select.value ? Number(select.value) : null);
  }

  protected limpiarFiltros(): void {
    this.textoBusqueda.set('');
    this.lineaFiltro.set(null);
  }

  private normalizar(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  protected readonly lineaSeleccionada = signal<LineaProducto | null>(null);
  protected readonly productoSeleccionado = signal<Producto | null>(null);

  protected seleccionarLinea(linea: LineaProducto): void {
    this.lineaSeleccionada.set(linea);
    this.productoSeleccionado.set(null);
  }

  protected seleccionarProducto(producto: Producto): void {
    this.productoSeleccionado.set(producto);
  }

  protected volverALineas(): void {
    this.lineaSeleccionada.set(null);
    this.productoSeleccionado.set(null);
  }
}
