import json
import os
import re
import base64
from datetime import datetime
from decimal import Decimal
from urllib.parse import parse_qs

ORDER_STATES = ("Recibido", "Confirmado", "Listo", "Entregado")
DELIVERY_NAMES = {"pickup": "Recojo en tienda", "delivery": "Delivery"}


class ApiError(Exception):
    def __init__(self, status_code, message):
        super().__init__(message)
        self.status_code = status_code


def _parse_json_body(event):
    body = event.get("body") or "{}"
    if event.get("isBase64Encoded"):
        body = base64.b64decode(body).decode("utf-8")
    if isinstance(body, str):
        body = json.loads(body)
    if not isinstance(body, dict):
        raise ValueError("El cuerpo debe ser un objeto JSON")
    return body


def _response(status_code, payload):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": os.getenv("CORS_ALLOW_ORIGIN", "*"),
            "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps(payload, ensure_ascii=False),
    }


def _fetch_product(product_id):
    connection_string = os.getenv("FOPESA_DB_CONNECTION_STRING")
    if not connection_string:
        raise RuntimeError("FOPESA_DB_CONNECTION_STRING is not configured")

    import pyodbc

    connection = pyodbc.connect(connection_string, timeout=5)
    try:
        cursor = connection.cursor()
        try:
            cursor.execute(
                "SELECT stock, estado FROM PRODUCTO WHERE id_producto = ?",
                product_id,
            )
            row = cursor.fetchone()
            if row is None:
                return None
            return {"stock": int(row[0]), "estado": bool(row[1])}
        finally:
            cursor.close()
    finally:
        connection.close()


def _register_customer(customer):
    connection_string = os.getenv("FOPESA_DB_CONNECTION_STRING")
    if not connection_string:
        raise RuntimeError("FOPESA_DB_CONNECTION_STRING is not configured")

    import pyodbc

    connection = pyodbc.connect(connection_string, timeout=5)
    try:
        cursor = connection.cursor()
        try:
            cursor.execute("SET XACT_ABORT ON; SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;")
            cursor.execute(
                "SELECT id_cliente FROM CLIENTE WITH (TABLOCKX, HOLDLOCK) WHERE LOWER(email) = ?",
                customer["email"],
            )
            existing = cursor.fetchone()
            if existing:
                customer_id = int(existing[0])
                cursor.execute(
                    "UPDATE CLIENTE SET nombre = ?, apellido = ?, telefono = ?, direccion = ? "
                    "WHERE id_cliente = ?",
                    customer["nombre"],
                    customer["apellido"],
                    customer["telefono"],
                    customer["direccion"],
                    customer_id,
                )
                created = False
            else:
                cursor.execute(
                    "SELECT ISNULL(MAX(id_cliente), 0) + 1 FROM CLIENTE WITH (TABLOCKX, HOLDLOCK)"
                )
                customer_id = int(cursor.fetchone()[0])
                cursor.execute(
                    "INSERT INTO CLIENTE "
                    "(id_cliente, nombre, apellido, email, telefono, direccion) "
                    "VALUES (?, ?, ?, ?, ?, ?)",
                    customer_id,
                    customer["nombre"],
                    customer["apellido"],
                    customer["email"],
                    customer["telefono"],
                    customer["direccion"],
                )
                created = True
            connection.commit()
            return {"idCliente": customer_id, "created": created}
        except Exception:
            connection.rollback()
            raise
        finally:
            cursor.close()
    finally:
        connection.close()


def _parse_customer(event):
    body = _parse_json_body(event)

    customer = {
        "nombre": str(body.get("nombre", "")).strip(),
        "apellido": str(body.get("apellido", "")).strip(),
        "email": str(body.get("email", "")).strip().lower(),
        "telefono": str(body.get("telefono", "")).strip(),
        "direccion": str(body.get("direccion", "")).strip() or None,
    }
    if not customer["nombre"] or not customer["apellido"]:
        raise ValueError("Ingresa tus nombres y apellidos")
    if len(customer["nombre"]) > 100 or len(customer["apellido"]) > 100:
        raise ValueError("El nombre y el apellido admiten hasta 100 caracteres")
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", customer["email"]):
        raise ValueError("Ingresa un correo electrónico válido")
    if len(customer["email"]) > 150:
        raise ValueError("El correo admite hasta 150 caracteres")
    if not re.fullmatch(r"[0-9+()\s-]{6,20}", customer["telefono"]):
        raise ValueError("Ingresa un teléfono válido de 6 a 20 caracteres")
    if customer["direccion"] and len(customer["direccion"]) > 255:
        raise ValueError("La dirección admite hasta 255 caracteres")
    return customer


def _parse_order(event):
    body = _parse_json_body(event)
    try:
        customer_id = int(body.get("idCliente"))
    except (TypeError, ValueError):
        raise ValueError("El cliente no es válido")
    if customer_id < 1:
        raise ValueError("El cliente no es válido")

    items = body.get("items")
    if not isinstance(items, list) or not items or len(items) > 50:
        raise ValueError("El pedido debe incluir entre 1 y 50 productos")

    parsed_items = []
    product_ids = set()
    for item in items:
        if not isinstance(item, dict):
            raise ValueError("Cada producto del pedido debe ser válido")
        try:
            product_id = int(item.get("idProducto"))
            quantity = int(item.get("cantidad"))
        except (TypeError, ValueError):
            raise ValueError("El producto y la cantidad deben ser enteros")
        if product_id < 1 or quantity < 1:
            raise ValueError("El producto y la cantidad deben ser positivos")
        if product_id in product_ids:
            raise ValueError("No repitas productos en el pedido")
        product_ids.add(product_id)
        parsed_items.append({"idProducto": product_id, "cantidad": quantity})

    delivery = body.get("modalidad")
    if not isinstance(delivery, str) or delivery not in DELIVERY_NAMES:
        raise ValueError("La modalidad de entrega no es válida")
    return {
        "idCliente": customer_id,
        "items": parsed_items,
        "modalidad": delivery,
    }


def _connect_database():
    connection_string = os.getenv("FOPESA_DB_CONNECTION_STRING")
    if not connection_string:
        raise RuntimeError("FOPESA_DB_CONNECTION_STRING is not configured")
    import pyodbc
    return pyodbc.connect(connection_string, timeout=5)


def _create_order(order):
    connection = _connect_database()
    try:
        cursor = connection.cursor()
        try:
            cursor.execute("SET XACT_ABORT ON; SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;")
            cursor.execute(
                "SELECT id_cliente FROM CLIENTE WITH (UPDLOCK, HOLDLOCK) WHERE id_cliente = ?",
                order["idCliente"],
            )
            if cursor.fetchone() is None:
                raise ApiError(404, "No se encontró el cliente del pedido")

            cursor.execute(
                "SELECT id_modalidad, costo FROM MODALIDAD_ENTREGA WITH (HOLDLOCK) WHERE nombre = ?",
                DELIVERY_NAMES[order["modalidad"]],
            )
            delivery_row = cursor.fetchone()
            if delivery_row is None:
                raise ApiError(409, "La modalidad de entrega no está configurada en la base de datos")
            delivery_id = int(delivery_row[0])
            delivery_cost = Decimal(str(delivery_row[1]))

            lines = []
            subtotal = Decimal("0")
            for requested in order["items"]:
                cursor.execute(
                    "SELECT id_producto, nombre, precio, imagen, stock "
                    "FROM PRODUCTO WITH (UPDLOCK, HOLDLOCK) "
                    "WHERE id_producto = ? AND estado = 1",
                    requested["idProducto"],
                )
                product = cursor.fetchone()
                if product is None:
                    raise ApiError(404, "Uno de los productos no existe o está inactivo")
                stock = int(product[4])
                quantity = requested["cantidad"]
                if stock < quantity:
                    raise ApiError(
                        409,
                        "Stock insuficiente para %s: disponibles %s, solicitados %s"
                        % (product[1], stock, quantity),
                    )
                price = Decimal(str(product[2]))
                line_total = price * quantity
                lines.append({
                    "idProducto": int(product[0]),
                    "nombre": str(product[1]),
                    "precio": price,
                    "imagen": str(product[3] or ""),
                    "cantidad": quantity,
                    "subtotal": line_total,
                })
                subtotal += line_total

            total = subtotal + delivery_cost
            for line in lines:
                cursor.execute(
                    "UPDATE PRODUCTO SET stock = stock - ? "
                    "WHERE id_producto = ? AND estado = 1 AND stock >= ?",
                    line["cantidad"],
                    line["idProducto"],
                    line["cantidad"],
                )
                if cursor.rowcount != 1:
                    raise ApiError(409, "El stock cambió mientras se procesaba el pedido; inténtalo nuevamente")

            cursor.execute(
                "SELECT ISNULL(MAX(id_pedido), 0) + 1 FROM PEDIDO WITH (TABLOCKX, HOLDLOCK)"
            )
            order_id = int(cursor.fetchone()[0])
            cursor.execute(
                "INSERT INTO PEDIDO "
                "(id_pedido, id_cliente, id_modalidad, fecha_pedido, total, estado) "
                "VALUES (?, ?, ?, GETDATE(), ?, ?)",
                order_id,
                order["idCliente"],
                delivery_id,
                total,
                ORDER_STATES[0],
            )
            cursor.execute(
                "SELECT ISNULL(MAX(id_detalle), 0) + 1 "
                "FROM DETALLE_PEDIDO WITH (TABLOCKX, HOLDLOCK)"
            )
            detail_id = int(cursor.fetchone()[0])
            for line in lines:
                cursor.execute(
                    "INSERT INTO DETALLE_PEDIDO "
                    "(id_detalle, id_producto, id_pedido, cantidad, precio_unit, subtotal) "
                    "VALUES (?, ?, ?, ?, ?, ?)",
                    detail_id,
                    line["idProducto"],
                    order_id,
                    line["cantidad"],
                    line["precio"],
                    line["subtotal"],
                )
                detail_id += 1
            connection.commit()
            return {
                "idPedido": "FOP-%06d" % order_id,
                "fecha": datetime.now().isoformat(),
                "estado": ORDER_STATES[0],
                "total": float(total),
                "items": [
                    {
                        "idProducto": line["idProducto"],
                        "nombre": line["nombre"],
                        "precio": float(line["precio"]),
                        "imagen": line["imagen"],
                        "cantidad": line["cantidad"],
                        "subtotal": float(line["subtotal"]),
                    }
                    for line in lines
                ],
                "modalidad": order["modalidad"],
            }
        except Exception:
            connection.rollback()
            raise
        finally:
            cursor.close()
    finally:
        connection.close()


def _update_order_status(order_id, state):
    if state not in ORDER_STATES:
        raise ApiError(400, "El estado del pedido no es válido")
    connection = _connect_database()
    try:
        cursor = connection.cursor()
        try:
            cursor.execute("SET XACT_ABORT ON; SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;")
            cursor.execute(
                "SELECT estado FROM PEDIDO WITH (UPDLOCK, HOLDLOCK) WHERE id_pedido = ?",
                order_id,
            )
            row = cursor.fetchone()
            if row is None:
                raise ApiError(404, "No se encontró el pedido")
            current_state = str(row[0])
            if current_state not in ORDER_STATES:
                raise ApiError(409, "El pedido tiene un estado que no admite actualizaciones")
            if ORDER_STATES.index(state) != ORDER_STATES.index(current_state) + 1:
                raise ApiError(409, "El pedido solo puede avanzar al siguiente estado")
            cursor.execute(
                "UPDATE PEDIDO SET estado = ? WHERE id_pedido = ?",
                state,
                order_id,
            )
            connection.commit()
            return {"idPedido": "FOP-%06d" % order_id, "estado": state}
        except Exception:
            connection.rollback()
            raise
        finally:
            cursor.close()
    finally:
        connection.close()


def _get_order(order_id, contact):
    if not contact:
        raise ApiError(400, "Indica el correo o teléfono usado en el pedido")
    connection = _connect_database()
    try:
        cursor = connection.cursor()
        try:
            cursor.execute(
                "SELECT p.id_pedido, p.fecha_pedido, p.total, p.estado, "
                "c.nombre, c.apellido, c.email, c.telefono, c.direccion, "
                "m.nombre, m.costo "
                "FROM PEDIDO p "
                "JOIN CLIENTE c ON c.id_cliente = p.id_cliente "
                "JOIN MODALIDAD_ENTREGA m ON m.id_modalidad = p.id_modalidad "
                "WHERE p.id_pedido = ? AND "
                "(LOWER(c.email) = ? OR c.telefono = ?)",
                order_id,
                contact.lower(),
                contact,
            )
            row = cursor.fetchone()
            if row is None:
                raise ApiError(404, "No se encontró un pedido con esos datos")
            cursor.execute(
                "SELECT d.id_producto, pr.nombre, pr.imagen, d.cantidad, "
                "d.precio_unit, d.subtotal "
                "FROM DETALLE_PEDIDO d JOIN PRODUCTO pr ON pr.id_producto = d.id_producto "
                "WHERE d.id_pedido = ?",
                order_id,
            )
            items = [
                {
                    "idProducto": int(line[0]),
                    "nombre": str(line[1]),
                    "imagen": str(line[2] or ""),
                    "cantidad": int(line[3]),
                    "precio": float(line[4]),
                    "subtotal": float(line[5]),
                }
                for line in cursor.fetchall()
            ]
            return {
                "idPedido": "FOP-%06d" % int(row[0]),
                "fecha": row[1].isoformat() if hasattr(row[1], "isoformat") else str(row[1]),
                "total": float(row[2]),
                "estado": str(row[3]),
                "cliente": {
                    "nombre": str(row[4]),
                    "apellido": str(row[5]),
                    "email": str(row[6]),
                    "telefono": str(row[7]),
                    "direccion": str(row[8] or ""),
                },
                "modalidad": str(row[9]),
                "costoEntrega": float(row[10]),
                "items": items,
            }
        finally:
            cursor.close()
    finally:
        connection.close()


def lambda_handler(event, context):
    request_context = event.get("requestContext", {})
    method = request_context.get("http", {}).get("method") or event.get("httpMethod", "GET")
    if method == "OPTIONS":
        response = _response(204, {})
        response["body"] = ""
        return response
    path = event.get("rawPath") or event.get("path") or ""
    try:
        if method == "POST" and path == "/pedidos":
            order = _parse_order(event)
            return _response(201, _create_order(order))

        status_match = re.fullmatch(r"/pedidos/(\d+)/estado", path)
        if method == "PATCH" and status_match:
            body = _parse_json_body(event)
            state = body.get("estado")
            if not isinstance(state, str):
                raise ValueError("Indica el nuevo estado del pedido")
            return _response(200, _update_order_status(int(status_match.group(1)), state))

        order_match = re.fullmatch(r"/pedidos/(\d+)", path)
        if method == "GET" and order_match:
            query = event.get("queryStringParameters") or {}
            if not query and event.get("rawQueryString"):
                query = {key: values[-1] for key, values in parse_qs(event["rawQueryString"]).items()}
            return _response(
                200,
                _get_order(int(order_match.group(1)), str(query.get("contacto", "")).strip()),
            )
    except json.JSONDecodeError:
        return _response(400, {"mensaje": "El cuerpo debe contener JSON válido"})
    except (ValueError, UnicodeDecodeError) as error:
        return _response(400, {"mensaje": str(error)})
    except ApiError as error:
        return _response(error.status_code, {"mensaje": str(error)})
    except RuntimeError:
        return _response(500, {"mensaje": "La conexión a la base de datos no está configurada"})
    except Exception:
        return _response(503, {"mensaje": "No se pudo procesar el pedido"})

    if method == "POST" and path == "/clientes":
        try:
            customer = _parse_customer(event)
        except json.JSONDecodeError:
            return _response(400, {"mensaje": "El cuerpo debe contener JSON válido"})
        except (ValueError, UnicodeDecodeError) as error:
            return _response(400, {"mensaje": str(error)})

        try:
            result = _register_customer(customer)
        except RuntimeError:
            return _response(500, {"mensaje": "La conexión a la base de datos no está configurada"})
        except Exception:
            return _response(503, {"mensaje": "No se pudo registrar el cliente"})

        return _response(201 if result["created"] else 200, result)

    if method != "GET":
        return _response(405, {"mensaje": "Método no permitido"})

    match = re.fullmatch(r"/productos/(\d+)/disponibilidad", path)
    if not match:
        return _response(404, {"mensaje": "Endpoint no encontrado"})

    product_id = int(match.group(1))
    query = event.get("queryStringParameters") or {}
    if not query and event.get("rawQueryString"):
        query = {key: values[-1] for key, values in parse_qs(event["rawQueryString"]).items()}

    try:
        quantity = int(query.get("cantidad", "1"))
    except (TypeError, ValueError):
        return _response(400, {"mensaje": "La cantidad debe ser un entero positivo"})
    if quantity < 1:
        return _response(400, {"mensaje": "La cantidad debe ser un entero positivo"})

    try:
        product = _fetch_product(product_id)
    except RuntimeError:
        return _response(500, {"mensaje": "La conexión a la base de datos no está configurada"})
    except Exception:
        return _response(503, {"mensaje": "No se pudo consultar el inventario"})

    if product is None or not product["estado"]:
        return _response(404, {"mensaje": "Producto no encontrado o inactivo"})

    stock = max(0, product["stock"])
    return _response(
        200,
        {
            "idProducto": product_id,
            "stock": stock,
            "disponible": stock > 0,
            "cantidadSolicitada": quantity,
            "puedeAtender": stock > 0 and quantity <= stock,
        },
    )