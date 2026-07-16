// ============================================================
// MODE ÉDITION SUR PAGE — Les Acacias
// ------------------------------------------------------------
// N'apparaît QUE pour un admin connecté (session créée sur
// admin.html, dans ce même navigateur). Les visiteurs normaux
// ne chargent rien de tout ceci — le script s'arrête à la
// première vérification.
//
// En mode édition :
//   · cliquer un texte  → le modifier directement (langue affichée) ;
//   · cliquer une photo → la remplacer ;
//   · cliquer un jour du calendrier → le bloquer / débloquer
//     (les jours venant d'Airbnb/Booking ne sont pas modifiables) ;
//   · « Enregistrer » → le site public est à jour immédiatement.
// Les galeries photo et les tarifs se gèrent dans l'Admin complet.
// ============================================================
(async function () {
  const conf = window.ACACIAS_SUPABASE || {};
  if (!conf.url || !conf.anonKey) return;

  // Pas de session admin dans ce navigateur → on ne charge rien.
  let hasToken = false;
  try { hasToken = Object.keys(localStorage).some((k) => k.startsWith('sb-') && k.includes('auth-token')); } catch (_) {}
  if (!hasToken) return;

  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  const sb = createClient(conf.url, conf.anonKey);
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return;

  const content = await (window.ACACIAS_CONTENT_READY || Promise.resolve({}));
  content.texts = content.texts || {};
  content.photos = content.photos || {};
  content.photos.galleries = content.photos.galleries || {};
  content.blocks = content.blocks || {};

  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'fr');

  // ---------- Barre d'outils ----------
  const bar = document.createElement('div');
  bar.className = 'edit-toolbar';
  bar.innerHTML = `
    <button type="button" class="et-toggle">✎ Modifier la page</button>
    <button type="button" class="et-save" hidden>Enregistrer</button>
    <a href="admin.html" class="et-admin">Admin complet →</a>
    <span class="et-status"></span>`;
  document.body.appendChild(bar);
  const toggleBtn = bar.querySelector('.et-toggle');
  const saveBtn = bar.querySelector('.et-save');
  const statusEl = bar.querySelector('.et-status');
  const status = (msg) => { statusEl.textContent = msg; };

  let editing = false;
  let dirty = false;
  const snapshots = new Map();
  const markDirty = () => { dirty = true; saveBtn.hidden = false; };

  function enterEdit() {
    editing = true;
    document.body.classList.add('acacias-editing');
    toggleBtn.textContent = '✕ Quitter l’édition';
    status('Cliquez un texte pour le corriger, une photo pour la remplacer, un jour du calendrier pour le bloquer.');
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      if (['OPTION', 'SELECT', 'INPUT', 'TEXTAREA'].includes(el.tagName)) return;
      el.setAttribute('contenteditable', 'true');
      if (!snapshots.has(el)) snapshots.set(el, el.textContent);
      el.addEventListener('input', markDirty);
    });
  }

  function exitEdit() {
    editing = false;
    document.body.classList.remove('acacias-editing');
    toggleBtn.textContent = '✎ Modifier la page';
    status(dirty ? '⚠ Modifications non enregistrées — cliquez Enregistrer.' : '');
    document.querySelectorAll('[contenteditable]').forEach((el) => el.removeAttribute('contenteditable'));
  }

  toggleBtn.addEventListener('click', () => (editing ? exitEdit() : enterEdit()));

  // En mode édition, les liens ne naviguent plus (on édite, on ne visite pas)
  document.addEventListener('click', (e) => {
    if (!editing) return;
    const a = e.target.closest('a');
    if (a && !a.closest('.edit-toolbar')) e.preventDefault();
  }, true);

  // Les galeries se gèrent dans l'admin complet — on neutralise leur clic
  document.addEventListener('click', (e) => {
    if (!editing) return;
    if (e.target.closest('.apt-gallery, .photo-strip')) {
      e.preventDefault();
      e.stopPropagation();
      status('Les galeries photo se gèrent dans « Admin complet ».');
    }
  }, true);

  // ---------- Photos (héros, lieu, tuiles, couvertures) ----------
  const photoInput = document.createElement('input');
  photoInput.type = 'file';
  photoInput.accept = 'image/*';
  photoInput.hidden = true;
  document.body.appendChild(photoInput);
  let photoTarget = null;

  document.addEventListener('click', (e) => {
    if (!editing) return;
    const el = e.target.closest('[data-photo]');
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    photoTarget = el;
    photoInput.click();
  }, true);

  photoInput.addEventListener('change', async () => {
    const file = photoInput.files[0];
    if (!file || !photoTarget) return;
    status('Envoi de la photo…');
    try {
      const ext = ((file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')) || 'jpg';
      const path = `site/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await sb.storage.from('photos').upload(path, file, { cacheControl: '31536000' });
      if (error) throw error;
      const url = sb.storage.from('photos').getPublicUrl(path).data.publicUrl;
      const key = photoTarget.dataset.photo;
      content.photos[key] = url;
      document.querySelectorAll(`[data-photo="${key}"]`).forEach((el) => {
        if (el.classList.contains('apt-card-photo') || el.classList.contains('property-tile')) {
          el.style.setProperty('--cover', `url('${url}')`);
        } else {
          el.style.backgroundImage = `url('${url}')`;
        }
      });
      markDirty();
      status('Photo remplacée — pensez à Enregistrer.');
    } catch (err) {
      status('Échec de l’envoi : ' + (err.message || err));
    }
    photoInput.value = '';
  });

  // ---------- Calendrier : bloquer / débloquer un jour ----------
  document.addEventListener('click', (e) => {
    if (!editing) return;
    const day = e.target.closest('.cal-day');
    if (!day || !day.dataset.date || day.classList.contains('past')) return;
    if (day.classList.contains('busy') && !day.classList.contains('manual')) {
      status('Cette date vient d’Airbnb/Booking — elle se libère sur la plateforme, pas ici.');
      return;
    }
    const cal = (window.ACACIAS_CALS || []).find((c) => c.el.contains(day));
    if (!cal) return;
    const d = day.dataset.date;
    const next = new Date(Date.parse(d) + 86400000).toISOString().slice(0, 10);
    const i = cal.manual.findIndex((r) => r.start <= d && d < r.end);
    if (i >= 0) {
      // Débloquer ce jour (en découpant la période si nécessaire)
      const r = cal.manual.splice(i, 1)[0];
      if (r.start < d) cal.manual.push({ start: r.start, end: d });
      if (next < r.end) cal.manual.push({ start: next, end: r.end });
      status('Jour débloqué — pensez à Enregistrer.');
    } else {
      cal.manual.push({ start: d, end: next });
      status('Jour bloqué — pensez à Enregistrer.');
    }
    content.blocks[cal.apt] = cal.manual;
    cal.render();
    markDirty();
  }, true);

  // ---------- Enregistrement ----------
  saveBtn.addEventListener('click', async () => {
    const lg = lang();
    snapshots.forEach((original, el) => {
      if (!document.contains(el)) return;
      const now = el.textContent;
      if (now === original) return;
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      content.texts[key] = content.texts[key] || {};
      content.texts[key][lg] = now.trim();
      if (typeof translations !== 'undefined' && translations[lg]) translations[lg][key] = now.trim();
      snapshots.set(el, now);
    });

    status('Enregistrement…');
    const ts = new Date().toISOString();
    const { error } = await sb.from('site_content').upsert([
      { key: 'texts', value: content.texts, updated_at: ts },
      { key: 'photos', value: content.photos, updated_at: ts },
      { key: 'blocks', value: content.blocks, updated_at: ts },
    ]);
    if (error) {
      status('Échec : ' + error.message + ' (connecté avec une adresse autorisée ?)');
      return;
    }
    dirty = false;
    saveBtn.hidden = true;
    status('Enregistré ✓ — le site public est à jour.');
  });
})();
