# Materialhub

Der Lehrkräftebereich mit allen Lernspielen, Lern-Apps und Werkzeugen des Kollegiums.
Fach wählen, Klasse wählen, Thema wählen. Zu jedem Material gibt es Erklärung, Stundenablauf,
Spickzettel, Lehrkräfte-Zugangsdaten, den Schülerlink und einen QR-Code für die Tafel.

Alle angemeldeten Lehrkräfte können Material eintragen, bearbeiten und löschen.
Schülerinnen und Schüler bekommen nur die Links zu den Spielen und sehen den Hub nie.

## So ist es gebaut

| Teil | Wo | Aufgabe |
|---|---|---|
| Oberfläche | `index.html`, `assets/` | reines HTML, CSS und JavaScript, kein Build-Schritt |
| Server-Funktionen | `api/` | Anmeldung, Materialien lesen und speichern, Dateien hochladen |
| Daten | Supabase (Tabelle `materials`, Speicher `hub-dateien`) | Einträge, Spickzettel, Vorschaubilder |

**Sicherheit:** Die Seite selbst enthält keine Daten. Materialien, Zugangsdaten und Dateien
liefert der Server erst nach Eingabe des Lehrkräfte-Passworts. Das Passwort steht nicht im
Code, sondern nur in den Vercel-Einstellungen. Die Supabase-Tabelle ist für den öffentlichen
Schlüssel gesperrt; nur die Server-Funktionen kommen mit dem geheimen Schlüssel heran.
Suchmaschinen werden ausgesperrt.

## Einrichtung (einmalig, ca. 15 Minuten)

### 1. Supabase

1. Auf [supabase.com](https://supabase.com) ein neues Projekt anlegen (Region Frankfurt, kostenloser Plan reicht).
2. Links **SQL Editor** öffnen, den Inhalt von `supabase/schema.sql` einfügen und **Run** klicken.
3. Danach den Inhalt von `supabase/seed.sql` einfügen und **Run** klicken. Damit sind alle bisherigen Materialien drin.
4. Unter **Project Settings → API Keys** zwei Werte notieren:
   - die **Project URL** (`https://….supabase.co`)
   - den **Secret key** (beginnt mit `sb_secret_…`; bei älteren Projekten der `service_role`-Schlüssel)

### 2. Vercel

1. Auf [vercel.com](https://vercel.com) **Add New → Project** wählen und dieses Repository importieren.
   Framework-Vorgabe: **Other**. Sonst nichts ändern.
2. Vor dem Klick auf **Deploy** unter **Environment Variables** eintragen:

   | Name | Wert |
   |---|---|
   | `HUB_PASSWORD` | das gemeinsame Lehrkräfte-Passwort |
   | `SESSION_SECRET` | eine lange Zufallszeichenkette (mind. 32 Zeichen, z. B. von einem Passwortgenerator) |
   | `SUPABASE_URL` | die Project URL aus Schritt 1 |
   | `SUPABASE_SECRET_KEY` | der Secret key aus Schritt 1 |

3. **Deploy** klicken. Fertig. Die Adresse (z. B. `materialhub.vercel.app`) und das Passwort an die Kolleginnen und Kollegen geben.

### Passwort ändern

In Vercel unter **Settings → Environment Variables** `HUB_PASSWORD` ändern und unter
**Deployments** neu veröffentlichen (**Redeploy**). Wer alle sofort abmelden möchte, ändert
zusätzlich `SESSION_SECRET`.

## Sicherung

- **Daten:** Supabase → **Table Editor → materials → Export to CSV**. Für eine vollständige
  Sicherung unter **Database → Backups** (kostenpflichtige Pläne) oder per `pg_dump`.
- **Dateien:** Supabase → **Storage → hub-dateien**.
- **Code:** dieses Repository.

## Tägliche Prüfung (Wachhalten, Erreichbarkeit, Papierkorb)

Vercel ruft jeden Morgen `/api/keepalive` auf (siehe `vercel.json`, unter *Settings → Cron Jobs* sichtbar). Dabei
- bleibt das kostenlose Supabase-Projekt wach (es pausiert sonst nach etwa einer Woche ohne Nutzung),
- wird geprüft, ob jede App erreichbar ist; bei Apps mit eigener Datenbank zusätzlich die Adresse unter „Datenbank mitprüfen“,
- werden Einträge entfernt, die länger als 30 Tage im Papierkorb liegen.
Optional kann eine Umgebungsvariable `CRON_SECRET` gesetzt werden; dann nimmt der Endpunkt nur
noch Aufrufe von Vercel an.

## Grenzen

- Unterrichtsmaterial (PowerPoints, Arbeitsblätter usw.) bis 50 MB pro Datei, direkt zu Supabase hochgeladen.
  Im kostenlosen Plan stehen insgesamt etwa 1 GB Speicher zur Verfügung.
- Spickzettel und Vorschaubilder bis 4 MB (Bilder werden beim Hochladen automatisch verkleinert).
- Ein gemeinsames Passwort für alle. Der eingegebene Name dient nur zur Anzeige, wer etwas eingetragen hat.
