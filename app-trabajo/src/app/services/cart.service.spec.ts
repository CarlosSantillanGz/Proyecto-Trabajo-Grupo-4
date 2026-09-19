import { CartProduct, CartService } from './cart.service';

describe('CartService', () => {
  const product: CartProduct = {
    id: 1,
    nombre: 'Producto de prueba',
    imagen: 'producto.jpg',
    precio: 10,
  };

  it('actualiza la cantidad y el total al aumentar un producto', () => {
    const cart = new CartService();

    cart.add(product);
    cart.increase(product.id);

    expect(cart.items()[0].cantidad).toBe(2);
    expect(cart.totalItems()).toBe(2);
    expect(cart.totalPrice()).toBe(20);
  });

  it('actualiza la cantidad y el total al disminuir un producto', () => {
    const cart = new CartService();

    cart.add(product);
    cart.increase(product.id);
    cart.decrease(product.id);

    expect(cart.items()[0].cantidad).toBe(1);
    expect(cart.totalItems()).toBe(1);
    expect(cart.totalPrice()).toBe(10);
  });

  it('elimina la línea cuando la cantidad llega a cero', () => {
    const cart = new CartService();

    cart.add(product);
    cart.decrease(product.id);

    expect(cart.items()).toEqual([]);
    expect(cart.totalItems()).toBe(0);
    expect(cart.totalPrice()).toBe(0);
  });
});