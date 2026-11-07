// POST /api/files?kind=spick|bild&name=datei.pdf   Datei hochladen (Rohdaten im Body)
// GET  /api/files?path=spick/…                       Datei ansehen (kurzlebiger Link)
import crypto from 'node:crypto';
import { send, fail, requireSession, readRaw, sb, storageBase, validPath, httpError, BUCKET } from './_lib.js';

const TYPES = {
  spick: ['application/pdf', 'image/png', 'image/jpeg'],
  bild: ['image/jpeg', 'image/png', 'image/webp'],
};
const EXT = { 'application/pdf': 'pdf', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

export default async function handler(req, res) {
  try {
    requireSession(req);
    const q = new URL(req.url, 'http://x').searchParams;

    if (req.method === 'GET') {
      const path = q.get('path');
      if (!validPath(path)) throw httpError(400, 'Unbekannte Datei.');
      const signed = await sb(`/storage/v1/object/sign/${BUCKET}/${path}`, { method: 'POST', body: { expiresIn: 3600 } });
      const link = signed.signedURL || signed.signedUrl;
      if (!link) throw httpError(404, 'Datei nicht gefunden.');
      res.statusCode = 302;
      res.setHeader('Location', storageBase() + link);
      res.setHeader('Cache-Control', 'private, max-age=600');
      return res.end();
    }

    if (req.method === 'POST') {
      const kind = q.get('kind');
      const type = String(req.headers['content-type'] || '').split(';')[0].trim();
      if (!TYPES[kind]) throw httpError(400, 'Unbekannte Dateiart.');
      if (!TYPES[kind].includes(type)) {
        throw httpError(415, kind === 'spick' ? 'Spickzettel bitte als PDF, PNG oder JPG.' : 'Bilder bitte als JPG, PNG oder WebP.');
      }
      const body = await readRaw(req, 4 * 1024 * 1024);
      if (!body.length) throw httpError(400, 'Die Datei ist leer.');
      const path = `${kind}/${crypto.randomUUID()}.${EXT[type]}`;
      await sb(`/storage/v1/object/${BUCKET}/${path}`, {
        method: 'POST', raw: true, body,
        headers: { 'Content-Type': type, 'x-upsert': 'false' },
      });
      const name = String(q.get('name') || '').slice(0, 160);
      return send(res, 201, { path, name });
    }

    throw httpError(405, 'Nicht erlaubt.');
  } catch (e) { fail(res, e); }
}
