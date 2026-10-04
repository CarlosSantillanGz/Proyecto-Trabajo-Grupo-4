import json
import os
import re
import base64
from urllib.parse import parse_qs


def _response(status_code, payload):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": os.getenv("CORS_ALLOW_ORIGIN", "*"),
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
    body = event.get("body") or "{}"
    if event.get("isBase64Encoded"):
        body = base64.b64decode(body).decode("utf-8")
    if isinstance(body, str):
        body = json.loads(body)
    if not isinstance(body, dict):
        raise ValueError("El cuerpo debe ser un objeto JSON")

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


def lambda_handler(event, context):
    request_context = event.get("requestContext", {})
    method = request_context.get("http", {}).get("method") or event.get("httpMethod", "GET")
    if method == "OPTIONS":
        response = _response(204, {})
        response["body"] = ""
        return response
    path = event.get("rawPath") or event.get("path") or ""
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