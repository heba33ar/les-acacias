// ============================================================
// Disponibilités — lecture seule des calendriers Airbnb / Booking
// (et Abritel si vous voulez), au format iCal.
//
// Configuration : sur Vercel, créez une variable d'environnement
// par appartement, avec la ou les adresses iCal séparées par des
// virgules :
//   ICAL_APT1 = https://airbnb.../calendar.ics, https://booking.../xxx.ics
//   ICAL_APT2 = …
//   ICAL_APT3 = …
//
// Le résultat est mis en cache 1 heure : aucune donnée n'est
// stockée, rien n'est modifiable — lecture seule.
//
// GET /api/availability?apartment=1&checkin=2026-08-01&checkout=2026-08-05
//   → { configured: true, available: true/false }
// GET /api/availability?apartment=1&from=2026-08-01&to=2027-02-01
//   → { configured: true, busy: [{start, end}, …] }   (pour le calendrier)
// ============================================================

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Transforme "DTSTART;VALUE=DATE:20260801" (ou avec heure) en "2026-08-01"
function icsDate(line) {
  const m = line.match(/:(\d{8})/);
  if (!m) return null;
  return `${m[1].slice(0, 4)}-${m[1].slice(4, 6)}-${m[1].slice(6, 8)}`;
}

// Extrait les périodes occupées d'un fichier iCal.
// DTEND est exclusif (comme une date de départ) — c'est la norme iCal.
function parseIcs(text) {
  const lines = text.replace(/\r\n[ \t]/g, '').split(/\r?\n/);
  const events = [];
  let cur = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { cur = {}; continue; }
    if (line === 'END:VEVENT') {
      if (cur && cur.start && !cur.cancelled) {
        events.push({ start: cur.start, end: cur.end || cur.start });
      }
      cur = null;
      continue;
    }
    if (!cur) continue;
    if (line.startsWith('DTSTART')) cur.start = icsDate(line);
    else if (line.startsWith('DTEND')) cur.end = icsDate(line);
    else if (line.startsWith('STATUS') && line.includes('CANCELLED')) cur.cancelled = true;
  }
  return events;
}

export default async function handler(req, res) {
  const { apartment, checkin, checkout, from, to } = req.query;
  const aptId = parseInt(apartment, 10);
  if (![1, 2, 3].includes(aptId)) return res.status(400).json({ error: 'apartment' });

  const urls = (process.env[`ICAL_APT${aptId}`] || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // Pas encore configuré : le site le prend avec élégance (il n'affiche rien).
  if (!urls.length) return res.status(200).json({ configured: false });

  let busy;
  try {
    const texts = await Promise.all(urls.map(async (url) => {
      const r = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'les-acacias-site/1.0' },
      });
      if (!r.ok) throw new Error(`iCal ${r.status}: ${url}`);
      return r.text();
    }));
    busy = texts.flatMap(parseIcs);
  } catch (err) {
    // Un calendrier injoignable : mieux vaut ne rien affirmer que se tromper.
    console.error(err);
    return res.status(502).json({ error: 'feeds' });
  }

  // Rafraîchi au plus toutes les heures (cache du CDN Vercel)
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

  if (checkin && checkout) {
    if (!DATE_RE.test(checkin) || !DATE_RE.test(checkout) || checkout <= checkin) {
      return res.status(400).json({ error: 'dates' });
    }
    const available = !busy.some((e) => e.start < checkout && e.end > checkin);
    return res.status(200).json({ configured: true, available });
  }

  if (from && to) {
    if (!DATE_RE.test(from) || !DATE_RE.test(to)) return res.status(400).json({ error: 'dates' });
    const ranges = busy
      .filter((e) => e.start < to && e.end > from)
      .sort((a, b) => (a.start < b.start ? -1 : 1));
    return res.status(200).json({ configured: true, busy: ranges });
  }

  res.status(400).json({ error: 'params' });
}
