// Gemeinsame Hilfsfunktionen der Server-Funktionen.
// Dateien mit "_" am Anfang werden von Vercel nicht als eigene Route veröffentlicht.
import crypto from 'node:crypto';

export const BUCKET = 'hub-dateien';
export const FAECHER = ['deutsch', 'religion', 'geschichte', 'wipo', 'mathe', 'ueber'];
export const KLASSEN = ['5', '6', '7', '8', '9', '10', 'E', 'Q1', 'Q2'];
export const TYPEN = ['Spiel', 'Escape-Room', 'Lern-App', 'Klausurtraining', 'Werkzeug'];

const COOKIE = 'hub_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 Tage angemeldet bleiben

function env(name) {
  const v = process.env[name];
  if (!v) throw Object.assign(new Error(`Umgebungsvariable ${name} fehlt in Vercel.`), { status: 500 });
  return v;
}

// ---------- Antworten ----------
export function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}
export function fail(res, err) {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  send(res, status, { error: err.message || 'Unbekannter Fehler' });
}
export function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

// ---------- Sitzung (signiertes Cookie) ----------
function sign(value) {
  return crypto.createHmac('sha256', env('SESSION_SECRET')).update(value).digest('base64url');
}
function parseCookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
export function createSession(res, name) {
  const payload = Buffer.from(JSON.stringify({ n: name, exp: Date.now() + MAX_AGE * 1000 })).toString('base64url');
  const token = `${payload}.${sign(payload)}`;
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`);
}
export function clearSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}
export function getSession(req) {
  const token = parseCookies(req)[COOKIE];
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.exp || data.exp < Date.now()) return null;
    return { name: String(data.n || '') };
  } catch { return null; }
}
export function requireSession(req) {
  const s = getSession(req);
  if (!s) throw httpError(401, 'Bitte melde dich an.');
  return s;
}
export function checkPassword(given) {
  const a = crypto.createHash('sha256').update(String(given || '')).digest();
  const b = crypto.createHash('sha256').update(env('HUB_PASSWORD')).digest();
  return crypto.timingSafeEqual(a, b);
}

// ---------- Anfragen lesen ----------
export async function readRaw(req, limit) {
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw httpError(413, 'Die Datei ist zu groß (höchstens 4 MB).');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
export async function readJson(req) {
  if (!String(req.headers['content-type'] || '').includes('application/json')) throw httpError(415, 'Ungültige Anfrage.');
  const raw = await readRaw(req, 200 * 1024);
  try { return JSON.parse(raw.toString('utf8') || '{}'); } catch { throw httpError(400, 'Ungültige Daten.'); }
}

// ---------- Supabase ----------
function sbHeaders(extra = {}) {
  const key = env('SUPABASE_SECRET_KEY');
  const h = { apikey: key, ...extra };
  if (key.startsWith('eyJ')) h.Authorization = `Bearer ${key}`; // alter service_role-Schlüssel
  return h;
}
function sbUrl(path) { return env('SUPABASE_URL').replace(/\/+$/, '') + path; }

export async function sb(path, { method = 'GET', body, headers = {}, raw = false } = {}) {
  const r = await fetch(sbUrl(path), {
    method,
    headers: sbHeaders(body !== undefined && !raw ? { 'Content-Type': 'application/json', ...headers } : headers),
    body: body === undefined ? undefined : (raw ? body : JSON.stringify(body)),
  });
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!r.ok) {
    console.error('Supabase', method, path, r.status, text);
    throw httpError(502, 'Die Datenbank hat die Anfrage abgelehnt. Bitte später erneut versuchen.');
  }
  return data;
}
export function storageBase() { return sbUrl('/storage/v1'); }

export function validPath(p) {
  return typeof p === 'string' && /^(spick|bild)\/[A-Za-z0-9._-]{1,160}$/.test(p) && !p.includes('..');
}
export async function removeFiles(paths) {
  const list = paths.filter(validPath);
  if (!list.length) return;
  try { await sb(`/storage/v1/object/${BUCKET}`, { method: 'DELETE', body: { prefixes: list } }); }
  catch (e) { console.error('Datei konnte nicht gelöscht werden', list, e); }
}

// ---------- Material prüfen und bereinigen ----------
const str = (v, max) => String(v ?? '').trim().slice(0, max);
export function cleanMaterial(input) {
  const m = input || {};
  const titel = str(m.titel, 160);
  if (!titel) throw httpError(400, 'Bitte einen Titel eintragen.');
  const url = str(m.url, 500);
  if (url && !/^https?:\/\/[^\s]+$/i.test(url)) throw httpError(400, 'Der Link muss mit https:// beginnen.');
  const faecher = [...new Set((Array.isArray(m.faecher) ? m.faecher : []).map(String))].filter(f => FAECHER.includes(f));
  if (!faecher.length) throw httpError(400, 'Bitte mindestens ein Fach wählen.');
  const klassen = KLASSEN.filter(k => (Array.isArray(m.klassen) ? m.klassen.map(String) : []).includes(k));
  const typ = TYPEN.includes(m.typ) ? m.typ : 'Spiel';
  const zugang = (Array.isArray(m.zugang) ? m.zugang : []).slice(0, 20)
    .map(z => ({ label: str(z && z.label, 80), wert: str(z && z.wert, 300) }))
    .filter(z => z.label);
  const spick_path = validPath(m.spick_path) ? m.spick_path : '';
  const bild_path = validPath(m.bild_path) ? m.bild_path : '';
  return {
    titel, url, faecher, klassen, typ, zugang, spick_path, bild_path,
    thema: str(m.thema, 120) || 'Ohne Thema',
    dauer: str(m.dauer, 60),
    kurz: str(m.kurz, 400),
    wie: str(m.wie, 6000),
    ablauf: str(m.ablauf, 6000),
    spick_name: spick_path ? str(m.spick_name, 160) || 'Spickzettel.pdf' : '',
    pruefen: !!m.pruefen,
  };
}
export function validId(id) {
  return typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id);
}
