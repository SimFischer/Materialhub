// GET    /api/materials                    alle Materialien (ohne Papierkorb)
// GET    /api/materials?papierkorb=1       Inhalt des Papierkorbs
// POST   /api/materials                    neues Material
// PUT    /api/materials?id=…               Material ändern
// POST   /api/materials?id=…&aktion=wiederherstellen
// POST   /api/materials?id=…&aktion=pruefen      Erreichbarkeit jetzt prüfen
// DELETE /api/materials?id=…               in den Papierkorb legen
// DELETE /api/materials?id=…&endgueltig=1  endgültig löschen (nur aus dem Papierkorb)
import { send, fail, readJson, requireSession, sb, cleanMaterial, validId, removeFiles, filePathsOf, checkMaterial, httpError } from './_lib.js';

const TABLE = '/rest/v1/materials';

export default async function handler(req, res) {
  try {
    const user = requireSession(req);
    const q = new URL(req.url, 'http://x').searchParams;
    const id = q.get('id');

    if (req.method === 'GET') {
      const trash = q.get('papierkorb') === '1';
      const rows = await sb(`${TABLE}?select=*&deleted_at=${trash ? 'not.is.null&order=deleted_at.desc' : 'is.null&order=titel.asc'}`);
      return send(res, 200, { materials: rows, user: user.name });
    }

    if (req.method === 'POST' && !id) {
      const data = cleanMaterial(await readJson(req));
      const rows = await sb(TABLE, {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: { ...data, autor: user.name, updated_by: user.name },
      });
      return send(res, 201, { material: rows[0] });
    }

    if (!validId(id)) throw httpError(400, 'Unbekanntes Material.');
    const [old] = await sb(`${TABLE}?id=eq.${id}&select=*`);
    if (!old) throw httpError(404, 'Dieses Material gibt es nicht mehr.');

    if (req.method === 'POST' && q.get('aktion') === 'wiederherstellen') {
      const rows = await sb(`${TABLE}?id=eq.${id}`, {
        method: 'PATCH', headers: { Prefer: 'return=representation' },
        body: { deleted_at: null, deleted_by: '', updated_by: user.name, updated_at: new Date().toISOString() },
      });
      return send(res, 200, { material: rows[0] });
    }

    if (req.method === 'POST' && q.get('aktion') === 'pruefen') {
      const status = await checkMaterial(old);
      const rows = await sb(`${TABLE}?id=eq.${id}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: status });
      return send(res, 200, { material: rows[0] });
    }

    if (req.method === 'PUT') {
      if (old.deleted_at) throw httpError(409, 'Dieses Material liegt im Papierkorb. Bitte zuerst wiederherstellen.');
      const data = cleanMaterial(await readJson(req));
      const changedLink = data.url !== old.url || data.status_url !== old.status_url;
      const rows = await sb(`${TABLE}?id=eq.${id}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: { ...data, ...(changedLink ? { status: '', status_info: '', status_at: null } : {}), updated_by: user.name, updated_at: new Date().toISOString() },
      });
      // ersetzte Dateien aufräumen
      const keep = new Set(filePathsOf(data));
      await removeFiles(filePathsOf(old).filter(p => !keep.has(p)));
      return send(res, 200, { material: rows[0] });
    }

    if (req.method === 'DELETE') {
      if (q.get('endgueltig') === '1') {
        if (!old.deleted_at) throw httpError(409, 'Bitte zuerst in den Papierkorb legen.');
        await sb(`${TABLE}?id=eq.${id}`, { method: 'DELETE' });
        await removeFiles(filePathsOf(old));
        return send(res, 200, { ok: true });
      }
      await sb(`${TABLE}?id=eq.${id}`, { method: 'PATCH', body: { deleted_at: new Date().toISOString(), deleted_by: user.name } });
      return send(res, 200, { ok: true });
    }

    throw httpError(405, 'Nicht erlaubt.');
  } catch (e) { fail(res, e); }
}
