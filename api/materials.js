import { send, fail, readJson, requireSession, sb, cleanMaterial, validId, removeFiles, filePathsOf, httpError } from './_lib.js';

const TABLE = '/rest/v1/materials';

export default async function handler(req, res) {
  try {
    const user = requireSession(req);
    const id = new URL(req.url, 'http://x').searchParams.get('id');

    if (req.method === 'GET') {
      const rows = await sb(`${TABLE}?select=*&order=titel.asc`);
      return send(res, 200, { materials: rows, user: user.name });
    }

    if (req.method === 'POST') {
      const data = cleanMaterial(await readJson(req));
      const rows = await sb(TABLE, {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: { ...data, autor: user.name, updated_by: user.name },
      });
      return send(res, 201, { material: rows[0] });
    }

    if (!validId(id)) throw httpError(400, 'Unbekanntes Material.');
    const [old] = await sb(`${TABLE}?id=eq.${id}&select=spick_path,bild_path,dateien`);
    if (!old) throw httpError(404, 'Dieses Material gibt es nicht mehr.');

    if (req.method === 'PUT') {
      const data = cleanMaterial(await readJson(req));
      const rows = await sb(`${TABLE}?id=eq.${id}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: { ...data, updated_by: user.name, updated_at: new Date().toISOString() },
      });
      // ersetzte Dateien aufräumen
      const keep = new Set(filePathsOf(data));
      await removeFiles(filePathsOf(old).filter(p => !keep.has(p)));
      return send(res, 200, { material: rows[0] });
    }

    if (req.method === 'DELETE') {
      await sb(`${TABLE}?id=eq.${id}`, { method: 'DELETE' });
      await removeFiles(filePathsOf(old));
      return send(res, 200, { ok: true });
    }

    throw httpError(405, 'Nicht erlaubt.');
  } catch (e) { fail(res, e); }
}
