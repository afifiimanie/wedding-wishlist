import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

API_PATH = "/api/wishlist"
DATA_FILE = os.path.join(os.path.dirname(__file__), "wishlist-statuses.json")


def load_statuses():
    if not os.path.exists(DATA_FILE):
        return {}

    try:
        with open(DATA_FILE, "r", encoding="utf-8") as file:
            data = json.load(file)
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def save_statuses(statuses):
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(statuses, file, indent=2)


class WishlistHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path != API_PATH:
            self.send_json(404, {"error": "Not found"})
            return

        self.send_json(200, load_statuses())

    def do_PUT(self):
        parsed = urlparse(self.path)

        if parsed.path != API_PATH:
            self.send_json(404, {"error": "Not found"})
            return

        content_length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body.decode("utf-8"))
        except Exception:
            self.send_json(400, {"error": "Invalid JSON body"})
            return

        if not isinstance(data, dict):
            self.send_json(400, {"error": "Body must be a JSON object"})
            return

        save_statuses(data)
        self.send_json(200, {"ok": True})

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, PUT, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def send_json(self, status_code, payload):
        body = json.dumps(payload).encode("utf-8")

        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, PUT, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", 5000), WishlistHandler)
    print("Wishlist API running on http://localhost:5000")
    server.serve_forever()
