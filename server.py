"""Vista local de la web; ejecutar con python3 server.py."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import argparse
from functools import partial

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Vista local de Element Fight')
    parser.add_argument('--port', type=int, default=4173)
    args = parser.parse_args()
    folder = Path(__file__).resolve().parent
    server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(SimpleHTTPRequestHandler, directory=str(folder)))
    print(f'Local: http://127.0.0.1:{args.port}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
