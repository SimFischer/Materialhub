import { send, fail, getSession } from './_lib.js';

export default function handler(req, res) {
  try {
    const s = getSession(req);
    send(res, 200, { name: s ? s.name : null });
  } catch (e) { fail(res, e); }
}
