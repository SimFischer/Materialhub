/* Materialhub – Oberfläche (ohne Build-Schritt, reines JavaScript) */
(function () {
  'use strict';

  // ---------- Feste Listen ----------
  var FAECHER = [
    { id: 'deutsch', name: 'Deutsch', sub: 'Sprache, Lesen, Literatur' },
    { id: 'religion', name: 'Religion', sub: 'Evangelische Religion' },
    { id: 'geschichte', name: 'Geschichte', sub: 'Quellen, Epochen, Klausuren' },
    { id: 'wipo', name: 'WiPo', sub: 'Wirtschaft und Politik' },
    { id: 'mathe', name: 'Mathematik', sub: 'Zahlen und Rechnen' },
    { id: 'ueber', name: 'Für alle Fächer', sub: 'Werkzeuge und Spiele, die überall passen' }
  ];
  var KLASSEN = ['5', '6', '7', '8', '9', '10', 'E', 'Q1', 'Q2'];
  var TYPEN = ['Spiel', 'Escape-Room', 'Lern-App', 'Klausurtraining', 'Werkzeug'];
  var ZUGANG_VORLAGEN = ['Code', 'Benutzername', 'E-Mail', 'Passwort', 'Adresse Lehrkräftebereich'];
  var BAND_MAX = 6;

  // ---------- Symbole ----------
  var I = {
    deutsch: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M9 8h7M9 12h5"/>',
    religion: '<path d="M12 2c1.5 2 3 3.2 3 5a3 3 0 0 1-6 0c0-1.8 1.5-3 3-5z"/><rect x="8.5" y="10" width="7" height="12" rx="2"/>',
    geschichte: '<path d="M6 2h12M6 22h12"/><path d="M7 2c0 5 10 6 10 10S7 17 7 22"/><path d="M17 2c0 5-10 6-10 10s10 5 10 10"/>',
    wipo: '<path d="M12 3v18M7 21h10M4 7h16"/><path d="M6 7l-3 7a3 3 0 0 0 6 0z"/><path d="M18 7l-3 7a3 3 0 0 0 6 0z"/>',
    mathe: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7.5 8.5h3M9 7v3M14 8.5h3M7.5 15.5h3M14 14l3 3M17 14l-3 3"/>',
    ueber: '<path d="M9 3h6v4a2 2 0 1 0 4 0V3h2v18H3V3h2v4a2 2 0 1 0 4 0z"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M14 9l2 2"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18M10.6 5.1A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a10 10 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    down: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    doc: '<path d="M7 8h10M7 12h10M7 16h6"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
    hub: '<rect x="3" y="3" width="8" height="8" rx="2.5"/><rect x="13" y="3" width="8" height="8" rx="2.5"/><rect x="3" y="13" width="8" height="8" rx="2.5"/><circle cx="17" cy="17" r="4"/>'
  };
  function svg(name, size, sw) {
    return '<svg width="' + (size || 20) + '" height="' + (size || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 2.2) +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[name] + '</svg>';
  }

  // ---------- Helfer ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fach(id) { return FAECHER.filter(function (f) { return f.id === id; })[0] || FAECHER[5]; }
  function klLabel(k) { return /^\d+$/.test(k) ? 'Klasse ' + k : (k === 'E' ? 'E-Phase' : k); }
  function klassenText(m) { return m.klassen.length ? m.klassen.map(klLabel).join(', ') : 'alle Jahrgänge'; }
  function anz(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function fileUrl(p) { return /^\/assets\/previews\//.test(p) ? p : '/api/files?path=' + encodeURIComponent(p); }
  function safeUrl(u) { return /^https?:\/\//i.test(u || '') ? u : ''; }
  function byTitle(a, b) { return a.titel.localeCompare(b.titel, 'de'); }
  var $app = document.getElementById('app');

  var S = { user: null, mats: [], loaded: false, q: '', draft: null, saving: false, error: '' };

  // ---------- Server ----------
  function api(path, opts) {
    opts = opts || {};
    var init = { method: opts.method || 'GET', headers: {}, credentials: 'same-origin' };
    if (opts.json !== undefined) { init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(opts.json); }
    if (opts.body) { init.headers['Content-Type'] = opts.type; init.body = opts.body; }
    return fetch(path, init).then(function (r) {
      return r.text().then(function (t) {
        var data = {}; try { data = t ? JSON.parse(t) : {}; } catch (e) { data = {}; }
        if (r.status === 401 && path !== '/api/login') { S.user = null; render(); }
        if (!r.ok) throw new Error(data.error || 'Verbindung fehlgeschlagen. Bitte erneut versuchen.');
        return data;
      });
    }, function () { throw new Error('Keine Verbindung zum Server. Bist du online?'); });
  }
  function load() {
    return api('/api/materials').then(function (d) {
      S.mats = (d.materials || []).map(norm); S.loaded = true; render();
    }).catch(function (e) { toast(e.message); });
  }
  function norm(m) {
    m.faecher = m.faecher || []; m.klassen = m.klassen || []; m.zugang = m.zugang || []; m.dateien = m.dateien || [];
    return m;
  }

  // ---------- Meldungen ----------
  var toastTimer;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }
  function copy(text, ok) {
    var done = function () { toast(ok); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text) ? done() : toast('Kopieren nicht möglich'); });
    } else { fallbackCopy(text) ? done() : toast('Kopieren nicht möglich'); }
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    var ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta); return ok;
  }
  var $modal = document.getElementById('modal');
  function openModal(html) { $modal.innerHTML = html; $modal.hidden = false; var b = $modal.querySelector('button'); if (b) b.focus(); }
  function closeModal() { $modal.hidden = true; $modal.innerHTML = ''; }
  $modal.addEventListener('click', function (e) { if (e.target === $modal) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$modal.hidden) closeModal(); });

  // ---------- Navigation (#fach/deutsch/5, #m/<id>, #neu, #bearbeiten/<id>) ----------
  function route() {
    var h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    var p = h.split('/').filter(Boolean);
    if (p[0] === 'fach') return { v: 'fach', fach: p[1], kl: p[2] || null };
    if (p[0] === 'm') return { v: 'detail', id: p[1] };
    if (p[0] === 'neu') return { v: 'edit', id: null, fach: p[1] || null, kl: p[2] || null };
    if (p[0] === 'bearbeiten') return { v: 'edit', id: p[1] };
    if (p[0] === 'papierkorb') return { v: 'trash' };
    return { v: 'home' };
  }
  var lastRoute = '';
  window.addEventListener('hashchange', function () {
    if (location.hash !== lastRoute) { S.draft = null; S.error = ''; S.uploads = []; if (route().v === 'trash') S.trash = null; }
    render(); window.scrollTo(0, 0);
  });

  // ---------- Bausteine ----------
  function header() {
    var r = route();
    var neu = '#neu' + (r.fach && r.fach !== 'ueber' ? '/' + r.fach + (r.kl ? '/' + r.kl : '') : '');
    return '<header class="top"><div class="top-in">' +
      '<a class="brand" href="#"><span class="logo">' + svg('hub', 24) + '</span><span><b>Materialhub</b><small>Lehrkräftebereich</small></span></a>' +
      '<span class="sp"></span>' +
      '<a class="btn btn-main" href="' + neu + '">' + svg('plus', 18, 2.4) + 'Neues Material</a>' +
      '<span class="user"><span class="avatar">' + esc((S.user || '?').charAt(0).toUpperCase()) + '</span><span class="name">' + esc(S.user) + '</span>' +
      '<button class="btn btn-ghost" type="button" data-act="logout">Abmelden</button></span>' +
      '</div></header>';
  }
  function crumbs(items) {
    return '<nav class="crumbs" aria-label="Pfad">' + items.map(function (it, i) {
      var sep = i ? '<span aria-hidden="true">›</span>' : '';
      return sep + (it.href ? '<a href="' + it.href + '">' + esc(it.label) + '</a>' : '<span>' + esc(it.label) + '</span>');
    }).join('') + '</nav>';
  }
  function card(m) {
    var f = m.faecher[0] || 'ueber';
    var pic = m.bild_path ? '<img src="' + fileUrl(m.bild_path) + '" alt="" loading="lazy">' : '<span class="deco">' + svg(f, 64, 1.6) + '</span>';
    return '<a class="card f-' + f + '" href="#m/' + m.id + '">' +
      '<div class="pic">' + pic + '</div><div class="body">' +
      '<div class="pills"><span class="pill">' + esc(m.typ) + '</span>' +
      (m.dauer ? '<span class="pill">' + esc(m.dauer) + '</span>' : '') +
      (m.zugang.length ? '<span class="pill ok">Zugang hinterlegt</span>' : '') +
      (m.pruefen ? '<span class="pill warn">Zuordnung prüfen</span>' : '') +
      (m.status === 'fehler' ? '<span class="pill bad">Nicht erreichbar</span>' : '') + '</div>' +
      '<h3>' + esc(m.titel) + '</h3>' + (m.kurz ? '<p>' + esc(m.kurz) + '</p>' : '') +
      '<div class="foot"><span>' + esc(klassenText(m)) + '</span><b>Details ›</b></div></div></a>';
  }
  function cardGrid(list) { return '<div class="cards">' + list.slice().sort(byTitle).map(card).join('') + '</div>'; }
  function groupByThema(list) {
    var g = {};
    list.forEach(function (m) { (g[m.thema] = g[m.thema] || []).push(m); });
    return Object.keys(g).sort(function (a, b) { return a.localeCompare(b, 'de'); }).map(function (t) {
      return '<section class="thema"><h2>' + esc(t) + '</h2>' + cardGrid(g[t]) + '</section>';
    }).join('');
  }
  function inFach(id) { return S.mats.filter(function (m) { return m.faecher.indexOf(id) >= 0; }); }

  // ---------- Ansichten ----------
  function viewLogin() {
    return '<div class="login"><form class="lcard" id="loginform">' +
      '<div class="bubbles" aria-hidden="true"><span style="background:#FF9B8A"></span><span style="background:#B9A2F5"></span><span style="background:#FFD15C"></span><span style="background:#7FD3AE"></span><span style="background:#86BCF5"></span></div>' +
      '<h1>Materialhub</h1><p class="hint">Der Lehrkräftebereich mit allen Lernspielen, Lern-Apps und Zugangsdaten unserer Schule.</p>' +
      (S.error ? '<div class="errbox">' + esc(S.error) + '</div>' : '') +
      '<div class="fld"><label for="l-name">Dein Name</label><input type="text" id="l-name" autocomplete="name" required placeholder="z. B. Kronk" value="' + esc(S.loginName != null ? S.loginName : localName()) + '"></div>' +
      '<div class="fld"><label for="l-pw">Lehrkräfte-Passwort</label><input type="password" id="l-pw" autocomplete="current-password" required></div>' +
      '<button class="btn btn-main" type="submit"' + (S.saving ? ' disabled' : '') + '>' + (S.saving ? 'Wird geprüft …' : 'Anmelden') + '</button>' +
      '<p class="hint">Dein Name erscheint bei Materialien, die du einträgst oder änderst.</p>' +
      '</form></div>';
  }
  function localName() { try { return localStorage.getItem('hub_name') || ''; } catch (e) { return ''; } }

  function viewHome() {
    var first = (S.user || '').split(' ')[0];
    var q = S.q.trim().toLowerCase();
    var html = '<section class="hello"><div><h1>Hallo ' + esc(first) + '! Was brauchst du heute?</h1>' +
      '<p>Wähle ein Fach, dann die Klasse. Zu jedem Material findest du Erklärung, Stundenablauf, Spickzettel und die Zugangsdaten.</p></div>' +
      '<label class="search" for="q">' + svg('search', 20) + '<input id="q" type="search" value="' + esc(S.q) + '" placeholder="Suchen: Luther, Grammatik, Escape-Room …" aria-label="Material suchen" autocomplete="off"></label></section>';
    html += '<div id="results">' + (q ? searchResults(q) : homeContent()) + '</div>';
    return html;
  }
  function searchResults(q) {
    var words = q.split(/\s+/);
    var res = S.mats.filter(function (m) {
      var h = (m.titel + ' ' + m.thema + ' ' + m.kurz + ' ' + m.typ + ' ' + m.autor + ' ' + m.faecher.map(function (f) { return fach(f).name; }).join(' ')).toLowerCase();
      return words.every(function (w) { return h.indexOf(w) >= 0; });
    });
    return '<section class="sec"><div class="sec-h"><h2>Suchergebnisse</h2><p>' + anz(res.length, 'Treffer', 'Treffer') + '</p></div>' +
      (res.length ? cardGrid(res) : '<div class="empty"><p>Dazu gibt es noch nichts. Vielleicht hast du etwas, das du eintragen möchtest?</p><a class="btn btn-main" href="#neu">Material eintragen</a></div>') + '</section>';
  }
  function homeContent() {
    if (!S.loaded) return '<p class="hint">Materialien werden geladen …</p>';
    var tiles = FAECHER.filter(function (f) { return f.id !== 'ueber'; }).map(function (f) {
      var n = inFach(f.id).length;
      return '<a class="tile f-' + f.id + (n ? '' : ' leer') + '" href="#fach/' + f.id + '">' +
        '<span class="deco">' + svg(f.id, 150, 1.4) + '</span>' +
        '<span class="ic">' + svg(f.id, 30, 2) + '</span>' +
        '<span><h2>' + esc(f.name) + '</h2><span class="sub">' + esc(f.sub) + '</span></span>' +
        '<span class="cnt"><span>' + (n ? anz(n, 'Angebot', 'Angebote') : 'Noch leer') + '</span><span class="arrow">' + svg('arrow', 18, 2.4) + '</span></span></a>';
    }).join('');
    var ue = inFach('ueber').sort(byTitle);
    var band = '<section class="band f-ueber"><div class="sec-h"><h2>Für alle Fächer</h2><p>Werkzeuge und Spiele, die überall passen</p></div>' +
      '<div class="minis">' + ue.slice(0, BAND_MAX).map(function (m) {
        return '<a class="mini" href="#m/' + m.id + '"><span class="dot">' + (m.bild_path ? '<img src="' + fileUrl(m.bild_path) + '" alt="">' : svg('ueber', 22)) + '</span>' +
          '<span><b>' + esc(m.titel) + '</b><span>' + esc(m.kurz) + '</span></span></a>';
      }).join('') + '</div>' +
      (ue.length > BAND_MAX ? '<a class="btn btn-white" href="#fach/ueber" style="align-self:flex-start">Alle ' + ue.length + ' anzeigen ' + svg('arrow', 16, 2.4) + '</a>' :
        (ue.length ? '' : '<p class="hint">Noch nichts eingetragen.</p>')) + '</section>';
    return '<section class="tiles" aria-label="Fächer">' + tiles + '</section>' + band +
      '<p class="foot-links"><a href="#papierkorb">Papierkorb</a></p>';
  }

  function viewFach(r) {
    var f = fach(r.fach);
    var list = inFach(f.id);
    var head = function (title, sub) {
      return '<section class="fachhead f-' + f.id + '"><span class="deco">' + svg(f.id, 200, 1.3) + '</span><span class="ic">' + svg(f.id, 36, 2) + '</span>' +
        '<div><h1>' + esc(title) + '</h1><p>' + esc(sub) + '</p></div></section>';
    };
    if (f.id === 'ueber') {
      return crumbs([{ label: 'Übersicht', href: '#' }, { label: f.name }]) + head(f.name, f.sub + ' · ' + anz(list.length, 'Angebot', 'Angebote')) +
        (list.length ? groupByThema(list) : emptyFach(f));
    }
    if (r.kl) {
      var inK = list.filter(function (m) { return m.klassen.indexOf(r.kl) >= 0; });
      var nT = Object.keys(inK.reduce(function (a, m) { a[m.thema] = 1; return a; }, {})).length;
      return crumbs([{ label: 'Übersicht', href: '#' }, { label: f.name, href: '#fach/' + f.id }, { label: klLabel(r.kl) }]) +
        head(f.name + ' · ' + klLabel(r.kl), anz(nT, 'Thema', 'Themen') + ' · ' + anz(inK.length, 'Angebot', 'Angebote')) +
        (inK.length ? groupByThema(inK) : '<div class="empty"><p>Für ' + esc(klLabel(r.kl)) + ' gibt es in ' + esc(f.name) + ' noch nichts.</p><a class="btn btn-main" href="#neu/' + f.id + '/' + esc(r.kl) + '">Material eintragen</a></div>');
    }
    var kls = KLASSEN.map(function (k) {
      var n = list.filter(function (m) { return m.klassen.indexOf(k) >= 0; }).length;
      if (!n) return '';
      return '<a class="kl" href="#fach/' + f.id + '/' + k + '"><span class="lbl">' + (/^\d+$/.test(k) ? 'Klasse' : 'Oberstufe') + '</span><span class="num">' + esc(k) + '</span><span class="c">' + anz(n, 'Angebot', 'Angebote') + '</span></a>';
    }).join('');
    var alle = list.filter(function (m) { return !m.klassen.length; });
    return crumbs([{ label: 'Übersicht', href: '#' }, { label: f.name }]) + head(f.name, f.sub + ' · ' + anz(list.length, 'Angebot', 'Angebote')) +
      (kls ? '<section class="sec f-' + f.id + '"><div class="sec-h"><h2>Welche Klasse?</h2><p>Gezeigt werden nur Klassen, für die es Material gibt.</p></div><div class="klassen">' + kls + '</div></section>' : '') +
      (alle.length ? '<section class="sec"><div class="sec-h"><h2>Für alle Jahrgänge</h2></div>' + cardGrid(alle) + '</section>' : '') +
      (list.length ? '' : emptyFach(f));
  }
  function emptyFach(f) {
    return '<div class="empty"><p>Für ' + esc(f.name) + ' ist noch nichts eingetragen. Wer hier etwas hat, kann es mit wenigen Klicks hinzufügen.</p><a class="btn btn-main" href="#neu/' + f.id + '">Erstes Material eintragen</a></div>';
  }

  function viewDetail(r) {
    var m = S.mats.filter(function (x) { return x.id === r.id; })[0];
    if (!m) return S.loaded ? '<div class="empty"><p>Dieses Material gibt es nicht mehr.</p><a class="btn btn-main" href="#">Zur Übersicht</a></div>' : '<p class="hint">Wird geladen …</p>';
    var f = fach(m.faecher[0] || 'ueber');
    var url = safeUrl(m.url);
    var ablauf = (m.ablauf || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    var white = function (t) { return '<span class="pill white">' + esc(t) + '</span>'; };
    var html = crumbs([{ label: 'Übersicht', href: '#' }, { label: f.name, href: '#fach/' + f.id }, { label: m.titel }]);
    html += '<section class="dhead f-' + f.id + (m.bild_path ? '' : ' nopic') + '"><div class="txt">' +
      '<div class="pills">' + m.faecher.map(function (x) { return white(fach(x).name); }).join('') + white(klassenText(m)) + white(m.typ) + white('Thema: ' + m.thema) +
      (m.dauer ? white(m.dauer) : '') + (m.pruefen ? '<span class="pill warn">Zuordnung prüfen</span>' : '') + '</div>' +
      '<h1>' + esc(m.titel) + '</h1>' + (m.kurz ? '<p>' + esc(m.kurz) + '</p>' : '') +
      '<div class="acts">' +
      (url ? '<a class="btn btn-main" href="' + esc(url) + '" target="_blank" rel="noopener">Öffnen ' + svg('ext', 16, 2.4) + '</a>' +
        '<button class="btn btn-white" type="button" data-act="copylink" data-url="' + esc(url) + '">Schülerlink kopieren</button>' : '<span class="pill warn">Noch kein Link</span>') +
      (url ? '<button class="btn btn-white" type="button" data-act="tafel">' + svg('qr', 18, 2) + 'Tafelmodus</button>' : '') +
      '<a class="btn btn-white" href="#bearbeiten/' + m.id + '">Bearbeiten</a></div>' + statusLine(m) + '</div>' +
      (m.bild_path ? '<div class="pic"><img src="' + fileUrl(m.bild_path) + '" alt="Vorschau von ' + esc(m.titel) + '"></div>' : '') + '</section>';

    html += '<div class="detail"><div class="col">' +
      '<section class="panel"><h2>So funktioniert\'s</h2>' + (m.wie ? richText(m.wie) : '<p class="hint">Noch keine Erklärung eingetragen.</p>') + '</section>' +
      '<section class="panel"><h2>Stundenablauf</h2>' + (ablauf.length ?
        '<ol class="lst">' + ablauf.map(function (s, i) { return '<li><span class="n">' + (i + 1) + '</span><span>' + esc(s) + '</span></li>'; }).join('') + '</ol>' :
        '<div class="empty" style="padding:16px 18px"><p>Noch kein Stundenablauf eingetragen.</p><a class="btn btn-soft" href="#bearbeiten/' + m.id + '">Ergänzen</a></div>') + '</section>' +
      '<section class="panel"><h2>Unterrichtsmaterial' + (m.dateien.length ? ' <span class="pill">' + m.dateien.length + '</span>' : '') + '</h2>' +
      (m.dateien.length ? '<div class="flist">' + m.dateien.map(fileRow).join('') + '</div>' :
        '<div class="empty" style="padding:16px 18px"><p>Noch keine Präsentationen oder Arbeitsblätter hinterlegt.</p><a class="btn btn-soft" href="#bearbeiten/' + m.id + '">Hinzufügen</a></div>') + '</section>' +
      '</div><div class="col">';

    html += '<section class="panel zug"><h2><span style="color:#8A6A00">' + svg('key', 24) + '</span>Lehrkräftezugang</h2>' +
      (m.zugang.length ? m.zugang.map(function (z, i) {
        var geheim = z.wert && isSecret(z.label);
        return '<div class="zrow"><div style="min-width:0"><div class="k">' + esc(z.label) + '</div>' +
          (!z.wert ? '<div class="v miss">noch eintragen</div>' : geheim ? '<div class="v masked" id="zv-' + i + '">' + MASK + '</div>' : '<div class="v">' + esc(z.wert) + '</div>') + '</div>' +
          (geheim ? '<button class="icon-btn" type="button" data-act="reveal" data-i="' + i + '" aria-pressed="false" aria-label="' + esc(z.label) + ' anzeigen">' + svg('eye', 18) + '</button>' : '') +
          (z.wert ? '<button class="icon-btn" type="button" data-act="copyz" data-i="' + i + '" aria-label="' + esc(z.label) + ' kopieren">' + svg('copy', 18) + '</button>' : '') + '</div>';
      }).join('') + (m.zugang.some(function (z) { return z.wert && isSecret(z.label); }) ? '<p class="hint">Geschützte Werte erscheinen erst nach Klick aufs Auge und verschwinden nach 30 Sekunden wieder.</p>' : '')
        : '<p class="hint">Kein Zugang nötig oder noch nicht eingetragen.</p>') + '</section>';

    html += '<section class="panel"><h2>Spickzettel</h2>' + (m.spick_path ?
      '<a class="file" href="' + fileUrl(m.spick_path) + '" target="_blank" rel="noopener"><span class="doc">' + svg('doc', 20, 2) + '</span><span><b>' + esc(m.spick_name || 'Spickzettel') + '</b><br><span class="hint">Öffnen</span></span></a>' :
      '<p class="hint">Noch kein Spickzettel hochgeladen.</p><a class="btn btn-soft" href="#bearbeiten/' + m.id + '" style="align-self:flex-start">Hochladen</a>') + '</section>';

    if (url) {
      html += '<section class="panel"><h2>Für die Tafel</h2><div class="qr"><button type="button" class="qrbox" data-act="qrbig" aria-label="QR-Code groß anzeigen">' + qrSvg(url) + '</button>' +
        '<p class="hint">Antippen zeigt den QR-Code groß. Schülerinnen und Schüler landen direkt im Spiel und sehen den Hub nicht.</p></div></section>';
    }
    html += '<p class="meta-line">Eingetragen von ' + esc(m.autor || 'unbekannt') +
      (m.updated_by && m.updated_at ? ' · zuletzt geändert von ' + esc(m.updated_by) + ' am ' + new Date(m.updated_at).toLocaleDateString('de-DE') : '') + '</p>' +
      '<button class="btn btn-danger" type="button" data-act="askdelete" style="align-self:flex-start">Material löschen</button>';
    html += '</div></div>';
    return html;
  }
  // ---------- Geschützte Zugangsdaten ----------
  var MASK = '••••••••';
  function isSecret(label) { return /code|passw|kennw|pin|benutzer|login|user|e-?mail|schl[uü]ssel|token/i.test(label || ''); }
  var hideTimers = {};
  function setReveal(i, show) {
    var v = document.getElementById('zv-' + i), btn = document.querySelector('[data-act="reveal"][data-i="' + i + '"]');
    var r = route(), m = S.mats.filter(function (x) { return x.id === r.id; })[0];
    if (!v || !btn || !m || !m.zugang[i]) return;
    clearTimeout(hideTimers[i]);
    v.textContent = show ? m.zugang[i].wert : MASK;
    v.classList.toggle('masked', !show);
    btn.setAttribute('aria-pressed', show ? 'true' : 'false');
    btn.setAttribute('aria-label', m.zugang[i].label + (show ? ' verbergen' : ' anzeigen'));
    btn.innerHTML = svg(show ? 'eyeoff' : 'eye', 18);
    if (show) hideTimers[i] = setTimeout(function () { setReveal(i, false); }, 30000);
  }

  // ---------- Erreichbarkeit ----------
  function when(iso) {
    if (!iso) return '';
    var d = new Date(iso), heute = new Date(), gestern = new Date(Date.now() - 864e5);
    var t = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === heute.toDateString()) return 'heute, ' + t + ' Uhr';
    if (d.toDateString() === gestern.toDateString()) return 'gestern, ' + t + ' Uhr';
    return d.toLocaleDateString('de-DE') + ', ' + t + ' Uhr';
  }
  function statusLine(m) {
    if (!m.url && !m.status_url) return '';
    var btn = '<button class="btn btn-ghost st-btn" type="button" data-act="pruefen">Jetzt prüfen</button>';
    if (m.status === 'fehler') {
      return '<div class="status bad"><span class="sdot"></span><div><b>Gerade nicht erreichbar</b><span>' + esc(m.status_info || '') + ' Geprüft ' + esc(when(m.status_at)) + '.</span></div>' + btn + '</div>';
    }
    if (m.status === 'ok') return '<div class="status ok"><span class="sdot"></span><span>Läuft · geprüft ' + esc(when(m.status_at)) + '</span>' + btn + '</div>';
    return '<div class="status"><span class="sdot"></span><span>Noch nicht geprüft</span>' + btn + '</div>';
  }

  // ---------- Tafelmodus ----------
  function openTafel(m) {
    m.zugang.forEach(function (z, i) { setReveal(i, false); });
    var f = m.faecher[0] || 'ueber', short = String(m.url).replace(/^https?:\/\//, '').replace(/\/$/, '');
    var el = document.createElement('div');
    el.className = 'tafel f-' + f; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Tafelmodus: ' + m.titel);
    el.innerHTML = '<button class="tafel-x" type="button" aria-label="Tafelmodus schließen">' + svg('x', 26, 2.4) + '</button>' +
      '<div class="tafel-in"><div class="tafel-txt"><span class="tafel-fach">' + esc(m.faecher.map(function (x) { return fach(x).name; }).join(' · ')) + '</span>' +
      '<h1>' + esc(m.titel) + '</h1><p>Scannt den Code mit eurem Gerät oder gebt die Adresse ein:</p><div class="tafel-url">' + esc(short) + '</div></div>' +
      '<div class="tafel-qr">' + qrSvg(m.url) + '</div></div>';
    var close = function () {
      document.removeEventListener('keydown', onKey);
      if (document.fullscreenElement) { try { document.exitFullscreen(); } catch (e) { /* egal */ } }
      el.remove();
    };
    var onKey = function (e) { if (e.key === 'Escape') close(); };
    el.querySelector('.tafel-x').addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', function fc() { if (!document.fullscreenElement && el.isConnected && el.dataset.fs) { document.removeEventListener('fullscreenchange', fc); close(); } });
    document.body.appendChild(el);
    if (el.requestFullscreen) el.requestFullscreen().then(function () { el.dataset.fs = '1'; }, function () { /* Vollbild nicht erlaubt: bleibt als Fenster */ });
    el.querySelector('.tafel-x').focus();
  }

  // ---------- Papierkorb ----------
  S.trash = null;
  function viewTrash() {
    if (S.trash === null) {
      api('/api/materials?papierkorb=1').then(function (d) { S.trash = (d.materials || []).map(norm); if (route().v === 'trash') render(); }).catch(function (e) { toast(e.message); });
      return crumbs([{ label: 'Übersicht', href: '#' }, { label: 'Papierkorb' }]) + '<p class="hint">Wird geladen …</p>';
    }
    var rows = S.trash.map(function (m) {
      var rest = Math.max(0, 30 - Math.floor((Date.now() - Date.parse(m.deleted_at)) / 864e5));
      return '<div class="trow f-' + (m.faecher[0] || 'ueber') + '"><span class="tdot"></span><div class="tmeta"><b>' + esc(m.titel) + '</b>' +
        '<span>Gelöscht ' + esc(when(m.deleted_at)) + (m.deleted_by ? ' von ' + esc(m.deleted_by) : '') + ' · wird in ' + rest + (rest === 1 ? ' Tag' : ' Tagen') + ' endgültig entfernt</span></div>' +
        '<div class="acts"><button class="btn btn-main" type="button" data-act="restore" data-id="' + m.id + '">Wiederherstellen</button>' +
        '<button class="btn btn-danger" type="button" data-act="askpurge" data-id="' + m.id + '">Endgültig löschen</button></div></div>';
    }).join('');
    return crumbs([{ label: 'Übersicht', href: '#' }, { label: 'Papierkorb' }]) +
      '<div class="hello"><h1>Papierkorb</h1><p>Gelöschte Materialien bleiben hier 30 Tage, samt Zugangsdaten und Dateien. Danach werden sie automatisch entfernt.</p></div>' +
      (rows ? '<section class="panel trash">' + rows + '</section>' : '<div class="empty"><p>Der Papierkorb ist leer.</p><a class="btn btn-soft" href="#">Zur Übersicht</a></div>');
  }

  // ---------- Unterrichtsmaterial ----------
  var EXT_ART = { pdf: ['PDF', 'x-pdf'], doc: ['Word', 'x-doc'], docx: ['Word', 'x-doc'], odt: ['Text', 'x-doc'], rtf: ['Text', 'x-doc'], txt: ['Text', 'x-doc'],
    ppt: ['PowerPoint', 'x-ppt'], pptx: ['PowerPoint', 'x-ppt'], odp: ['Präsentation', 'x-ppt'], key: ['Keynote', 'x-ppt'],
    xls: ['Excel', 'x-xls'], xlsx: ['Excel', 'x-xls'], ods: ['Tabelle', 'x-xls'],
    png: ['Bild', 'x-img'], jpg: ['Bild', 'x-img'], jpeg: ['Bild', 'x-img'], webp: ['Bild', 'x-img'], gif: ['Bild', 'x-img'],
    mp3: ['Audio', 'x-media'], m4a: ['Audio', 'x-media'], mp4: ['Video', 'x-media'], zip: ['ZIP', 'x-zip'] };
  function extOf(d) { return !d.path ? 'link' : (d.ext || (String(d.name).match(/\.([a-z0-9]+)$/i) || [])[1] || '').toLowerCase(); }
  function badge(d) {
    var e = extOf(d), a = e === 'link' ? ['Link', 'x-link'] : (EXT_ART[e] || [e.toUpperCase() || 'Datei', 'x-zip']);
    return '<span class="fbadge ' + a[1] + '">' + esc(e === 'link' ? 'LINK' : (e || '?').toUpperCase().slice(0, 4)) + '</span>';
  }
  function fsize(n) { return !n ? '' : n < 1048576 ? Math.max(1, Math.round(n / 1024)) + ' KB' : (n / 1048576).toFixed(n < 10485760 ? 1 : 0).replace('.', ',') + ' MB'; }
  function fileRow(d) {
    var e = extOf(d), art = e === 'link' ? 'Link' : (EXT_ART[e] || ['Datei'])[0];
    var href = d.url ? safeUrl(d.url) : fileUrl(d.path) + '&name=' + encodeURIComponent(d.name);
    return '<a class="frow" href="' + esc(href) + '" target="_blank" rel="noopener">' + badge(d) +
      '<span class="fmeta"><b>' + esc(d.name) + '</b><span>' + esc(art) + (d.size ? ' · ' + fsize(d.size) : '') + '</span></span>' +
      '<span class="fgo" aria-hidden="true">' + svg(d.url ? 'ext' : 'down', 18, 2.2) + '</span></a>';
  }
  S.uploads = [];
  function uploadMaterial(files) {
    readForm();
    Array.prototype.forEach.call(files, function (file) {
      var u = { id: 'u' + Date.now() + Math.random().toString(36).slice(2, 6), name: file.name, pct: 0, err: '' };
      S.uploads.push(u);
      if (file.size > 50 * 1024 * 1024) { u.err = 'größer als 50 MB'; return; }
      api('/api/files?mode=sign&name=' + encodeURIComponent(file.name) + '&size=' + file.size, { method: 'POST' }).then(function (res) {
        return new Promise(function (resolve, reject) {
          var x = new XMLHttpRequest();
          x.open('PUT', res.uploadUrl);
          x.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
          x.setRequestHeader('cache-control', '3600');
          x.upload.onprogress = function (ev) { if (ev.lengthComputable) { u.pct = Math.round(ev.loaded / ev.total * 100); paintUploads(); } };
          x.onload = function () { x.status < 300 ? resolve(res) : reject(new Error('Upload fehlgeschlagen (' + x.status + ')')); };
          x.onerror = function () { reject(new Error('Keine Verbindung')); };
          x.send(file);
        });
      }).then(function (res) {
        S.uploads = S.uploads.filter(function (x) { return x !== u; });
        if (S.draft) { readForm(); S.draft.dateien.push({ name: file.name, path: res.path, size: file.size, ext: res.ext }); }
        toast('„' + file.name + '“ hochgeladen. Zum Übernehmen speichern.');
        var y = window.scrollY; render(); window.scrollTo(0, y);
      }).catch(function (e) { u.err = e.message; paintUploads(); });
    });
    var y = window.scrollY; render(); window.scrollTo(0, y);
  }
  function uploadRows() {
    return S.uploads.map(function (u) {
      return '<div class="frow up" id="' + u.id + '"><span class="fbadge x-zip">…</span><span class="fmeta"><b>' + esc(u.name) + '</b>' +
        (u.err ? '<span class="ferr">Nicht hochgeladen: ' + esc(u.err) + '</span>' : '<span class="bar"><i style="width:' + u.pct + '%"></i></span>') + '</span>' +
        (u.err ? '<button class="del" type="button" data-act="updel" data-u="' + u.id + '" aria-label="Meldung schließen">' + svg('x', 16, 2.4) + '</button>' : '<span class="hint">' + u.pct + ' %</span>') + '</div>';
    }).join('');
  }
  function paintUploads() { var box = document.getElementById('uploads'); if (box) box.innerHTML = uploadRows(); }
  function editDateien(d) {
    return '<div class="fld full"><span class="lab">Unterrichtsmaterial</span><small>PowerPoints, Arbeitsblätter, Lösungen, Bilder: bis 50 MB pro Datei. Große Dateien lieber verlinken, z. B. aus der Schulcloud.</small>' +
      '<div class="flist">' + d.dateien.map(function (f, i) {
        return '<div class="fedit">' + badge(f) +
          '<input type="text" data-dn="' + i + '" value="' + esc(f.name) + '" aria-label="Name der Datei" placeholder="Name">' +
          (f.url !== undefined && !f.path ? '<input type="url" data-du="' + i + '" value="' + esc(f.url) + '" aria-label="Adresse des Links" placeholder="https://…">' : '<span class="hint">' + esc(fsize(f.size)) + '</span>') +
          '<button class="del" type="button" data-act="ddel" data-i="' + i + '" aria-label="Entfernen">' + svg('x', 18, 2.4) + '</button></div>';
      }).join('') + '<div id="uploads">' + uploadRows() + '</div></div>' +
      '<div class="chips"><label class="btn btn-soft" for="e-mat">' + svg('plus', 16, 2.4) + 'Dateien hochladen</label><input class="vh" type="file" id="e-mat" multiple data-up="material">' +
      '<button type="button" class="btn btn-ghost" data-act="dlink">+ Link hinzufügen</button></div></div>';
  }

  // Einfache Gliederung: "## Überschrift", "- Aufzählung", sonst Absatz pro Zeile
  function richText(text) {
    var out = '', list = false;
    String(text || '').split('\n').forEach(function (raw) {
      var l = raw.trim();
      var isItem = /^[-•]\s+/.test(l);
      if (list && !isItem) { out += '</ul>'; list = false; }
      if (!l) return;
      if (/^##\s+/.test(l)) out += '<h3>' + esc(l.replace(/^##\s+/, '')) + '</h3>';
      else if (isItem) { if (!list) { out += '<ul>'; list = true; } out += '<li>' + esc(l.replace(/^[-•]\s+/, '')) + '</li>'; }
      else out += '<p>' + esc(l) + '</p>';
    });
    if (list) out += '</ul>';
    return '<div class="prose">' + out + '</div>';
  }
  function qrSvg(text) {
    if (typeof window.qrcode !== 'function') return '<span class="hint">QR-Code nicht verfügbar</span>';
    try { var q = window.qrcode(0, 'M'); q.addData(text); q.make(); return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); }
    catch (e) { return '<span class="hint">QR-Code nicht verfügbar</span>'; }
  }

  // ---------- Bearbeiten ----------
  function startDraft(r) {
    if (r.id) {
      var m = S.mats.filter(function (x) { return x.id === r.id; })[0];
      if (!m) return null;
      return JSON.parse(JSON.stringify({ id: m.id, titel: m.titel, url: m.url, faecher: m.faecher, klassen: m.klassen, thema: m.thema, typ: m.typ, dauer: m.dauer, kurz: m.kurz,
        wie: m.wie, ablauf: m.ablauf, zugang: m.zugang, spick_path: m.spick_path, spick_name: m.spick_name, bild_path: m.bild_path, pruefen: m.pruefen, dateien: m.dateien, status_url: m.status_url || '' }));
    }
    return { id: null, titel: '', url: '', faecher: r.fach && r.fach !== 'ueber' ? [r.fach] : [], klassen: r.kl ? [r.kl] : [], thema: '', typ: 'Spiel', dauer: '', kurz: '',
      wie: '', ablauf: '', zugang: [], spick_path: '', spick_name: '', bild_path: '', pruefen: false, dateien: [], status_url: '' };
  }
  function chipRow(group, items, isOn) {
    return '<div class="chips" role="group">' + items.map(function (it) {
      return '<button type="button" class="chip" data-act="chip" data-g="' + group + '" data-v="' + esc(it.v) + '" aria-pressed="' + (isOn(it.v) ? 'true' : 'false') + '">' + esc(it.l) + '</button>';
    }).join('') + '</div>';
  }
  function viewEdit(r) {
    if (!S.loaded) return '<p class="hint">Wird geladen …</p>';
    if (!S.draft) S.draft = startDraft(r);
    var d = S.draft;
    if (!d) return '<div class="empty"><p>Dieses Material gibt es nicht mehr.</p><a class="btn btn-main" href="#">Zur Übersicht</a></div>';
    var back = d.id ? '#m/' + d.id : '#';
    var themen = {};
    S.mats.forEach(function (m) { if (m.faecher.some(function (f) { return d.faecher.indexOf(f) >= 0; }) && m.thema !== d.thema) themen[m.thema] = 1; });
    var sug = Object.keys(themen).sort(function (a, b) { return a.localeCompare(b, 'de'); });
    var html = crumbs([{ label: '‹ Zurück ohne Speichern', href: back }]) +
      '<div class="hello"><h1>' + (d.id ? '„' + esc(d.titel || 'Material') + '“ bearbeiten' : 'Neues Material eintragen') + '</h1><p>Alles hier kannst du später jederzeit ändern.</p></div>' +
      '<form class="panel" id="editform" novalidate>' + (S.error ? '<div class="errbox">' + esc(S.error) + '</div>' : '') + '<div class="form">' +
      '<div class="fld"><label for="e-titel">Titel</label><input type="text" id="e-titel" data-f="titel" value="' + esc(d.titel) + '" placeholder="z. B. Wahl-O-Mat für die Klasse" required></div>' +
      '<div class="fld"><label for="e-url">Link für Schüler</label><input type="url" id="e-url" data-f="url" value="' + esc(d.url) + '" placeholder="https://…"></div>' +
      '<div class="fld full"><span class="lab">Fach</span>' + chipRow('faecher', FAECHER.map(function (f) { return { v: f.id, l: f.name }; }), function (v) { return d.faecher.indexOf(v) >= 0; }) + '</div>' +
      '<div class="fld full"><span class="lab">Klasse</span>' + chipRow('klassen', KLASSEN.map(function (k) { return { v: k, l: klLabel(k) }; }), function (v) { return d.klassen.indexOf(v) >= 0; }) +
      '<small>Keine Klasse gewählt = für alle Jahrgänge</small></div>' +
      '<div class="fld full"><label for="e-thema">Thema</label><input type="text" id="e-thema" data-f="thema" value="' + esc(d.thema) + '" placeholder="z. B. Wahlen und Parteien">' +
      (sug.length ? '<div class="chips">' + sug.map(function (t) { return '<button type="button" class="chip sug" data-act="thema" data-v="' + esc(t) + '">' + esc(t) + '</button>'; }).join('') +
        '</div><small>Vorhandene Themen in diesem Fach. Antippen übernimmt es, damit gleiche Themen zusammenstehen.</small>' : '') + '</div>' +
      '<div class="fld full"><span class="lab">Art</span>' + chipRow('typ', TYPEN.map(function (t) { return { v: t, l: t }; }), function (v) { return d.typ === v; }) + '</div>' +
      '<div class="fld"><label for="e-dauer">Dauer</label><input type="text" id="e-dauer" data-f="dauer" value="' + esc(d.dauer) + '" placeholder="z. B. 45 Minuten"></div>' +
      '<div class="fld"><label for="e-kurz">Kurzbeschreibung</label><input type="text" id="e-kurz" data-f="kurz" value="' + esc(d.kurz) + '" placeholder="Ein Satz, was es ist"></div>' +
      '<div class="fld full"><label for="e-wie">So funktioniert\'s</label><textarea id="e-wie" data-f="wie" rows="4" placeholder="Wie läuft das Spiel ab, was machen die Schülerinnen und Schüler?">' + esc(d.wie) + '</textarea><small>Gliedern: Eine Zeile mit „## “ davor wird eine Zwischenüberschrift, eine Zeile mit „- “ davor ein Aufzählungspunkt.</small></div>' +
      '<div class="fld full"><label for="e-ablauf">Stundenablauf</label><textarea id="e-ablauf" data-f="ablauf" rows="5" placeholder="Ein Schritt pro Zeile, z. B.&#10;Einstieg mit Bild (5 Min.)&#10;Spielphase in Gruppen (30 Min.)&#10;Sicherung (10 Min.)">' + esc(d.ablauf) + '</textarea><small>Jede Zeile wird ein nummerierter Schritt.</small></div>' +
      '<div class="fld full"><span class="lab">Lehrkräftezugang</span><div style="display:flex;flex-direction:column;gap:8px">' +
      d.zugang.map(function (z, i) {
        return '<div class="zedit"><input type="text" data-z="' + i + '" data-k="label" value="' + esc(z.label) + '" placeholder="Bezeichnung" aria-label="Bezeichnung">' +
          '<input type="text" class="' + (isSecret(z.label) ? 'secret' : '') + '" autocomplete="off" data-z="' + i + '" data-k="wert" value="' + esc(z.wert) + '" placeholder="Wert" aria-label="Wert für ' + esc(z.label) + '">' +
          '<button class="del" type="button" data-act="zdel" data-i="' + i + '" aria-label="Feld entfernen">' + svg('x', 18, 2.4) + '</button></div>';
      }).join('') +
      '<div class="chips">' + ZUGANG_VORLAGEN.map(function (l) { return '<button type="button" class="chip sug" data-act="zadd" data-v="' + esc(l) + '">+ ' + esc(l) + '</button>'; }).join('') + '</div></div></div>' +
      editDateien(d) +
      '<div class="fld"><span class="lab">Vorschaubild</span><div class="upl">' +
      (d.bild_path ? '<img class="thumb" src="' + fileUrl(d.bild_path) + '" alt="">' : '') +
      '<label class="btn btn-soft" for="e-bild">' + (d.bild_path ? 'Anderes Bild' : 'Bild wählen') + '</label><input type="file" id="e-bild" accept="image/*" data-up="bild">' +
      (d.bild_path ? '<button type="button" class="btn btn-ghost" data-act="rmfile" data-k="bild">Entfernen</button>' : '<small>z. B. ein Screenshot aus dem Spiel</small>') + '</div></div>' +
      '<div class="fld"><span class="lab">Spickzettel</span><div class="upl">' +
      (d.spick_path ? '<span>' + esc(d.spick_name || 'Spickzettel') + '</span>' : '') +
      '<label class="btn btn-soft" for="e-spick">' + (d.spick_path ? 'Ersetzen' : 'PDF wählen') + '</label><input type="file" id="e-spick" accept="application/pdf,image/png,image/jpeg" data-up="spick">' +
      (d.spick_path ? '<button type="button" class="btn btn-ghost" data-act="rmfile" data-k="spick">Entfernen</button>' : '<small>PDF bis 4 MB</small>') + '</div></div>' +
      '<div class="fld full"><label for="e-surl">Datenbank mitprüfen (optional)</label><input type="url" id="e-surl" data-f="status_url" value="' + esc(d.status_url || '') + '" placeholder="https://….supabase.co/rest/v1/">' +
      '<small>Nur für Apps mit eigener Datenbank, z. B. Supabase. Der Hub prüft dann jeden Morgen auch, ob die Datenbank wach ist.</small></div>' +
      '<label class="switch full"><input type="checkbox" data-f="pruefen"' + (d.pruefen ? ' checked' : '') + '> Zuordnung noch nicht sicher (wird mit „Zuordnung prüfen“ markiert)</label>' +
      '</div><div class="acts" style="justify-content:flex-end"><a class="btn btn-soft" href="' + back + '">Abbrechen</a>' +
      '<button class="btn btn-main" type="submit"' + (S.saving ? ' disabled' : '') + '>' + (S.saving ? 'Wird gespeichert …' : 'Speichern') + '</button></div></form>';
    return html;
  }
  function readForm() {
    var form = document.getElementById('editform'); if (!form || !S.draft) return;
    form.querySelectorAll('[data-f]').forEach(function (el) {
      S.draft[el.getAttribute('data-f')] = el.type === 'checkbox' ? el.checked : el.value;
    });
    form.querySelectorAll('[data-z]').forEach(function (el) {
      var z = S.draft.zugang[+el.getAttribute('data-z')]; if (z) z[el.getAttribute('data-k')] = el.value;
    });
    form.querySelectorAll('[data-dn]').forEach(function (el) { var f = S.draft.dateien[+el.getAttribute('data-dn')]; if (f) f.name = el.value; });
    form.querySelectorAll('[data-du]').forEach(function (el) { var f = S.draft.dateien[+el.getAttribute('data-du')]; if (f) f.url = el.value.trim(); });
  }
  function save() {
    readForm();
    var d = S.draft; S.error = '';
    if (!d.titel.trim()) S.error = 'Bitte einen Titel eintragen.';
    else if (!d.faecher.length) S.error = 'Bitte mindestens ein Fach wählen.';
    else if (d.url.trim() && !/^https?:\/\//i.test(d.url.trim())) S.error = 'Der Link muss mit https:// beginnen.';
    else if (S.uploads.some(function (u) { return !u.err; })) S.error = 'Bitte warten, bis alle Dateien hochgeladen sind.';
    else if (d.dateien.some(function (f) { return !f.path && !/^https?:\/\/\S+$/i.test(f.url || ''); })) S.error = 'Bei jedem Link bitte eine Adresse mit https:// eintragen.';
    else if (d.dateien.some(function (f) { return !String(f.name || '').trim(); })) S.error = 'Bitte jeder Datei und jedem Link einen Namen geben.';
    if (S.error) { render(); window.scrollTo(0, 0); return; }
    S.saving = true; render();
    api(d.id ? '/api/materials?id=' + d.id : '/api/materials', { method: d.id ? 'PUT' : 'POST', json: d }).then(function (res) {
      var m = norm(res.material);
      S.mats = S.mats.filter(function (x) { return x.id !== m.id; }).concat([m]);
      S.saving = false; S.draft = null;
      toast(d.id ? 'Änderungen gespeichert' : 'Material eingetragen');
      location.hash = '#m/' + m.id;
    }).catch(function (e) { S.saving = false; S.error = e.message; render(); window.scrollTo(0, 0); });
  }
  function resizeImage(file) {
    return new Promise(function (resolve) {
      if (!/^image\//.test(file.type) || file.type === 'image/gif') return resolve(file);
      var img = new Image(), u = URL.createObjectURL(file);
      img.onload = function () {
        var max = 1600, w = img.naturalWidth, h = img.naturalHeight, s = Math.min(1, max / Math.max(w, h));
        var c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.round(h * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
        c.toBlob(function (b) { resolve(b || file); }, 'image/jpeg', 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(u); resolve(file); };
      img.src = u;
    });
  }
  function upload(kind, file) {
    readForm();
    toast('Wird hochgeladen …');
    var prep = kind === 'bild' ? resizeImage(file) : Promise.resolve(file);
    prep.then(function (blob) {
      if (blob.size > 4 * 1024 * 1024) throw new Error('Die Datei ist zu groß (höchstens 4 MB).');
      return api('/api/files?kind=' + kind + '&name=' + encodeURIComponent(file.name), { method: 'POST', body: blob, type: blob.type || file.type });
    }).then(function (res) {
      if (!S.draft) return;
      if (kind === 'bild') S.draft.bild_path = res.path; else { S.draft.spick_path = res.path; S.draft.spick_name = file.name; }
      toast('Hochgeladen. Zum Übernehmen noch speichern.'); render();
    }).catch(function (e) { toast(e.message); });
  }

  // ---------- Ereignisse ----------
  document.addEventListener('submit', function (e) {
    if (e.target.id === 'loginform') {
      e.preventDefault();
      var name = document.getElementById('l-name').value.trim(), pw = document.getElementById('l-pw').value;
      S.loginName = name;
      S.saving = true; S.error = ''; render();
      api('/api/login', { method: 'POST', json: { name: name, password: pw } }).then(function (d) {
        try { localStorage.setItem('hub_name', d.name); } catch (er) { /* egal */ }
        S.user = d.name; S.saving = false; render(); return load();
      }).catch(function (er) { S.saving = false; S.error = er.message; render(); var p = document.getElementById('l-pw'); if (p) p.focus(); });
    }
    if (e.target.id === 'editform') { e.preventDefault(); save(); }
  });
  document.addEventListener('input', function (e) {
    if (e.target.id === 'q') {
      S.q = e.target.value;
      var box = document.getElementById('results');
      if (box) { var q = S.q.trim().toLowerCase(); box.innerHTML = q ? searchResults(q) : homeContent(); }
    }
  });
  document.addEventListener('change', function (e) {
    var k = e.target.getAttribute && e.target.getAttribute('data-up');
    if (k === 'material' && e.target.files && e.target.files.length) { uploadMaterial(e.target.files); return; }
    if (k && e.target.files && e.target.files[0]) upload(k, e.target.files[0]);
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.getAttribute('data-act');
    var r = route();
    var m = r.v === 'detail' ? S.mats.filter(function (x) { return x.id === r.id; })[0] : null;
    if (act === 'logout') {
      api('/api/logout', { method: 'POST' }).catch(function () {}).then(function () { S.user = null; S.mats = []; S.loaded = false; render(); });
    } else if (act === 'copylink') {
      copy(b.getAttribute('data-url'), 'Schülerlink kopiert');
    } else if (act === 'reveal' && m) {
      var ri = +b.getAttribute('data-i'); setReveal(ri, b.getAttribute('aria-pressed') !== 'true');
    } else if (act === 'copyz' && m) {
      var z = m.zugang[+b.getAttribute('data-i')]; if (z) copy(z.wert, z.label + ' kopiert');
    } else if (act === 'qrbig' && m) {
      openModal('<div class="dialog qrdialog" role="dialog" aria-modal="true" aria-label="QR-Code"><h2>' + esc(m.titel) + '</h2><div class="qrbig">' + qrSvg(m.url) + '</div>' +
        '<p class="hint">' + esc(m.url) + '</p><button class="btn btn-soft" type="button" data-act="close">Schließen</button></div>');
    } else if (act === 'tafel' && m) {
      openTafel(m);
    } else if (act === 'pruefen' && m) {
      b.disabled = true; b.textContent = 'Wird geprüft …';
      api('/api/materials?id=' + m.id + '&aktion=pruefen', { method: 'POST' }).then(function (res) {
        var n = norm(res.material); S.mats = S.mats.map(function (x) { return x.id === n.id ? n : x; });
        toast(n.status === 'ok' ? 'Läuft' : 'Nicht erreichbar'); render();
      }).catch(function (er) { toast(er.message); render(); });
    } else if (act === 'restore') {
      var rid = b.getAttribute('data-id'); b.disabled = true;
      api('/api/materials?id=' + rid + '&aktion=wiederherstellen', { method: 'POST' }).then(function (res) {
        S.mats.push(norm(res.material)); S.trash = S.trash.filter(function (x) { return x.id !== rid; });
        toast('Wiederhergestellt'); render();
      }).catch(function (er) { toast(er.message); b.disabled = false; });
    } else if (act === 'askpurge') {
      var pm = (S.trash || []).filter(function (x) { return x.id === b.getAttribute('data-id'); })[0]; if (!pm) return;
      openModal('<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="pg-h"><h2 id="pg-h">„' + esc(pm.titel) + '“ endgültig löschen?</h2>' +
        '<p>Der Eintrag wird mit allen Zugangsdaten und hochgeladenen Dateien gelöscht. Das lässt sich nicht rückgängig machen.</p>' +
        '<div class="acts" style="justify-content:flex-end"><button class="btn btn-soft" type="button" data-act="close">Abbrechen</button><button class="btn btn-danger" type="button" data-act="dopurge" data-id="' + pm.id + '">Endgültig löschen</button></div></div>');
    } else if (act === 'dopurge') {
      var did = b.getAttribute('data-id'); b.disabled = true;
      api('/api/materials?id=' + did + '&endgueltig=1', { method: 'DELETE' }).then(function () {
        S.trash = S.trash.filter(function (x) { return x.id !== did; }); closeModal(); toast('Endgültig gelöscht'); render();
      }).catch(function (er) { closeModal(); toast(er.message); });
    } else if (act === 'close') {
      closeModal();
    } else if (act === 'askdelete' && m) {
      openModal('<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dl-h"><h2 id="dl-h">„' + esc(m.titel) + '“ löschen?</h2>' +
        '<p>Der Eintrag kommt in den Papierkorb und verschwindet aus dem Hub. 30 Tage lang lässt er sich mit allen Zugangsdaten und Dateien wiederherstellen. Das Spiel selbst bleibt online.</p>' +
        '<div class="acts" style="justify-content:flex-end"><button class="btn btn-soft" type="button" data-act="close">Abbrechen</button><button class="btn btn-danger" type="button" data-act="dodelete">In den Papierkorb</button></div></div>');
    } else if (act === 'dodelete' && m) {
      b.disabled = true;
      api('/api/materials?id=' + m.id, { method: 'DELETE' }).then(function () {
        S.mats = S.mats.filter(function (x) { return x.id !== m.id; }); S.trash = null; closeModal(); toast('In den Papierkorb gelegt');
        location.hash = '#fach/' + (m.faecher[0] || '');
      }).catch(function (er) { closeModal(); toast(er.message); });
    } else if (S.draft) {
      readForm();
      var d = S.draft, v = b.getAttribute('data-v');
      if (act === 'chip') {
        var g = b.getAttribute('data-g');
        if (g === 'typ') d.typ = v;
        else d[g] = d[g].indexOf(v) >= 0 ? d[g].filter(function (x) { return x !== v; }) : d[g].concat([v]);
        if (g === 'klassen') d.klassen = KLASSEN.filter(function (k) { return d.klassen.indexOf(k) >= 0; });
      } else if (act === 'thema') { d.thema = v; }
      else if (act === 'zadd') { d.zugang.push({ label: v, wert: '' }); }
      else if (act === 'zdel') { d.zugang.splice(+b.getAttribute('data-i'), 1); }
      else if (act === 'ddel') { d.dateien.splice(+b.getAttribute('data-i'), 1); }
      else if (act === 'dlink') { d.dateien.push({ name: '', url: '' }); }
      else if (act === 'updel') { S.uploads = S.uploads.filter(function (u) { return u.id !== b.getAttribute('data-u'); }); }
      else if (act === 'rmfile') {
        if (b.getAttribute('data-k') === 'bild') d.bild_path = ''; else { d.spick_path = ''; d.spick_name = ''; }
      }
      var y = window.scrollY; render(); window.scrollTo(0, y);
      if (act === 'dlink') { var dn = document.querySelectorAll('[data-dn]'); if (dn.length) dn[dn.length - 1].focus(); }
      if (act === 'zadd') { var ins = document.querySelectorAll('[data-k="wert"]'); if (ins.length) ins[ins.length - 1].focus(); }
    }
  });

  // ---------- Zeichnen ----------
  function render() {
    lastRoute = location.hash;
    if (!S.user) { document.title = 'Anmelden · Materialhub'; $app.innerHTML = viewLogin(); return; }
    var r = route(), body;
    if (r.v === 'fach') body = viewFach(r);
    else if (r.v === 'detail') body = viewDetail(r);
    else if (r.v === 'edit') body = viewEdit(r);
    else if (r.v === 'trash') body = viewTrash();
    else body = viewHome();
    var focusQ = document.activeElement && document.activeElement.id === 'q';
    $app.innerHTML = header() + '<main class="main" id="main">' + body + '</main>';
    if (focusQ) { var q = document.getElementById('q'); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }
    var t = r.v === 'detail' ? (S.mats.filter(function (x) { return x.id === r.id; })[0] || {}).titel : (r.v === 'fach' ? fach(r.fach).name : '');
    document.title = (t ? t + ' · ' : '') + 'Materialhub';
  }

  // ---------- Start ----------
  api('/api/me').then(function (d) {
    S.user = d.name; render(); if (S.user) load();
  }).catch(function (e) { S.user = null; S.error = e.message; render(); });
})();
