SET XACT_ABORT ON;
BEGIN TRANSACTION;

INSERT INTO CATEGORIA (id_categoria, nombre, descripcion)
SELECT source.id_categoria, source.nombre, source.descripcion
FROM (VALUES
    (1, N'Línea Hogar', N'Fósforos y productos esenciales para el hogar.'),
    (2, N'Línea Parrillera', N'Todo lo necesario para disfrutar una buena parrilla.'),
    (3, N'Línea Joven', N'Encendedores prácticos para cada ocasión.'),
    (4, N'Línea Espirales', N'Productos para mantener los espacios libres de mosquitos.'),
    (5, N'Línea Eco Food', N'Envases, vasos y cubiertos descartables para negocios.')
) AS source (id_categoria, nombre, descripcion)
WHERE NOT EXISTS (
    SELECT 1 FROM CATEGORIA AS target WHERE target.id_categoria = source.id_categoria
);

INSERT INTO PRODUCTO
    (id_producto, id_categoria, nombre, descripcion, precio, stock, imagen, estado)
SELECT
    source.id_producto,
    source.id_categoria,
    source.nombre,
    CONCAT(N'Producto de prueba Fopesa: ', source.nombre, N'.'),
    source.precio,
    source.stock,
    source.imagen,
    1
FROM (VALUES
    (101, 1, N'Fósforos 40 luces Inti', 1.50, 10, N'https://www.fopesa.com.pe/wp-content/uploads/2020/08/38-fosforera-peruana-inti.png.webp'),
    (102, 1, N'Fósforos 40 luces La Llama', 1.50, 5, N'https://www.fopesa.com.pe/wp-content/uploads/2020/08/72-fosforera-peruana-inti.png.webp'),
    (103, 1, N'Fósforos extra largo', 3.50, 0, N'https://www.fopesa.com.pe/wp-content/uploads/2022/12/fosforos-extralargo-01.jpg.webp'),
    (104, 1, N'Fósforos familiar 200 luces Inti', 4.50, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2020/08/39-fosforera-peruana-inti.png.webp'),
    (105, 1, N'Fósforos familiar 200 luces La Llama', 4.50, 1, N'https://www.fopesa.com.pe/wp-content/uploads/2020/08/73-fosforera-peruana-inti.png.webp'),

    (201, 2, N'Brochetas', 5.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-brochetas.png.webp'),
    (202, 2, N'Carbón Arizona 2KG', 12.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2024/10/2k-carbon.png.webp'),
    (203, 2, N'Carbón Arizona 3KG', 17.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2024/10/3k-carbon.png.webp'),
    (204, 2, N'Carbón Arizona 5KG', 27.90, 2, N'https://www.fopesa.com.pe/wp-content/uploads/2024/10/5k-carbon.png.webp'),
    (205, 2, N'Fósforos Parrilleros x 10 unidades', 4.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2020/10/parrilleros_10u.png.webp'),
    (206, 2, N'Fósforos Parrilleros x 5 unidades', 3.50, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2022/08/parrilleros_5u.png.webp'),
    (207, 2, N'Leña', 14.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2024/10/lena.png.webp'),
    (208, 2, N'Mechero', 8.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2024/10/mechero.png.webp'),
    (209, 2, N'Mondadiente c/ Envoltura', 4.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2023/01/thumb-mondadientes-1punta.png.webp'),
    (210, 2, N'Mondadientes', 3.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2021/11/thumb-mondadientes-caja.png.webp'),
    (211, 2, N'Mondadientes Bolsa una Punta', 3.50, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2021/11/thumb-mondadientes-1punta.png.webp'),
    (212, 2, N'Palitos Anticucheros', 5.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2021/11/thumb-anticucheros.png.webp'),

    (301, 3, N'Encendedor de Piedra Fragata', 3.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2020/08/61-fosforera-peruana-inti.png.webp'),
    (302, 3, N'Encendedor Electrónico Fragata con linterna', 7.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2020/08/75-fosforera-peruana-inti.png.webp'),
    (303, 3, N'Encendedor Top Fragata', 5.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2022/12/encendedor-top-fragata-01.jpg.webp'),
    (304, 3, N'Pack Duo Electrónico', 12.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2020/08/69-fosforera-peruana-inti.png.webp'),
    (305, 3, N'Pack Parrillero Electrónico', 14.90, 3, N'https://www.fopesa.com.pe/wp-content/uploads/2020/08/71-fosforera-peruana-inti.png.webp'),

    (401, 4, N'Tumi Espirales X 10', 6.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-tumi-1-1.png.webp'),

    (501, 5, N'Cubierto en Bolsita Cuchara de Madera x50', 12.90, 10, N'https://www.fopesa.com.pe/wp-content/uploads/2020/09/cuchara-bolsa.png.webp'),
    (502, 5, N'Cubierto en Bolsita Cuchillo de Madera x50', 12.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2020/09/cuchillo-bolsa.png.webp'),
    (503, 5, N'Cubierto en Bolsita Tenedor de Madera x50', 12.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2020/09/tenedor-bolsa.png.webp'),
    (504, 5, N'Cubierto en Cajita Cuchara de Madera x24', 8.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2020/09/caja_cucharas.png.webp'),
    (505, 5, N'Cubierto en Cajita Cuchillo de Madera x24', 8.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2020/09/caja_cuchillos.png.webp'),
    (506, 5, N'Cubierto en Cajita Tenedor de Madera x24', 8.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2020/09/caja_tenedores.png.webp'),
    (507, 5, N'Cubiertos x100 Cucharas', 15.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2021/11/Thumb-cucharas.png.webp'),
    (508, 5, N'Cubiertos x100 Cuchillos', 15.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2021/11/cuchillos-thumb.png.webp'),
    (509, 5, N'Cubiertos x100 Tenedores', 15.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2021/11/Tenedores-thumb.png.webp'),
    (510, 5, N'Cucharita de Helado', 6.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2021/11/Thumb-Helado.png.webp'),
    (511, 5, N'Inti Bandeja Rectangular #20 X25', 18.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-bandeja-rectangular-20-1.png.webp'),
    (512, 5, N'Inti Bowl Hondo #17 32 oz X25', 16.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-bowl-17.png.webp'),
    (513, 5, N'Inti Bowl Hondo #21 32 oz X25', 19.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-bowl-21.png.webp'),
    (514, 5, N'Inti Bowl Kraft 1300 X50', 29.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2023/06/inti-bowl-kraft-1200-01.jpg'),
    (515, 5, N'Inti Bowl Kraft 750 X25', 17.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2023/06/inti-bowl-kraft-750-01.jpg'),
    (516, 5, N'Inti Contenedor Ancho #2 X25', 15.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2023/01/thumb-contenedor-ancho-2.png'),
    (517, 5, N'Inti Contenedor Chico #3 X25', 13.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2023/01/thumb-contenedor-chico-3.png'),
    (518, 5, N'Inti Contenedor Grande #1 x25', 19.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2023/01/thumb-contenedor-grande-1.png'),
    (519, 5, N'Inti contenedor Grande XL x25 Envases Descartables', 24.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2023/01/thumb-contenedor-grande-1.png'),
    (520, 5, N'Inti Eco Vaso #12 oz X25', 14.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2023/06/inti-eco-vaso-12-01.jpg'),
    (521, 5, N'Inti Eco Vaso #8 oz X25', 12.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2023/06/inti-eco-vaso-8-01.jpg'),
    (522, 5, N'Inti Heladero #5 oz X25', 11.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-heladera-5.png'),
    (523, 5, N'Inti Salsera #2 oz X25', 9.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-salsera-2.png'),
    (524, 5, N'Inti Sopera #32 oz X25', 18.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2023/01/thumb-inti-sopera-32.png'),
    (525, 5, N'Inti Tapa Bowl Hondo #17 32 oz X25', 12.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-tapa-bowl-17.png'),
    (526, 5, N'Inti Tapa Bowl Hondo #21 32 oz X25', 14.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-tapa-bowl-21.png'),
    (527, 5, N'Inti Tapa Bowl Kraft 1200 X50', 19.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2023/06/inti-tapa-bowl-kraft-1200-01.jpg'),
    (528, 5, N'Inti Tapa Bowl Kraft 750 X25', 12.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2023/06/inti-tapa-bowl-kraft-1200-01-1.jpg'),
    (529, 5, N'Inti Tapa Sopera #32 oz X25', 13.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-tapa-sopera-32-1.png'),
    (530, 5, N'Inti Tapa Vaso #12 oz X25', 9.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-tapa-vaso-12.png'),
    (531, 5, N'Inti Tapa Vaso #16 oz X25', 10.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-tapa-vaso-16.png'),
    (532, 5, N'Inti Tapa Vaso 8 oz X25', 8.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-tapa-vaso-8.png'),
    (533, 5, N'Inti Vaso #12 oz X25', 12.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-vaso-12.png'),
    (534, 5, N'Inti Vaso #16 oz X25', 14.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-vaso-16.png'),
    (535, 5, N'Inti Vaso #4 oz X25', 9.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2023/06/inti-vaso-4-01.jpg'),
    (536, 5, N'Inti Vaso #8 oz X25', 11.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2022/12/thumb-inti-vaso-8.png'),
    (537, 5, N'Removedores de bebidas 140', 7.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2021/11/Removedor-thumn.png'),
    (538, 5, N'Removedores de bebidas 178', 8.90, 20, N'https://www.fopesa.com.pe/wp-content/uploads/2021/11/Removedor-170-thumb.png')
) AS source (id_producto, id_categoria, nombre, precio, stock, imagen)
WHERE NOT EXISTS (
    SELECT 1 FROM PRODUCTO AS target WHERE target.id_producto = source.id_producto
);

INSERT INTO MODALIDAD_ENTREGA (id_modalidad, nombre, descripcion, costo)
SELECT source.id_modalidad, source.nombre, source.descripcion, source.costo
FROM (VALUES
    (9001, N'Recojo en tienda', N'Recojo del pedido en el punto de atención.', 0.00),
    (9002, N'Delivery', N'Entrega del pedido en la dirección indicada.', 8.00)
) AS source (id_modalidad, nombre, descripcion, costo)
WHERE NOT EXISTS (
    SELECT 1 FROM MODALIDAD_ENTREGA AS target WHERE target.id_modalidad = source.id_modalidad
);

INSERT INTO CLIENTE (id_cliente, nombre, apellido, email, telefono, direccion)
SELECT 9001, N'Cliente', N'De Prueba', N'cliente.prueba@example.com', N'999999999', N'Av. Ejemplo 123'
WHERE NOT EXISTS (SELECT 1 FROM CLIENTE WHERE id_cliente = 9001);

INSERT INTO PEDIDO (id_pedido, id_cliente, id_modalidad, fecha_pedido, total, estado)
SELECT 9001, 9001, 9001, GETDATE(), 3.00, N'Recibido'
WHERE NOT EXISTS (SELECT 1 FROM PEDIDO WHERE id_pedido = 9001);

INSERT INTO DETALLE_PEDIDO (id_detalle, id_producto, id_pedido, cantidad, precio_unit, subtotal)
SELECT 9001, 101, 9001, 2, 1.50, 3.00
WHERE NOT EXISTS (SELECT 1 FROM DETALLE_PEDIDO WHERE id_detalle = 9001);

INSERT INTO PROMOCION
    (id_prom, id_producto, nombre, descuento, descripcion, fecha_inicio, fecha_fin, estado)
SELECT source.id_prom, source.id_producto, source.nombre, source.descuento,
       source.descripcion, source.fecha_inicio, source.fecha_fin, 1
FROM (VALUES
    (9001, 204, N'Parrilla lista para compartir', 10.00, N'Carbón Arizona 5KG a precio especial.', CONVERT(date, '20260101'), CONVERT(date, '20261231')),
    (9002, 305, N'Sabor que rinde', 10.00, N'Pack Parrillero Electrónico.', CONVERT(date, '20260101'), CONVERT(date, '20261231')),
    (9003, 501, N'Mesa práctica', 10.00, N'Cubiertos de madera x50.', CONVERT(date, '20260101'), CONVERT(date, '20261231')),
    (9004, 104, N'El esencial del hogar', 10.00, N'Fósforos familiar 200 luces Inti.', CONVERT(date, '20260101'), CONVERT(date, '20261231'))
) AS source (id_prom, id_producto, nombre, descuento, descripcion, fecha_inicio, fecha_fin)
WHERE NOT EXISTS (
    SELECT 1 FROM PROMOCION AS target WHERE target.id_prom = source.id_prom
);

COMMIT TRANSACTION;

-- Verifica que los IDs usados por el catálogo Angular existan y muestra su stock.
SELECT id_producto, nombre, stock, estado
FROM PRODUCTO
WHERE id_producto BETWEEN 101 AND 105
   OR id_producto BETWEEN 201 AND 212
   OR id_producto BETWEEN 301 AND 305
   OR id_producto = 401
   OR id_producto BETWEEN 501 AND 538
ORDER BY id_producto;