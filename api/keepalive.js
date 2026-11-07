// Täglicher Aufruf durch Vercel (siehe vercel.json), damit das kostenlose
// Supabase-Projekt nicht wegen Inaktivität pausiert. Gibt keine Daten heraus.
import { send, sb } from './_lib.js';

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) return send(res, 401, { ok: false });
  try {
    await sb('/rest/v1/materials?select=id&limit=1');
    send(res, 200, { ok: true, at: new Date().toISOString() });
  } catch (e) {
    send(res, 502, { ok: false });
  }
}
