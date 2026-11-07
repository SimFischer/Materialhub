import { send, fail, readJson, checkPassword, createSession, httpError } from './_lib.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') throw httpError(405, 'Nicht erlaubt.');
    const { name, password } = await readJson(req);
    const n = String(name || '').trim().slice(0, 80);
    if (!n) throw httpError(400, 'Bitte deinen Namen eintragen.');
    if (!checkPassword(password)) {
      await new Promise(r => setTimeout(r, 800)); // bremst Rateversuche
      throw httpError(401, 'Das Passwort stimmt nicht.');
    }
    createSession(res, n);
    send(res, 200, { name: n });
  } catch (e) { fail(res, e); }
}
