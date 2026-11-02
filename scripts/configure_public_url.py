"""Set the actual deployment URL before publishing: python3 scripts/configure_public_url.py https://your-domain/"""
from pathlib import Path
from urllib.parse import urlsplit, urljoin
from xml.etree.ElementTree import Element, SubElement, tostring
import argparse, re
WEB = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description='Configura URLs SEO para el alojamiento real')
parser.add_argument('url', help='URL HTTPS pública del sitio, incluida la subcarpeta si corresponde')
args = parser.parse_args()
url = args.url.rstrip('/')+'/'
parsed = urlsplit(url)
if parsed.scheme != 'https' or not parsed.hostname or parsed.query or parsed.fragment or parsed.username:
    parser.error('Usa una URL pública HTTPS sin credenciales, query ni fragmento.')
index = WEB/'index.html'
html = index.read_text()
html = re.sub(r'\s*<link rel="canonical"[^>]*>', '', html)
html = re.sub(r'\s*<meta property="og:url"[^>]*>', '', html)
from html import escape
html = html.replace('</head>', f'  <link rel="canonical" href="{escape(url, quote=True)}">\n  <meta property="og:url" content="{escape(url, quote=True)}">\n</head>')
for attr in ('property="og:image"', 'name="twitter:image"'):
    html = re.sub(r'(<meta '+attr+r' content=")[^"]+', lambda m: m[1]+escape(urljoin(url,'assets/hero-ensemble.webp'),quote=True),html)
index.write_text(html)
root = Element('urlset', xmlns='http://www.sitemaps.org/schemas/sitemap/0.9', attrib={'xmlns:image':'http://www.google.com/schemas/sitemap-image/1.1'})
page = SubElement(root, 'url'); SubElement(page,'loc').text=url
for path in sorted((WEB/'assets').glob('*.webp')):
    image = SubElement(page,'image:image')
    SubElement(image,'image:loc').text = urljoin(url, path.relative_to(WEB).as_posix())
for slug in ('privacidad', 'soporte', 'datos', 'terminos', 'descargar', 'creditos'):
    entry = SubElement(root, 'url'); SubElement(entry, 'loc').text = urljoin(url, slug+'/')
(WEB/'sitemap.xml').write_bytes(b'<?xml version="1.0" encoding="UTF-8"?>\n'+tostring(root,encoding='utf-8'))
(WEB/'robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {urljoin(url,"sitemap.xml")}\n')
print(f'Canonical, social images, sitemap and robots configured for {url}')
