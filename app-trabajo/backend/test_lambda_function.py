import json
import unittest
from unittest.mock import patch

from lambda_function import lambda_handler


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


if __name__ == "__main__":
    unittest.main()