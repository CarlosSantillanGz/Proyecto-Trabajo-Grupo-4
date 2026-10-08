import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlsplit

from lambda_function import lambda_handler


class AvailabilityHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self._handle_request()

    def do_GET(self):
        self._handle_request()

    def do_POST(self):
        self._handle_request()

    def do_PATCH(self):
        self._handle_request()

    def _handle_request(self):
        parsed_url = urlsplit(self.path)
        query = {
            key: values[-1]
            for key, values in parse_qs(parsed_url.query).items()
        }
        body = ""
        if self.command == "POST":
            content_length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(content_length).decode("utf-8")

        result = lambda_handler(
            {
                "rawPath": parsed_url.path,
                "rawQueryString": parsed_url.query,
                "queryStringParameters": query,
                "body": body,
                "requestContext": {"http": {"method": self.command}},
            },
            None,
        )

        body = result["body"].encode("utf-8")
        self.send_response(result["statusCode"])
        for name, value in result["headers"].items():
            self.send_header(name, value)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if body:
            self.wfile.write(body)

    def log_message(self, format_string, *args):
        print("%s - %s" % (self.address_string(), format_string % args))


if __name__ == "__main__":
    host = os.getenv("LOCAL_API_HOST", "127.0.0.1")
    port = int(os.getenv("LOCAL_API_PORT", "8000"))
    server = HTTPServer((host, port), AvailabilityHandler)
    print("Inventory API listening on http://%s:%s" % (host, port))
    server.serve_forever()