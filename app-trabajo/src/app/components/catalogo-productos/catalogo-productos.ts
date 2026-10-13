import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ProductModalComponent } from '../product-modal/product-modal.component';
import { CartProduct, CartService } from '../../services/cart.service';
import { CatalogService, CategoriaCatalogo } from '../../services/catalog.service';

interface Producto extends CartProduct {
  precio?: number;
}

interface LineaProducto extends CategoriaCatalogo {
  id: number;
  imagen: string;
  enlace: string;
  productos: Producto[];
  cargaFallida?: boolean;
}

const CATEGORY_PRESENTATION: Record<number, { imagen: string; enlace: string }> = {
  1: {
    imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/Fopesa-9-1.png.webp',
    enlace: 'https://www.fopesa.com.pe/linea-hogar/',
  },
  2: {
    imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2022/12/Fopesa-10.png.webp',
    enlace: 'https://www.fopesa.com.pe/linea-parrillera/',
  },
  3: {
    imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2023/01/Joven1.png.webp',
    enlace: 'https://www.fopesa.com.pe/linea-joven/',
  },
  4: {
    imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2023/01/index-linea-espiral-1-1.png.webp',
    enlace: 'https://www.fopesa.com.pe/linea-espirales/',
  },
  5: {
    imagen: 'https://www.fopesa.com.pe/wp-content/uploads/2023/01/index-linea-eco-1-1.png.webp',
    enlace: 'https://www.fopesa.com.pe/linea-eco-food/',
  },
};

const DEFAULT_CATEGORY_IMAGE =
  'https://www.fopesa.com.pe/wp-content/uploads/2022/12/Fopesa-9-1.png.webp';

@Component({
  selector: 'app-catalogo-productos',
  standalone: true,
  imports: [DecimalPipe, ProductModalComponent],
  templateUrl: './catalogo-productos.html',
  styleUrl: './catalogo-productos.css',
})
export class CatalogoProductos implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly catalogService = inject(CatalogService);
  private categoryRequestId = 0;

  protected readonly lineas = signal<LineaProducto[]>([]);
  protected readonly cargandoCatalogo = signal(true);
  protected readonly categoriaCargando = signal<number | null>(null);
  protected readonly errorCatalogo = signal('');
  protected readonly categoriasCargadas = signal(new Set<number>());
  protected readonly mensajeCategoriaVacia = signal('');
  protected readonly textoBusqueda = signal('');
  protected readonly lineaFiltro = signal<number | null>(null);

  protected readonly productosFiltrados = computed(() => {
    const texto = this.normalizar(this.textoBusqueda());
    const lineaId = this.lineaFiltro();

    return this.lineas().flatMap((linea) =>
      linea.productos
        .filter((producto) => {
          const coincideTexto = !texto || this.normalizar(producto.nombre).includes(texto);
          const coincideLinea = lineaId === null || linea.id === lineaId;
          return coincideTexto && coincideLinea;
        })
        .map((producto) => ({
          ...producto,
          lineaId: linea.id,
          lineaNombre: linea.nombre,
        })),
    );
  });

  protected readonly lineaSeleccionada = signal<LineaProducto | null>(null);
  protected readonly productoSeleccionado = signal<Producto | null>(null);
  protected readonly productoDetalle = signal<Producto | null>(null);

  ngOnInit(): void {
    void this.cargarCatalogo();
  }

  protected actualizarBusqueda(event: Event): void {
    this.textoBusqueda.set((event.target as HTMLInputElement).value);
  }

  protected actualizarLinea(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.lineaFiltro.set(value ? Number(value) : null);
  }

  protected limpiarFiltros(): void {
    this.textoBusqueda.set('');
    this.lineaFiltro.set(null);
  }

  protected seleccionarLinea(linea: LineaProducto): void {
    this.lineaSeleccionada.set(linea);
    this.productoSeleccionado.set(null);
    this.mensajeCategoriaVacia.set('');
    this.errorCatalogo.set('');

    if (!this.categoriasCargadas().has(linea.id)) {
      void this.cargarProductosCategoria(linea);
    }
  }

  protected seleccionarProducto(
    producto: Producto,
    lineaNombre?: string,
    descripcion?: string,
  ): void {
    this.productoSeleccionado.set(producto);
    this.productoDetalle.set({
      ...producto,
      lineaNombre: producto.lineaNombre ?? lineaNombre,
      descripcion: producto.descripcion ?? descripcion,
    });
  }

  protected cerrarDetalle(): void {
    this.productoDetalle.set(null);
  }

  protected agregarAlCarrito(producto: CartProduct): void {
    this.cartService.add(producto);
    this.cerrarDetalle();
  }

  protected volverALineas(): void {
    this.lineaSeleccionada.set(null);
    this.productoSeleccionado.set(null);
    this.mensajeCategoriaVacia.set('');
  }

  protected reintentarCarga(): void {
    const linea = this.lineaSeleccionada();
    if (linea) {
      this.categoriasCargadas.update((categorias) => {
        const actualizadas = new Set(categorias);
        actualizadas.delete(linea.id);
        return actualizadas;
      });
      void this.cargarProductosCategoria(linea);
      return;
    }

    void this.cargarCatalogo();
  }

  private async cargarCatalogo(): Promise<void> {
    this.cargandoCatalogo.set(true);
    this.errorCatalogo.set('');

    try {
      const categorias = await this.catalogService.consultarCategorias();
      const lineas = categorias.map((categoria) => this.crearLinea(categoria));
      this.lineas.set(lineas);

      const resultados = await Promise.allSettled(
        lineas.map((linea) => this.catalogService.consultarProductos(linea.id)),
      );
      const categoriasCargadas = new Set<number>();
      let huboErrores = false;

      const lineasConProductos = lineas.map((linea, index) => {
        const resultado = resultados[index];
        if (resultado.status === 'rejected') {
          huboErrores = true;
          return { ...linea, cargaFallida: true };
        }

        categoriasCargadas.add(linea.id);
        return {
          ...linea,
          productos: resultado.value.productos.map((producto) => ({
            id: producto.idProducto,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: producto.precio,
            imagen: producto.imagen || linea.imagen,
            lineaNombre: linea.nombre,
          })),
        };
      });

      this.lineas.set(lineasConProductos);
      this.categoriasCargadas.set(categoriasCargadas);
      if (huboErrores) {
        this.errorCatalogo.set('No se pudieron cargar los productos de algunas categorías.');
      }
    } catch {
      this.errorCatalogo.set('No se pudieron cargar las categorías. Intenta nuevamente.');
    } finally {
      this.cargandoCatalogo.set(false);
    }
  }

  private async cargarProductosCategoria(linea: LineaProducto): Promise<void> {
    const requestId = ++this.categoryRequestId;
    this.categoriaCargando.set(linea.id);
    this.errorCatalogo.set('');
    this.mensajeCategoriaVacia.set('');

    try {
      const respuesta = await this.catalogService.consultarProductos(linea.id);
      const productos = respuesta.productos.map((producto) => ({
        id: producto.idProducto,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        imagen: producto.imagen || linea.imagen,
        lineaNombre: linea.nombre,
      }));
      this.actualizarProductosCategoria(linea.id, productos);
      this.categoriasCargadas.update((categorias) => new Set(categorias).add(linea.id));
      if (this.lineaSeleccionada()?.id === linea.id) {
        this.mensajeCategoriaVacia.set(
          respuesta.mensaje || (productos.length === 0
            ? 'No hay productos disponibles en esta categoría.'
            : ''),
        );
      }
    } catch {
      if (this.lineaSeleccionada()?.id === linea.id) {
        this.errorCatalogo.set('No se pudieron cargar los productos de esta categoría. Intenta nuevamente.');
      }
    } finally {
      if (requestId === this.categoryRequestId) {
        this.categoriaCargando.set(null);
      }
    }
  }

  private crearLinea(categoria: CategoriaCatalogo): LineaProducto {
    const presentation = CATEGORY_PRESENTATION[categoria.idCategoria];
    return {
      ...categoria,
      id: categoria.idCategoria,
      imagen: presentation?.imagen ?? DEFAULT_CATEGORY_IMAGE,
      enlace: presentation?.enlace ?? 'https://www.fopesa.com.pe/',
      productos: [],
    };
  }

  private actualizarProductosCategoria(id: number, productos: Producto[]): void {
    this.lineas.update((lineas) =>
      lineas.map((linea) =>
        linea.id === id ? { ...linea, productos, cargaFallida: false } : linea,
      ),
    );
    this.lineaSeleccionada.update((linea) =>
      linea?.id === id ? { ...linea, productos, cargaFallida: false } : linea,
    );
  }

  private normalizar(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
