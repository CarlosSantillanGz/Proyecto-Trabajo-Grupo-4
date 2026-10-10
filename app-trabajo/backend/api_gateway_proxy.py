import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


UPSTREAM_BASE_URL = os.getenv(
    "API_GATEWAY_BASE_URL",
    "https://gysn1n5a51.execute-api.us-east-1.amazonaws.com/v1",
).rstrip("/")
ALLOWED_ORIGIN = os.getenv("CORS_ALLOW_ORIGIN", "http://localhost:4200")
UPSTREAM_TIMEOUT = float(os.getenv("UPSTREAM_TIMEOUT_SECONDS", "20"))


class ApiGatewayProxyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self._send_cors_preflight()

    def do_GET(self):
        self._forward_request()

    def do_POST(self):
        self._forward_request()

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _send_cors_preflight(self):
        self.send_response(204)
        self._send_cors_headers()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def _forward_request(self):
        target_url = UPSTREAM_BASE_URL + self.path
        content_length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(content_length) if content_length else None
        headers = {}
        if self.headers.get("Content-Type"):
            headers["Content-Type"] = self.headers["Content-Type"]
        if self.headers.get("Accept"):
            headers["Accept"] = self.headers["Accept"]

        request = Request(target_url, data=body, headers=headers, method=self.command)
        try:
            with urlopen(request, timeout=UPSTREAM_TIMEOUT) as upstream_response:
                status = upstream_response.status
                response_body = upstream_response.read()
                content_type = upstream_response.headers.get("Content-Type")
        except HTTPError as error:
            status = error.code
            response_body = error.read()
            content_type = error.headers.get("Content-Type")
        except (URLError, TimeoutError) as error:
            reason = getattr(error, "reason", error)
            response_body = str(reason).encode("utf-8", errors="replace")
            status = 502
            content_type = "text/plain; charset=utf-8"

        print("%s %s -> %s" % (self.command, self.path, status), flush=True)
        self.send_response(status)
        if content_type:
            self.send_header("Content-Type", content_type)
        self._send_cors_headers()
        self.send_header("Content-Length", str(len(response_body)))
        self.end_headers()
        self.wfile.write(response_body)

    def log_message(self, format_string, *args):
        pass


if __name__ == "__main__":
    host = os.getenv("LOCAL_API_HOST", "127.0.0.1")
    port = int(os.getenv("LOCAL_API_PORT", "8001"))
    server = HTTPServer((host, port), ApiGatewayProxyHandler)
    print("API Gateway proxy listening on http://%s:%s" % (host, port), flush=True)
    server.serve_forever()