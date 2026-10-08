import json
import unittest
from unittest.mock import patch

from lambda_function import ApiError, lambda_handler


def api_event(product_id="27", quantity="1", method="GET"):
    return {
        "rawPath": "/productos/%s/disponibilidad" % product_id,
        "queryStringParameters": {"cantidad": quantity},
        "requestContext": {"http": {"method": method}},
    }


def customer_event(body, method="POST"):
    return {
        "rawPath": "/clientes",
        "body": json.dumps(body),
        "requestContext": {"http": {"method": method}},
    }


def order_event(path, body=None, method="POST", query=None):
    return {
        "rawPath": path,
        "body": json.dumps(body) if body is not None else "",
        "queryStringParameters": query or {},
        "requestContext": {"http": {"method": method}},
    }


class AvailabilityHandlerTests(unittest.TestCase):
    @patch("lambda_function._fetch_product", return_value={"stock": 4, "estado": True})
    def test_reports_available_stock_and_accepts_requested_quantity(self, fetch_product):
        response = lambda_handler(api_event(quantity="3"), None)

        self.assertEqual(response["statusCode"], 200)
        self.assertEqual(
            json.loads(response["body"]),
            {
                "idProducto": 27,
                "stock": 4,
                "disponible": True,
                "cantidadSolicitada": 3,
                "puedeAtender": True,
            },
        )
        fetch_product.assert_called_once_with(27)

    @patch("lambda_function._fetch_product", return_value={"stock": 2, "estado": True})
    def test_rejects_quantity_above_stock(self, _fetch_product):
        response = lambda_handler(api_event(quantity="3"), None)

        self.assertFalse(json.loads(response["body"])["puedeAtender"])

    @patch("lambda_function._fetch_product", return_value={"stock": 0, "estado": True})
    def test_reports_zero_stock_as_unavailable(self, _fetch_product):
        response = lambda_handler(api_event(), None)
        payload = json.loads(response["body"])

        self.assertFalse(payload["disponible"])
        self.assertFalse(payload["puedeAtender"])

    def test_rejects_non_positive_or_invalid_quantity(self):
        for quantity in ("0", "abc"):
            with self.subTest(quantity=quantity):
                response = lambda_handler(api_event(quantity=quantity), None)
                self.assertEqual(response["statusCode"], 400)

    @patch("lambda_function._fetch_product", return_value=None)
    def test_returns_not_found_for_unknown_product(self, _fetch_product):
        response = lambda_handler(api_event(), None)

        self.assertEqual(response["statusCode"], 404)


class CustomerRegistrationHandlerTests(unittest.TestCase):
    customer = {
        "nombre": "Ana María",
        "apellido": "Pérez Ruiz",
        "email": "ana@example.com",
        "telefono": "999 888 777",
        "direccion": "Av. Central 123",
    }

    @patch("lambda_function._register_customer", return_value={"idCliente": 12, "created": True})
    def test_registers_valid_customer(self, register_customer):
        response = lambda_handler(customer_event(self.customer), None)

        self.assertEqual(response["statusCode"], 201)
        self.assertEqual(json.loads(response["body"])["idCliente"], 12)
        register_customer.assert_called_once_with(self.customer)

    @patch("lambda_function._register_customer")
    def test_rejects_missing_required_customer_fields(self, register_customer):
        response = lambda_handler(customer_event({"nombre": "Ana"}), None)

        self.assertEqual(response["statusCode"], 400)
        self.assertIn("nombres y apellidos", json.loads(response["body"])["mensaje"])
        register_customer.assert_not_called()

    @patch("lambda_function._register_customer")
    def test_rejects_invalid_email_and_phone(self, register_customer):
        for field, value in (("email", "not-an-email"), ("telefono", "12")):
            with self.subTest(field=field):
                customer = dict(self.customer)
                customer[field] = value
                response = lambda_handler(customer_event(customer), None)
                self.assertEqual(response["statusCode"], 400)
        register_customer.assert_not_called()

    @patch("lambda_function._register_customer", return_value={"idCliente": 12, "created": False})
    def test_returns_ok_when_customer_email_already_exists(self, _register_customer):
        response = lambda_handler(customer_event(self.customer), None)

        self.assertEqual(response["statusCode"], 200)
        self.assertFalse(json.loads(response["body"])["created"])


class OrderHandlerTests(unittest.TestCase):
    order = {
        "idCliente": 12,
        "items": [{"idProducto": 101, "cantidad": 2}],
        "modalidad": "pickup",
    }

    @patch(
        "lambda_function._create_order",
        return_value={
            "idPedido": "FOP-000901",
            "fecha": "2026-10-08T12:00:00",
            "estado": "Recibido",
            "total": 3.0,
            "items": [],
            "modalidad": "pickup",
        },
    )
    def test_creates_order(self, create_order):
        response = lambda_handler(order_event("/pedidos", self.order), None)

        self.assertEqual(response["statusCode"], 201)
        self.assertEqual(json.loads(response["body"])["estado"], "Recibido")
        create_order.assert_called_once_with(self.order)

    @patch("lambda_function._create_order")
    def test_rejects_invalid_order_before_database_access(self, create_order):
        invalid = dict(self.order, items=[{"idProducto": 101, "cantidad": 0}])
        response = lambda_handler(order_event("/pedidos", invalid), None)

        self.assertEqual(response["statusCode"], 400)
        create_order.assert_not_called()

    @patch("lambda_function._create_order", side_effect=ApiError(409, "Stock insuficiente"))
    def test_returns_conflict_when_stock_is_insufficient(self, _create_order):
        response = lambda_handler(order_event("/pedidos", self.order), None)

        self.assertEqual(response["statusCode"], 409)
        self.assertEqual(json.loads(response["body"])["mensaje"], "Stock insuficiente")

    @patch(
        "lambda_function._update_order_status",
        return_value={"idPedido": "FOP-000901", "estado": "Confirmado"},
    )
    def test_updates_order_status(self, update_status):
        response = lambda_handler(
            order_event("/pedidos/901/estado", {"estado": "Confirmado"}, "PATCH"),
            None,
        )

        self.assertEqual(response["statusCode"], 200)
        update_status.assert_called_once_with(901, "Confirmado")

    @patch(
        "lambda_function._get_order",
        return_value={"idPedido": "FOP-000901", "estado": "Recibido"},
    )
    def test_gets_order_using_contact(self, get_order):
        response = lambda_handler(
            order_event("/pedidos/901", method="GET", query={"contacto": "ana@example.com"}),
            None,
        )

        self.assertEqual(response["statusCode"], 200)
        get_order.assert_called_once_with(901, "ana@example.com")


if __name__ == "__main__":
    unittest.main()