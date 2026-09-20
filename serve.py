#!/usr/bin/env python3
"""Local-only launcher. No installation or internet connection required."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import argparse
import webbrowser

parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=8765)
parser.add_argument('--no-open', action='store_true')
args = parser.parse_args()
class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

handler = partial(PreviewHandler, directory=str(Path(__file__).resolve().parent))
server = ThreadingHTTPServer(('127.0.0.1', args.port), handler)
url = f'http://127.0.0.1:{args.port}'
print(f'打極投絞 · 酒馆试玩: {url}  (Ctrl+C 停止)', flush=True)
if not args.no_open:
    webbrowser.open(url)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
