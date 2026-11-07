// Läuft jeden Morgen über Vercel (siehe vercel.json):
// 1. hält das kostenlose Supabase-Projekt wach,
// 2. prüft, ob alle Apps erreichbar sind,
// 3. leert Einträge, die länger als 30 Tage im Papierkorb liegen.
// Gibt keine Inhalte heraus.
import { send, sb, checkMaterial, removeFiles, filePathsOf } from './_lib.js';

export const config = { maxDuration: 60 };
const TABLE = '/rest/v1/materials';

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) return send(res, 401, { ok: false });
  try {
    const rows = await sb(`${TABLE}?select=id,url,status_url,deleted_at,spick_path,bild_path,dateien`);

    // Papierkorb: älter als 30 Tage endgültig löschen
    const grenze = Date.now() - 30 * 24 * 3600 * 1000;
    const alt = rows.filter(r => r.deleted_at && Date.parse(r.deleted_at) < grenze);
    for (const r of alt) {
      await sb(`${TABLE}?id=eq.${r.id}`, { method: 'DELETE' });
      await removeFiles(filePathsOf(r));
    }

    // Erreichbarkeit prüfen (höchstens 6 gleichzeitig)
    const aktiv = rows.filter(r => !r.deleted_at && (r.url || r.status_url));
    let i = 0, fehler = 0;
    await Promise.all(Array.from({ length: 6 }, async () => {
      while (i < aktiv.length) {
        const r = aktiv[i++];
        const status = await checkMaterial(r);
        if (status.status === 'fehler') fehler++;
        await sb(`${TABLE}?id=eq.${r.id}`, { method: 'PATCH', body: status });
      }
    }));
    send(res, 200, { ok: true, geprueft: aktiv.length, fehler, papierkorbGeleert: alt.length });
  } catch (e) {
    console.error(e);
    send(res, 502, { ok: false });
  }
}
