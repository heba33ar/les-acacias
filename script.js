/* ============================================================
   TARIFS ET RÈGLES — tout se règle ici (montants en euros)
   ------------------------------------------------------------
   Le prix par nuit s'entend pour 2 personnes ; chaque personne
   supplémentaire ajoute `extraGuestPerNight` € par nuit.
   ============================================================ */
const BOOKING_CONFIG = {
  // E-mail qui reçoit les demandes
  contactEmail: 'lesacacias30@gmail.com',

  // Taxe de séjour : par personne et par nuit
  touristTaxPerPersonPerNight: 3.3,

  // Dépôt de garantie (montant indicatif, simplement affiché —
  // retenu seulement en cas de dommages)
  securityDeposit: 290,

  // Prix de base pour 2 personnes ; supplément par personne au-delà
  baseGuests: 2,
  extraGuestPerNight: 30,

  // Réductions long séjour, en % sur l'hébergement
  weekDiscountPct: 10,   // dès 7 nuits
  monthDiscountPct: 15,  // dès 28 nuits

  // Événements et piscine (règlement sur place)
  eventPrice: 300,          // journée ou soirée événement
  poolPricePerPerson: 25,   // piscine, par personne et par créneau

  // Un appartement par numéro (correspond à data-apt dans index.html)
  apartments: {
    1: { name: 'T3 Confort',  name_en: 'T3 Confort',  maxGuests: 6, nightlyRate: 150, cleaningFee: 40, minNights: 1 },
    2: { name: 'T3 Terrasse', name_en: 'T3 Terrasse', maxGuests: 6, nightlyRate: 130, cleaningFee: 40, minNights: 1 },
    3: { name: 'T2 Terrasse', name_en: 'T2 Terrasse', maxGuests: 4, nightlyRate: 110, cleaningFee: 40, minNights: 1 },
  },
};

// Affiche « Dès X € / nuit » partout où un élément porte data-apt-price.
const PRICE_T = {
  fr: {
    short: (r) => `Dès ${r} € / nuit`,
    long: (r, b, x) => `Dès ${r} € par nuit pour ${b} personnes · +${x} € par nuit et par personne supplémentaire`,
    event: (p) => `${p} € la journée`,
    pool: (p) => `${p} € par personne · la journée`,
  },
  en: {
    short: (r) => `From €${r} / night`,
    long: (r, b, x) => `From €${r} per night for ${b} guests · +€${x} per night per extra guest`,
    event: (p) => `€${p} for the day`,
    pool: (p) => `€${p} per person · per day`,
  },
};
function fillPrices(lang) {
  const t = PRICE_T[lang] || PRICE_T.fr;
  document.querySelectorAll('[data-apt-price]').forEach((el) => {
    const apt = BOOKING_CONFIG.apartments[el.dataset.aptPrice];
    if (!apt || !apt.nightlyRate) { el.textContent = ''; return; }
    el.textContent = el.dataset.priceFormat === 'long'
      ? t.long(apt.nightlyRate, BOOKING_CONFIG.baseGuests, BOOKING_CONFIG.extraGuestPerNight)
      : t.short(apt.nightlyRate);
  });
  document.querySelectorAll('[data-flat-price]').forEach((el) => {
    el.textContent = el.dataset.flatPrice === 'event'
      ? t.event(BOOKING_CONFIG.eventPrice)
      : t.pool(BOOKING_CONFIG.poolPricePerPerson);
  });
}

/* ============================================================
   CONTENU MODIFIABLE DEPUIS L'ESPACE ADMIN (admin.html)
   ------------------------------------------------------------
   Si config.js contient les accès Supabase, le site charge les
   textes, photos et tarifs personnalisés (lecture seule).
   Sinon — ou hors ligne — il garde ceux écrits dans ce fichier.
   ============================================================ */
const SITE_DB = window.ACACIAS_SUPABASE || {};
// Tolère une URL collée avec /rest/v1/ ou un / final
if (SITE_DB.url) SITE_DB.url = SITE_DB.url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

// Promesse partagée : le contenu personnalisé (textes/photos/tarifs/blocages),
// utilisée aussi par le calendrier et le mode édition (edit.js).
window.ACACIAS_CONTENT_READY = (SITE_DB.url && SITE_DB.anonKey)
  ? fetch(`${SITE_DB.url}/rest/v1/site_content?select=key,value`, {
      headers: { apikey: SITE_DB.anonKey, Authorization: `Bearer ${SITE_DB.anonKey}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => Object.fromEntries((rows || []).map((r) => [r.key, r.value])))
      .catch(() => ({}))
  : Promise.resolve({});

window.ACACIAS_CONTENT_READY.then((content) => {
  window.ACACIAS_CONTENT = content;
  if (Object.keys(content).length) applySiteContent(content);
});

function applySiteContent(content) {
  // Textes (FR/EN) — remplacent ceux du dictionnaire ci-dessous
  if (content.texts) {
    Object.entries(content.texts).forEach(([key, v]) => {
      if (!v || typeof v !== 'object') return;
      if (v.fr) translations.fr[key] = v.fr;
      if (v.en) translations.en[key] = v.en;
    });
  }

  // Tarifs
  if (content.prices) {
    const p = content.prices;
    ['extraGuestPerNight', 'touristTaxPerPersonPerNight', 'eventPrice', 'poolPricePerPerson',
     'securityDeposit', 'weekDiscountPct', 'monthDiscountPct'].forEach((k) => {
      if (typeof p[k] === 'number') BOOKING_CONFIG[k] = p[k];
    });
    if (p.apartments) {
      Object.entries(p.apartments).forEach(([id, a]) => {
        const apt = BOOKING_CONFIG.apartments[id];
        if (!apt || !a) return;
        if (typeof a.nightlyRate === 'number') apt.nightlyRate = a.nightlyRate;
        if (typeof a.cleaningFee === 'number') apt.cleaningFee = a.cleaningFee;
      });
    }
  }

  // Photos : éléments marqués data-photo + galeries des appartements
  if (content.photos) {
    const ph = content.photos;
    document.querySelectorAll('[data-photo]').forEach((el) => {
      const key = el.dataset.photo;
      let url = ph[key] || null;
      if (!url && key.startsWith('cover-')) {
        const list = ph.galleries && ph.galleries['apartment-' + key.slice(6)];
        url = (Array.isArray(list) && list[0]) || null;
      }
      if (!url) return;
      if (el.classList.contains('apt-card-photo') || el.classList.contains('property-tile')) {
        el.style.setProperty('--cover', `url('${url}')`);
      } else {
        el.style.backgroundImage = `url('${url}')`;
      }
    });
    if (ph.galleries) {
      document.querySelectorAll('.apt-gallery').forEach((c) => {
        const list = ph.galleries[c.dataset.folder];
        if (Array.isArray(list) && list.length) buildGalleryFromUrls(c, list);
      });
    }
  }

  // Ré-applique la langue courante (textes + prix affichés)
  setLanguage(document.documentElement.lang === 'en' ? 'en' : 'fr');
  document.dispatchEvent(new CustomEvent('acacias:content'));
}

// Reconstruit une galerie à partir d'une liste d'adresses de photos
// (photos envoyées depuis l'espace admin).
function buildGalleryFromUrls(container, urls) {
  container.innerHTML = '';
  urls.forEach((url, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.url = url;
    btn.setAttribute('aria-label', `Photo ${i + 1}`);
    const img = document.createElement('img');
    img.alt = `Les Acacias — photo ${i + 1}`;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = url;
    btn.appendChild(img);
    btn.addEventListener('click', () => {
      const set = [...container.querySelectorAll('button')].map((b) => b.dataset.url);
      openLightbox(set, set.indexOf(url));
    });
    container.appendChild(btn);
  });
}

const translations = {
  fr: {
    'brand.sub': 'Caveirac · Gard',
    'nav.apartments': 'Les appartements',
    'nav.domaine': 'Le domaine',
    'nav.location': 'Le lieu',
    'nav.contact': 'Contact',
    'nav.events': 'Événements',
    'nav.pool': 'Piscine',
    'nav.back': '← Retour à l’accueil',
    'hero.eyebrow': 'Petite résidence · Aux portes de Nîmes',
    'hero.title': 'Trois appartements de charme, piscine à débordement et jardin baigné de soleil.',
    'hero.lede': "Aux portes de Nîmes, entre garrigue et soleil méditerranéen, Les Acacias vous accueille dans un écrin résidentiel paisible au cœur de Caveirac. Trois appartements de charme, une piscine à débordement à l'eau salée et un jardin baigné de lumière vous invitent à savourer le temps qui ralentit.",
    'hero.f1': 'Piscine à débordement, eau salée',
    'hero.f2': 'Climatisation · Wi-Fi · Parking privé',
    'hero.f3': '5 min de Nîmes et de ses arènes',
    'hero.reserve': 'Réserver',
    'hero.discover': 'Découvrir les logements',
    'apt.eyebrow': 'Les logements',
    'apt.title': 'Trois appartements indépendants',
    'apt.intro': "Trois appartements climatisés, soigneusement aménagés, chacun avec son entrée privative, sa terrasse ouverte sur la cour intérieure, son coin salon, sa cuisine entièrement équipée et sa salle de bains privative. Linge de maison et serviettes fournis, Wi-Fi offert, parking privé clos sur place.",
    'apt.more': "Voir l'appartement →",
    'apt.1.name': 'T3 Confort',
    'apt.1.meta': '6 personnes · 2 chambres · Bain + douche',
    'apt.1.card': "Un T3 spacieux jusqu'à six personnes, deux chambres et une salle de bains avec baignoire et douche.",
    'apt.1.desc': "Un appartement spacieux pouvant accueillir jusqu'à six personnes, deux chambres séparées, salon lumineux et salle de bains équipée d'une baignoire et d'une douche — idéal pour une famille ou des amis voyageant ensemble.",
    'apt.2.name': 'T3 Terrasse',
    'apt.2.meta': "6 personnes · 2 chambres · Douche à l'italienne",
    'apt.2.card': "Un T3 de deux chambres jusqu'à six voyageurs, ouvert sur le jardin et la piscine.",
    'apt.2.desc': "Un appartement de deux chambres pouvant accueillir jusqu'à six voyageurs, doté d'une douche à l'italienne, parfait pour profiter du jardin et de la piscine en toute tranquillité.",
    'apt.3.name': 'T2 Terrasse',
    'apt.3.meta': '4 personnes · 1 chambre · Terrasse',
    'apt.3.card': "Un T2 intime jusqu'à quatre personnes, avec douche à l'italienne et terrasse ombragée.",
    'apt.3.desc': "Un appartement plus intime d'une chambre, pour deux à quatre personnes, avec douche à l'italienne et terrasse ombragée — idéal pour une escapade en couple.",
    'det.facilities': 'Équipements de l’appartement',
    'det.gallery': 'Photos',
    'det.book': 'Réserver cet appartement',
    'det.f1': 'Cuisine équipée — four, micro-ondes, lave-vaisselle',
    'det.f2': 'Machine à café et bouilloire',
    'det.f3': 'Climatisation et chauffage',
    'det.f4': 'Wi-Fi gratuit (30 Mb/s)',
    'det.f5': 'Télévision écran plat · Netflix',
    'det.f6': 'Salle de bains privative · sèche-cheveux',
    'det.f7': 'Entrée privée · terrasse ou balcon',
    'det.f8': 'Linge de maison et serviettes fournis',
    'det.f9': 'Accès à la piscine et au jardin',
    'det.f10': 'Parking privé gratuit sur place',
    'det.f11': 'Fer à repasser et étendoir',
    'det.f12': 'Chaise haute et lit bébé sur demande',
    'dom.eyebrow': 'Les espaces partagés',
    'dom.title': 'Le domaine',
    'dom.intro': "Au-delà des appartements, Les Acacias, c'est un cadre partagé pensé pour le repos : jardin méditerranéen, piscine à débordement, espaces extérieurs et services pratiques pour un séjour sans souci.",
    'dom.garden': 'Le jardin',
    'dom.kitchen': "Cuisine d'été",
    'dom.laundry': 'Buanderie',
    'dom.f1': "Piscine à débordement à l'eau salée — ouverte toute l'année",
    'dom.f2': 'Jardin paysager, terrasses et chaises longues',
    'dom.f3': "Cuisine d'été extérieure",
    'dom.f4': 'Buanderie partagée (lave-linge)',
    'dom.f5': 'Climatisation dans chaque logement',
    'dom.f6': 'Wi-Fi haut débit gratuit',
    'dom.f7': 'Parking privé clos sur place',
    'dom.f8': 'Barbecue / plancha',
    'dom.f9': 'Linge de maison et serviettes fournis',
    'loc.eyebrow': 'Le village',
    'loc.title': 'Caveirac, à cinq minutes de Nîmes',
    'loc.p1': "Niché Chemin des Acacias à Caveirac (Gard), le domaine se trouve à seulement cinq minutes de Nîmes et de ses arènes romaines. Le centre du village, ses commerces et ses cafés sont à quelques pas à peine.",
    'loc.p2': "À dix kilomètres du Parc des expositions de Nîmes, à dix-huit kilomètres de l'aéroport Nîmes Alès Camargue Cévennes et à moins de quarante kilomètres des arènes d'Arles, Les Acacias forment une base idéale pour rayonner entre Provence, Camargue et garrigue cévenole.",
    'loc.nimes': '5 min en voiture',
    'loc.expo': '10 km',
    'loc.airport': '18 km',
    'loc.arles': '39 km',
    'loc.pont': '30 min',
    'loc.grau': '40 min',
    'res.eyebrow': 'Réservation directe',
    'res.title': 'Réserver votre séjour',
    'res.text': "Choisissez votre appartement et vos dates pour obtenir une estimation immédiate, puis envoyez-nous votre demande. Nous confirmons la disponibilité et vous répondons rapidement.",
    'res.note': 'Vous pouvez aussi réserver via Airbnb, Booking ou Abritel.',
    'res.policy': "Demande sans engagement et sans paiement en ligne : nous confirmons la disponibilité et le tarif par e-mail. Pour bloquer vos dates, un acompte de 50 % est demandé par virement ; le solde se règle sur place, par virement instantané ou en espèces. Les disponibilités affichées sont synchronisées avec nos calendriers Airbnb et Booking.",
    'book.apt': 'Appartement',
    'book.checkin': 'Arrivée',
    'book.checkout': 'Départ',
    'book.guests': 'Voyageurs',
    'book.name': 'Votre nom',
    'book.email': 'E-mail',
    'book.phone': 'Téléphone',
    'book.message': 'Message (optionnel)',
    'book.submit': 'Envoyer ma demande',
    'exp.eyebrow': 'Aussi aux Acacias',
    'exp.title': 'Événements & piscine',
    'exp.intro': "Le domaine se privatise pour vos beaux moments, et la piscine s'ouvre à la journée.",
    'exp.evt.name': 'Vos événements',
    'exp.evt.card': "Anniversaire, fête de famille, shooting… le jardin et la piscine se privatisent à la journée.",
    'exp.pool.name': 'La piscine à la journée',
    'exp.pool.card': "Une journée au bord de la piscine à débordement, entre garrigue et soleil du Gard.",
    'exp.more': 'Découvrir →',
    'evt.title': 'Vos événements aux Acacias',
    'evt.meta': 'Jardin · Piscine · Cuisine d’été',
    'evt.desc': "Anniversaire, fête de famille, baptême, shooting photo… Le temps d'une journée ou d'une soirée, le jardin méditerranéen, la piscine à débordement et la cuisine d'été se privatisent pour vous. Dites-nous ce que vous imaginez : nous vous confirmons la disponibilité et les détails par e-mail.",
    'evt.cond': 'Conditions & inclus',
    'evt.i1': "Piscine, jardin, cuisine d'été et barbecue inclus (charbon non fourni)",
    'evt.i2': 'Ménage inclus',
    'evt.i3': 'Journée 9h – 18h ou soirée 19h – minuit (horaires adaptables sur demande)',
    'evt.i4': "Jusqu'à 12 personnes",
    'evt.i5': 'Caution de 200 €',
    'evt.i6': 'Uniquement lorsque la résidence est libre de voyageurs',
    'evt.i7': "Mineurs uniquement accompagnés d'un adulte",
    'evt.form.title': 'Demander une date',
    'evt.form.text': "Indiquez la date souhaitée et quelques mots sur votre événement — réponse rapide, sans engagement.",
    'evt.date': 'Date souhaitée',
    'evt.slot': 'Créneau',
    'evt.slot.day': 'Journée · 9h – 18h',
    'evt.slot.evening': 'Soirée · 19h – minuit',
    'evt.slot.other': 'Autre (à préciser en message)',
    'evt.type': "Type d'événement",
    'evt.type.ph': 'Anniversaire, fête de famille…',
    'evt.guests': 'Nombre de personnes',
    'evt.note': 'Nous confirmons la disponibilité par e-mail. Règlement sur place : virement instantané ou espèces.',
    'evt.submit': 'Envoyer ma demande',
    'pool.title': 'La piscine à la journée',
    'pool.meta': 'Piscine à débordement · Eau salée · Chaises longues',
    'pool.desc': "Offrez-vous une demi-journée au bord de notre piscine à débordement à l'eau salée, transats au soleil et jardin méditerranéen. Créneaux de 9h à 13h ou de 13h à 18h, selon disponibilité.",
    'pool.cond': 'Bon à savoir',
    'pool.i1': 'Créneaux : 9h – 13h ou 13h – 18h',
    'pool.i2': "Jusqu'à 12 personnes par créneau",
    'pool.i3': 'Transats fournis — pensez à apporter vos serviettes',
    'pool.i4': "Mineurs uniquement accompagnés d'un adulte",
    'pool.i5': 'Règlement sur place : virement instantané ou espèces',
    'pool.form.title': 'Réserver mon créneau',
    'pool.form.text': "Indiquez la date, le créneau et le nombre de personnes — nous confirmons la disponibilité rapidement. Vous pouvez aussi appeler le 06 62 51 77 65.",
    'pool.date': 'Date souhaitée',
    'pool.slot': 'Créneau',
    'pool.slot.am': 'Matin · 9h – 13h',
    'pool.slot.pm': 'Après-midi · 13h – 18h',
    'pool.guests': 'Nombre de personnes',
    'pool.total': 'Total estimé',
    'pool.note': "Accès selon disponibilité — nous confirmons par e-mail ou par téléphone. Règlement sur place : virement instantané ou espèces.",
    'pool.submit': 'Envoyer ma demande',
    'cal.title': 'Disponibilités',
    'cal.free': 'Disponible',
    'cal.busy': 'Occupé',
    'cal.note': 'Calendrier synchronisé avec Airbnb et Booking, mis à jour toutes les heures.',
    'rules.eyebrow': 'Bon à savoir',
    'rules.title': 'Informations pratiques',
    'rules.arrival': 'Arrivée & départ',
    'rules.checkin': 'Arrivée de 15h à 19h',
    'rules.checkout': 'Départ de 8h à 11h',
    'rules.id': "Pièce d'identité demandée à l'arrivée",
    'rules.eta': "Merci d'indiquer votre heure d'arrivée à l'avance",
    'rules.living': 'Vie sur place',
    'rules.smoking': 'Établissement entièrement non-fumeurs',
    'rules.pets': 'Animaux non admis',
    'rules.parties': 'Fêtes non autorisées lors des séjours',
    'rules.quiet': 'Calme demandé entre 22h et 8h',
    'rules.family': 'Familles & caution',
    'rules.children': 'Enfants bienvenus · lit bébé sur demande',
    'rules.minors': "Moins de 18 ans accompagnés d'un adulte",
    'rules.deposit': "Dépôt de garantie : jusqu'à 290 € en cas de dommages",
    'rules.payment': 'Règlement : virement instantané ou espèces',
    'contact.eyebrow': 'À votre écoute',
    'contact.title': 'Nous contacter',
    'contact.phone': 'Téléphone',
    'contact.email': 'E-mail',
    'contact.address': 'Adresse',
  },
  en: {
    'brand.sub': 'Caveirac · South of France',
    'nav.apartments': 'The apartments',
    'nav.domaine': 'The property',
    'nav.location': 'The place',
    'nav.contact': 'Contact',
    'nav.events': 'Events',
    'nav.pool': 'The pool',
    'nav.back': '← Back to home',
    'hero.eyebrow': 'A small residence · Minutes from Nîmes',
    'hero.title': 'Three character apartments, an infinity pool and a garden full of sunshine.',
    'hero.lede': "Just minutes from Nîmes, between sun-warmed garrigue and the gentle south of France, Les Acacias welcomes you to a quiet residential haven in the heart of Caveirac. Three character apartments, an infinity saltwater pool and a light-filled garden invite you to slow down and breathe.",
    'hero.f1': 'Infinity saltwater pool',
    'hero.f2': 'Air conditioning · Wi-Fi · Private parking',
    'hero.f3': '5 minutes from Nîmes and its Roman arena',
    'hero.reserve': 'Book now',
    'hero.discover': 'See the apartments',
    'apt.eyebrow': 'The apartments',
    'apt.title': 'Three independent apartments',
    'apt.intro': "Three air-conditioned apartments, thoughtfully appointed, each with its own private entrance, terrace opening onto the inner courtyard, sitting area, fully equipped kitchen and private bathroom. Linens and towels provided, Wi-Fi is free, and a private enclosed parking space awaits you on site.",
    'apt.more': 'View the apartment →',
    'apt.1.name': 'T3 Confort',
    'apt.1.meta': '6 guests · 2 bedrooms · Bath + shower',
    'apt.1.card': "A spacious two-bedroom apartment for up to six guests, with a bathroom featuring both a bath and a shower.",
    'apt.1.desc': "A spacious apartment sleeping up to six, with two separate bedrooms, a bright living room and a bathroom featuring both a bath and a shower — ideal for a family or friends travelling together.",
    'apt.2.name': 'T3 Terrasse',
    'apt.2.meta': '6 guests · 2 bedrooms · Walk-in shower',
    'apt.2.card': "A two-bedroom apartment for up to six guests, opening onto the garden and pool.",
    'apt.2.desc': "A two-bedroom apartment sleeping up to six guests, with a walk-in shower, perfect for enjoying the garden and pool in peaceful comfort.",
    'apt.3.name': 'T2 Terrasse',
    'apt.3.meta': '4 guests · 1 bedroom · Terrace',
    'apt.3.card': "An intimate one-bedroom apartment for up to four, with a walk-in shower and a shaded terrace.",
    'apt.3.desc': "A more intimate one-bedroom apartment for two to four guests, with a walk-in shower and a shaded terrace — perfect for a couple's getaway.",
    'det.facilities': 'Apartment amenities',
    'det.gallery': 'Photos',
    'det.book': 'Book this apartment',
    'det.f1': 'Fitted kitchen — oven, microwave, dishwasher',
    'det.f2': 'Coffee machine and kettle',
    'det.f3': 'Air conditioning and heating',
    'det.f4': 'Free Wi-Fi (30 Mb/s)',
    'det.f5': 'Flat-screen TV · Netflix',
    'det.f6': 'Private bathroom · hairdryer',
    'det.f7': 'Private entrance · terrace or balcony',
    'det.f8': 'Linens and towels provided',
    'det.f9': 'Access to pool and garden',
    'det.f10': 'Free private parking on site',
    'det.f11': 'Iron and drying rack',
    'det.f12': 'High chair and cot on request',
    'dom.eyebrow': 'Shared spaces',
    'dom.title': 'The property',
    'dom.intro': "Beyond the apartments, Les Acacias is a shared setting designed for rest: a Mediterranean garden, an infinity pool, outdoor spaces and practical services for a carefree stay.",
    'dom.garden': 'The garden',
    'dom.kitchen': 'Outdoor kitchen',
    'dom.laundry': 'Laundry room',
    'dom.f1': 'Infinity saltwater pool — open all year',
    'dom.f2': 'Landscaped garden, terraces and sun loungers',
    'dom.f3': 'Outdoor summer kitchen',
    'dom.f4': 'Shared laundry room (washing machine)',
    'dom.f5': 'Air conditioning in every apartment',
    'dom.f6': 'Free high-speed Wi-Fi',
    'dom.f7': 'Private enclosed parking on site',
    'dom.f8': 'Barbecue / plancha',
    'dom.f9': 'Linens and towels provided',
    'loc.eyebrow': 'The village',
    'loc.title': 'Caveirac, five minutes from Nîmes',
    'loc.p1': "Set on Chemin des Acacias in Caveirac (Gard), the property is just five minutes from Nîmes and its Roman arena. The village centre, with its shops and cafés, is only a short stroll away.",
    'loc.p2': "Ten kilometres from the Nîmes Exhibition Park, eighteen kilometres from Nîmes Alès Camargue Cévennes airport, and under forty kilometres from the arenas of Arles, Les Acacias is the perfect base for exploring Provence, the Camargue and the Cévennes foothills.",
    'loc.nimes': '5 min by car',
    'loc.expo': '10 km',
    'loc.airport': '18 km',
    'loc.arles': '39 km',
    'loc.pont': '30 min',
    'loc.grau': '40 min',
    'res.eyebrow': 'Book direct',
    'res.title': 'Book your stay',
    'res.text': "Choose your apartment and dates for an instant estimate, then send us your request. We'll confirm availability and reply quickly.",
    'res.note': 'You can also book via Airbnb, Booking or Abritel.',
    'res.policy': "No-commitment request, no online payment: we confirm availability and the exact rate by email. To secure your dates, a 50% deposit is requested by bank transfer; the balance is paid on site, by instant transfer or cash. The availability shown is synced with our Airbnb and Booking calendars.",
    'book.apt': 'Apartment',
    'book.checkin': 'Check-in',
    'book.checkout': 'Check-out',
    'book.guests': 'Guests',
    'book.name': 'Your name',
    'book.email': 'Email',
    'book.phone': 'Phone',
    'book.message': 'Message (optional)',
    'book.submit': 'Send my request',
    'exp.eyebrow': 'Also at Les Acacias',
    'exp.title': 'Events & the pool',
    'exp.intro': 'The property can be privatised for your special moments, and the pool opens for the day.',
    'exp.evt.name': 'Your events',
    'exp.evt.card': 'Birthday, family celebration, photo shoot… the garden and pool are yours for the day.',
    'exp.pool.name': 'The pool, for a day',
    'exp.pool.card': 'A day by the infinity pool, between the garrigue and the southern sun.',
    'exp.more': 'Find out more →',
    'evt.title': 'Your events at Les Acacias',
    'evt.meta': 'Garden · Pool · Outdoor kitchen',
    'evt.desc': "Birthday, family celebration, christening, photo shoot… For a day or an evening, the Mediterranean garden, the infinity pool and the outdoor kitchen become yours. Tell us what you have in mind: we confirm availability and details by email.",
    'evt.cond': 'Conditions & included',
    'evt.i1': 'Pool, garden, outdoor kitchen and barbecue included (charcoal not provided)',
    'evt.i2': 'Cleaning included',
    'evt.i3': 'Day 9 am – 6 pm or evening 7 pm – midnight (times can be adjusted on request)',
    'evt.i4': 'Up to 12 people',
    'evt.i5': '€200 security deposit',
    'evt.i6': 'Only when the residence is free of staying guests',
    'evt.i7': 'Minors only when accompanied by an adult',
    'evt.form.title': 'Request a date',
    'evt.form.text': 'Tell us your preferred date and a few words about your event — quick reply, no commitment.',
    'evt.date': 'Preferred date',
    'evt.slot': 'Time slot',
    'evt.slot.day': 'Day · 9 am – 6 pm',
    'evt.slot.evening': 'Evening · 7 pm – midnight',
    'evt.slot.other': 'Other (please specify in the message)',
    'evt.type': 'Type of event',
    'evt.type.ph': 'Birthday, family celebration…',
    'evt.guests': 'Number of people',
    'evt.note': 'We confirm availability by email. Payment on site: instant bank transfer or cash.',
    'evt.submit': 'Send my request',
    'pool.title': 'The pool, for a day',
    'pool.meta': 'Infinity pool · Salt water · Sun loungers',
    'pool.desc': 'Treat yourself to a half-day by our infinity saltwater pool, sun loungers and Mediterranean garden. Slots from 9 am to 1 pm or 1 pm to 6 pm, subject to availability.',
    'pool.cond': 'Good to know',
    'pool.i1': 'Slots: 9 am – 1 pm or 1 pm – 6 pm',
    'pool.i2': 'Up to 12 people per slot',
    'pool.i3': 'Sun loungers provided — please bring your own towels',
    'pool.i4': 'Minors only when accompanied by an adult',
    'pool.i5': 'Payment on site: instant bank transfer or cash',
    'pool.form.title': 'Book my slot',
    'pool.form.text': 'Tell us the date, the slot and how many people — we confirm availability quickly. You can also call +33 6 62 51 77 65.',
    'pool.date': 'Preferred date',
    'pool.slot': 'Time slot',
    'pool.slot.am': 'Morning · 9 am – 1 pm',
    'pool.slot.pm': 'Afternoon · 1 pm – 6 pm',
    'pool.guests': 'Number of people',
    'pool.total': 'Estimated total',
    'pool.note': 'Access subject to availability — we confirm by email or phone. Payment on site: instant bank transfer or cash.',
    'pool.submit': 'Send my request',
    'cal.title': 'Availability',
    'cal.free': 'Available',
    'cal.busy': 'Booked',
    'cal.note': 'Calendar synced with Airbnb and Booking, refreshed every hour.',
    'rules.eyebrow': 'Good to know',
    'rules.title': 'Practical information',
    'rules.arrival': 'Check-in & check-out',
    'rules.checkin': 'Check-in from 3 pm to 7 pm',
    'rules.checkout': 'Check-out from 8 am to 11 am',
    'rules.id': 'Photo ID required at check-in',
    'rules.eta': 'Please let us know your arrival time in advance',
    'rules.living': 'Life on site',
    'rules.smoking': 'Entirely non-smoking property',
    'rules.pets': 'Pets are not allowed',
    'rules.parties': 'Parties are not allowed during stays',
    'rules.quiet': 'Quiet hours between 10 pm and 8 am',
    'rules.family': 'Families & deposit',
    'rules.children': 'Children welcome · cot on request',
    'rules.minors': 'Guests under 18 must be accompanied by an adult',
    'rules.deposit': 'Damage deposit: up to €290 in case of damage',
    'rules.payment': 'Payment: instant bank transfer or cash',
    'contact.eyebrow': 'At your service',
    'contact.title': 'Get in touch',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.address': 'Address',
  },
};

function setLanguage(lang) {
  document.documentElement.lang = lang;
  const dict = translations[lang] || translations.fr;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.textContent = dict[key];
  });
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  fillPrices(lang);
  try { localStorage.setItem('acacias-lang', lang); } catch (_) {}
}

document.querySelectorAll('.lang-btn').forEach((btn) => {
  btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});

const saved = (() => { try { return localStorage.getItem('acacias-lang'); } catch (_) { return null; } })();
// Français par défaut ; l'anglais uniquement si le visiteur l'a choisi.
const initial = saved === 'en' ? 'en' : 'fr';
setLanguage(initial);

document.getElementById('year').textContent = new Date().getFullYear();

// Nombre maxi d'images cherchées par dossier. Le site teste 01.jpg, 02.jpg…
// et masque automatiquement celles qui n'existent pas (ou que vous supprimez).
const PHOTOS_PER_FOLDER = 64;   // galeries d'appartement (photos/apartment-N/)
const STRIP_MAX = 12;           // bandeaux de photos (ex. photos/caveirac/)

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCounter = document.getElementById('lightbox-counter');
let currentSet = [];
let currentIndex = 0;

// Construit une galerie numérotée (01.jpg, 02.jpg, …) depuis un dossier donné,
// en masquant les images manquantes. Utilisé pour les appartements et les bandeaux.
function buildGallery(container, folder, count) {
  folder = folder || container.dataset.folder;
  for (let i = 1; i <= count; i++) {
    const url = `photos/${folder}/${String(i).padStart(2, '0')}.jpg`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.url = url;
    btn.setAttribute('aria-label', `Photo ${i}`);
    const img = document.createElement('img');
    img.alt = `Les Acacias — ${folder} photo ${i}`;
    img.loading = 'lazy';
    img.decoding = 'async';
    // Si l'image n'existe pas (supprimée ou jamais ajoutée), on retire la tuile.
    img.addEventListener('error', () => btn.remove(), { once: true });
    img.src = url;
    btn.appendChild(img);
    btn.addEventListener('click', () => {
      const set = [...container.querySelectorAll('button')].map(b => b.dataset.url);
      openLightbox(set, set.indexOf(url));
    });
    container.appendChild(btn);
  }
}

// Galeries d'appartement (64 photos max) sur les pages de détail.
document.querySelectorAll('.apt-gallery').forEach((c) => buildGallery(c, c.dataset.folder, PHOTOS_PER_FOLDER));
// Bandeaux de photos (ex. Caveirac) — dossier = data-gallery.
document.querySelectorAll('.photo-strip').forEach((c) => buildGallery(c, c.dataset.gallery, STRIP_MAX));

function openLightbox(set, i) {
  if (!lightbox || !set.length) return;
  currentSet = set;
  currentIndex = (i + set.length) % set.length;
  lightboxImg.src = currentSet[currentIndex];
  lightboxCounter.textContent = `${currentIndex + 1} / ${currentSet.length}`;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (lightbox) {
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev').addEventListener('click', () => openLightbox(currentSet, currentIndex - 1));
  document.getElementById('lightbox-next').addEventListener('click', () => openLightbox(currentSet, currentIndex + 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') openLightbox(currentSet, currentIndex - 1);
    else if (e.key === 'ArrowRight') openLightbox(currentSet, currentIndex + 1);
  });
}

/* ============================================================
   RÉSERVATION — estimation et demande par e-mail (version statique)
   Les tarifs se règlent dans BOOKING_CONFIG, en haut du fichier.
   ============================================================ */
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
  const $ = (id) => document.getElementById(id);
  const aptSel = $('book-apt'), checkin = $('book-checkin'), checkout = $('book-checkout');
  const guests = $('book-guests'), estBox = $('booking-estimate'), errBox = $('booking-error');

  const BOOK_T = {
    fr: {
      aptLabel: (a) => `${a.name} — ${a.maxGuests} pers.`,
      aptName: (a) => a.name,
      nights: (n) => `${n} nuit${n > 1 ? 's' : ''}`,
      lineNights: 'Hébergement', cleaning: 'Frais de ménage', tax: 'Taxe de séjour',
      extras: 'Personnes supplémentaires',
      discount: (p) => `Réduction long séjour (−${p} %)`,
      discountNote: (w, m) => `Réduction de ${w} % dès 7 nuits, ${m} % dès 28 nuits (sur l'hébergement).`,
      baseNote: (b, x) => `Tarif pour ${b} personnes — personne supplémentaire : ${x} € par nuit.`,
      total: 'Total estimé', deposit: (d) => `Dépôt de garantie : jusqu'à ${d} € en cas de dommages (rien à payer d'avance).`,
      tbd: 'Tarif communiqué sur demande — envoyez votre demande pour recevoir un devis.',
      errDates: 'Merci d’indiquer une date d’arrivée et de départ valides.',
      errOrder: 'La date de départ doit être après la date d’arrivée.',
      errPast: 'La date d’arrivée ne peut pas être dans le passé.',
      errMin: (n) => `Séjour minimum de ${n} nuits pour cet appartement.`,
      errGuests: (m) => `Cet appartement accueille au maximum ${m} voyageurs.`,
      errRequired: 'Merci de renseigner votre nom et votre e-mail.',
      subject: (a) => `Demande de réservation — ${a}`,
      checking: 'Vérification des disponibilités…',
      available: 'Ces dates sont disponibles ✓',
      unavailable: 'Ces dates ne sont pas disponibles pour cet appartement.',
    },
    en: {
      aptLabel: (a) => `${a.name_en} — up to ${a.maxGuests}`,
      aptName: (a) => a.name_en,
      nights: (n) => `${n} night${n > 1 ? 's' : ''}`,
      lineNights: 'Accommodation', cleaning: 'Cleaning fee', tax: 'Tourist tax',
      extras: 'Extra guests',
      discount: (p) => `Long-stay discount (−${p}%)`,
      discountNote: (w, m) => `${w}% off from 7 nights, ${m}% off from 28 nights (on accommodation).`,
      baseNote: (b, x) => `Rate for ${b} guests — each extra guest: €${x} per night.`,
      total: 'Estimated total', deposit: (d) => `Damage deposit: up to €${d} in case of damage (nothing to pay upfront).`,
      tbd: 'Rate provided on request — send your request to receive a quote.',
      errDates: 'Please enter valid check-in and check-out dates.',
      errOrder: 'Check-out must be after check-in.',
      errPast: 'Check-in cannot be in the past.',
      errMin: (n) => `Minimum stay of ${n} nights for this apartment.`,
      errGuests: (m) => `This apartment sleeps up to ${m} guests.`,
      errRequired: 'Please enter your name and email.',
      subject: (a) => `Booking request — ${a}`,
      checking: 'Checking availability…',
      available: 'These dates are available ✓',
      unavailable: 'These dates are not available for this apartment.',
    },
  };
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'fr');
  const eur = (n) => `${n.toLocaleString(lang() === 'en' ? 'en-GB' : 'fr-FR')} €`;

  function nightsBetween(a, b) {
    const d1 = new Date(a + 'T00:00:00'), d2 = new Date(b + 'T00:00:00');
    if (isNaN(d1) || isNaN(d2)) return null;
    return Math.round((d2 - d1) / 86400000);
  }

  // Garde les libellés du menu déroulant et le max voyageurs à jour
  function syncApartmentUI() {
    const t = BOOK_T[lang()];
    [...aptSel.options].forEach((opt) => {
      const apt = BOOKING_CONFIG.apartments[opt.value];
      if (apt) opt.textContent = t.aptLabel(apt);
    });
    const apt = BOOKING_CONFIG.apartments[aptSel.value];
    if (apt) guests.max = apt.maxGuests;
  }

  function computeEstimate() {
    const apt = BOOKING_CONFIG.apartments[aptSel.value];
    const n = nightsBetween(checkin.value, checkout.value);
    if (!apt || !n || n <= 0) return null;
    const g = Math.max(1, parseInt(guests.value, 10) || 1);
    const extraGuests = Math.max(0, g - BOOKING_CONFIG.baseGuests);
    const lodging = apt.nightlyRate * n;
    const extras = extraGuests * BOOKING_CONFIG.extraGuestPerNight * n;
    // Réduction long séjour sur l'hébergement (pas sur le ménage ni la taxe)
    let discountPct = 0;
    if (n >= 28) discountPct = BOOKING_CONFIG.monthDiscountPct;
    else if (n >= 7) discountPct = BOOKING_CONFIG.weekDiscountPct;
    const discount = Math.round((lodging + extras) * discountPct) / 100;
    const cleaning = apt.cleaningFee;
    const tax = Math.round(BOOKING_CONFIG.touristTaxPerPersonPerNight * g * n * 100) / 100;
    return { apt, n, g, extraGuests, lodging, extras, discountPct, discount, cleaning, tax, total: lodging + extras - discount + cleaning + tax };
  }

  function renderEstimate() {
    const t = BOOK_T[lang()];
    const e = computeEstimate();
    if (!e) { estBox.innerHTML = ''; return; }
    // Si aucun tarif n'est encore renseigné, on n'affiche pas de faux prix.
    if (e.apt.nightlyRate <= 0) {
      estBox.innerHTML = `<p class="est-note">${t.tbd}</p>`;
      return;
    }
    const rows = [
      [`${t.lineNights} (${t.nights(e.n)})`, eur(e.lodging)],
    ];
    if (e.extras > 0) rows.push([`${t.extras} (${e.extraGuests} × ${t.nights(e.n)})`, eur(e.extras)]);
    if (e.discount > 0) rows.push([t.discount(e.discountPct), `−${eur(e.discount)}`]);
    if (e.cleaning > 0) rows.push([t.cleaning, eur(e.cleaning)]);
    if (e.tax > 0) rows.push([`${t.tax} (${e.g} × ${e.n})`, eur(e.tax)]);
    let html = rows.map(([k, v]) => `<div class="est-line"><span>${k}</span><span>${v}</span></div>`).join('');
    html += `<div class="est-line est-total"><span>${t.total}</span><span>${eur(e.total)}</span></div>`;
    html += `<p class="est-note">${t.baseNote(BOOKING_CONFIG.baseGuests, BOOKING_CONFIG.extraGuestPerNight)}</p>`;
    html += `<p class="est-note">${t.discountNote(BOOKING_CONFIG.weekDiscountPct, BOOKING_CONFIG.monthDiscountPct)}</p>`;
    if (BOOKING_CONFIG.securityDeposit > 0) html += `<p class="est-note">${t.deposit(BOOKING_CONFIG.securityDeposit)}</p>`;
    estBox.innerHTML = html;
  }

  function showError(msg) { errBox.textContent = msg; errBox.hidden = false; }
  function clearError() { errBox.hidden = true; }

  function validate() {
    const t = BOOK_T[lang()];
    const apt = BOOKING_CONFIG.apartments[aptSel.value];
    if (!checkin.value || !checkout.value) return t.errDates;
    const n = nightsBetween(checkin.value, checkout.value);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (new Date(checkin.value + 'T00:00:00') < today) return t.errPast;
    if (n === null) return t.errDates;
    if (n <= 0) return t.errOrder;
    if (n < apt.minNights) return t.errMin(apt.minNights);
    if (parseInt(guests.value, 10) > apt.maxGuests) return t.errGuests(apt.maxGuests);
    if (!$('book-name').value.trim() || !$('book-email').value.trim()) return t.errRequired;
    return null;
  }

  function buildEmail() {
    const t = BOOK_T[lang()];
    const apt = BOOKING_CONFIG.apartments[aptSel.value];
    const e = computeEstimate();
    const L = lang() === 'en'
      ? { apt: 'Apartment', inDate: 'Check-in', outDate: 'Check-out', guests: 'Guests', name: 'Name', email: 'Email', phone: 'Phone', msg: 'Message', est: 'Estimated total' }
      : { apt: 'Appartement', inDate: 'Arrivée', outDate: 'Départ', guests: 'Voyageurs', name: 'Nom', email: 'E-mail', phone: 'Téléphone', msg: 'Message', est: 'Total estimé' };
    const lines = [
      `${L.apt}: ${t.aptName(apt)}`,
      `${L.inDate}: ${checkin.value}`,
      `${L.outDate}: ${checkout.value}`,
      `${L.guests}: ${guests.value}`,
      '',
      `${L.name}: ${$('book-name').value.trim()}`,
      `${L.email}: ${$('book-email').value.trim()}`,
      `${L.phone}: ${$('book-phone').value.trim() || '—'}`,
    ];
    if (e && e.apt.nightlyRate > 0) lines.push('', `${L.est}: ${eur(e.total)}`);
    const msg = $('book-message').value.trim();
    if (msg) lines.push('', `${L.msg}: ${msg}`);
    return {
      subject: t.subject(t.aptName(apt)),
      body: lines.join('\n'),
    };
  }

  aptSel.addEventListener('change', () => { syncApartmentUI(); renderEstimate(); });
  [checkin, checkout, guests].forEach((el) => el.addEventListener('input', renderEstimate));

  // Vérification des disponibilités en direct (quand le site est en ligne)
  const avBox = $('booking-availability');
  let avTimer = null;
  async function checkAvailability() {
    if (!avBox) return;
    const t = BOOK_T[lang()];
    const n = nightsBetween(checkin.value, checkout.value);
    if (!checkin.value || !checkout.value || !n || n <= 0) {
      avBox.textContent = ''; avBox.className = 'booking-availability'; return;
    }
    avBox.textContent = t.checking;
    avBox.className = 'booking-availability';

    // 1) Blocages manuels posés par l'admin (stockés dans Supabase)
    try {
      const content = await (window.ACACIAS_CONTENT_READY || Promise.resolve({}));
      const manual = (content.blocks && content.blocks[aptSel.value]) || [];
      if (manual.some((b) => b.start < checkout.value && b.end > checkin.value)) {
        avBox.textContent = t.unavailable;
        avBox.className = 'booking-availability ko';
        return;
      }
    } catch (_) {}

    // 2) Calendriers Airbnb/Booking (API)
    try {
      const r = await fetch(`/api/availability?apartment=${aptSel.value}&checkin=${checkin.value}&checkout=${checkout.value}`);
      if (!r.ok) throw new Error();
      const d = await r.json();
      if (d.configured === false) { avBox.textContent = ''; avBox.className = 'booking-availability'; return; }
      avBox.textContent = d.available ? t.available : t.unavailable;
      avBox.className = 'booking-availability ' + (d.available ? 'ok' : 'ko');
    } catch (_) {
      // Pas de serveur (site ouvert en local) : on n'affiche rien.
      avBox.textContent = ''; avBox.className = 'booking-availability';
    }
  }
  [aptSel, checkin, checkout].forEach((el) => el.addEventListener('change', () => {
    clearTimeout(avTimer);
    avTimer = setTimeout(checkAvailability, 300);
  }));

  // Contenu/tarifs mis à jour depuis l'admin → on rafraîchit le formulaire
  document.addEventListener('acacias:content', () => { syncApartmentUI(); renderEstimate(); });

  // Envoi de la demande par e-mail pré-rempli (aucun paiement en ligne)
  bookingForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    clearError();
    const err = validate();
    if (err) { showError(err); return; }
    const { subject, body } = buildEmail();
    window.location.href = `mailto:${BOOKING_CONFIG.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  // Re-traduit le formulaire (libellés + estimation) au changement de langue.
  // Ces écouteurs s'exécutent après setLanguage(), qui met à jour les textes data-i18n.
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => { syncApartmentUI(); renderEstimate(); });
  });

  // Date minimale = aujourd'hui
  const todayStr = new Date().toISOString().slice(0, 10);
  checkin.min = todayStr;
  checkout.min = todayStr;

  syncApartmentUI();
}

/* ============================================================
   CALENDRIER DE DISPONIBILITÉS (pages appartement)
   ------------------------------------------------------------
   Lit les périodes occupées via /api/availability (calendriers
   Airbnb / Booking). Si le serveur n'est pas là (site en local)
   ou pas encore configuré, la section se masque simplement.
   ============================================================ */
(function () {
  const MONTHS_AHEAD = 8; // combien de mois on charge et on peut feuilleter
  const isoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  // Registre des calendriers affichés — utilisé par le mode édition (edit.js)
  // pour bloquer/débloquer des dates à la main.
  window.ACACIAS_CALS = [];

  const hasAdminSession = (() => {
    try { return Object.keys(localStorage).some((k) => k.startsWith('sb-') && k.includes('auth-token')); }
    catch (_) { return false; }
  })();

  document.querySelectorAll('.availability-cal').forEach(async (el) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const from = isoDate(today);
    const to = isoDate(new Date(today.getFullYear(), today.getMonth() + MONTHS_AHEAD, 1));
    const apt = el.dataset.apt;

    // Deux sources : les calendriers Airbnb/Booking (API) et les blocages
    // manuels posés depuis le mode édition (Supabase).
    const [api, content] = await Promise.all([
      fetch(`/api/availability?apartment=${apt}&from=${from}&to=${to}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      window.ACACIAS_CONTENT_READY || Promise.resolve({}),
    ]);
    const apiBusy = api && api.configured !== false && Array.isArray(api.busy) ? api.busy : null;
    const manual = (content.blocks && content.blocks[apt]) || [];

    // Rien à montrer et pas d'admin connecté : on masque la section.
    if (!apiBusy && !manual.length && !hasAdminSession) {
      const s = el.closest('.cal-section'); if (s) s.hidden = true;
      return;
    }
    initCalendar(el, apt, apiBusy || [], manual, today);
  });

  function initCalendar(el, apt, busy, manual, today) {
    const todayStr = isoDate(today);
    const inRanges = (list, dateStr) => list.some((r) => r.start <= dateStr && dateStr < r.end);
    const isBusy = (dateStr) => inRanges(busy, dateStr);
    const isManual = (dateStr) => inRanges(manual, dateStr);
    let offset = 0; // premier mois affiché (0 = mois en cours)

    function monthHTML(year, month) {
      const locale = document.documentElement.lang === 'en' ? 'en-GB' : 'fr-FR';
      const first = new Date(year, month, 1);
      const label = first.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
      const dayNames = document.documentElement.lang === 'en'
        ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
        : ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const startCol = (first.getDay() + 6) % 7; // semaine qui commence le lundi

      let cells = dayNames.map((d) => `<span class="cal-dayname">${d}</span>`).join('');
      for (let i = 0; i < startCol; i++) cells += '<span></span>';
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = isoDate(new Date(year, month, day));
        let cls = 'cal-day';
        if (dateStr < todayStr) cls += ' past';
        else if (isBusy(dateStr)) cls += ' busy';
        else if (isManual(dateStr)) cls += ' busy manual';
        cells += `<span class="${cls}" data-date="${dateStr}">${day}</span>`;
      }
      return `<div class="cal-month"><div class="cal-month-label">${label}</div><div class="cal-grid">${cells}</div></div>`;
    }

    function render() {
      const base = new Date(today.getFullYear(), today.getMonth() + offset, 1);
      const next = new Date(today.getFullYear(), today.getMonth() + offset + 1, 1);
      el.innerHTML =
        `<div class="cal-nav">
           <button type="button" class="cal-prev" aria-label="Mois précédent" ${offset === 0 ? 'disabled' : ''}>‹</button>
           <button type="button" class="cal-next" aria-label="Mois suivant" ${offset >= MONTHS_AHEAD - 2 ? 'disabled' : ''}>›</button>
         </div>
         <div class="cal-months">${monthHTML(base.getFullYear(), base.getMonth())}${monthHTML(next.getFullYear(), next.getMonth())}</div>`;
      el.querySelector('.cal-prev').addEventListener('click', () => { offset = Math.max(0, offset - 1); render(); });
      el.querySelector('.cal-next').addEventListener('click', () => { offset = Math.min(MONTHS_AHEAD - 2, offset + 1); render(); });
    }

    render();
    // Re-rendu dans la bonne langue quand on change FR/EN
    document.querySelectorAll('.lang-btn').forEach((btn) => btn.addEventListener('click', () => setTimeout(render, 0)));
    // À disposition du mode édition (edit.js)
    window.ACACIAS_CALS.push({ el, apt, manual, render });
  }
})();

/* ============================================================
   FORMULAIRES ÉVÉNEMENTS & PISCINE — demande par e-mail,
   règlement sur place (aucun paiement en ligne).
   ============================================================ */
(function () {
  const isEn = () => document.documentElement.lang === 'en';
  const val = (id) => (document.getElementById(id) ? document.getElementById(id).value.trim() : '');
  const REQ_T = {
    fr: { required: 'Merci de renseigner la date, votre nom et votre e-mail.' },
    en: { required: 'Please fill in the date, your name and your email.' },
  };

  function sendRequest(subject, lines) {
    const body = lines.filter(Boolean).join('\n');
    window.location.href = `mailto:${BOOKING_CONFIG.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function showFormError(id, show) {
    const box = document.getElementById(id);
    if (!box) return;
    box.hidden = !show;
    if (show) box.textContent = REQ_T[isEn() ? 'en' : 'fr'].required;
  }

  const eventForm = document.getElementById('event-form');
  if (eventForm) {
    eventForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const ok = val('evt-date') && val('evt-name') && val('evt-email');
      showFormError('evt-error', !ok);
      if (!ok) return;
      const slotSel = document.getElementById('evt-slot');
      const slotTxt = slotSel ? slotSel.selectedOptions[0].textContent : '';
      const L = isEn()
        ? { s: `Event request — ${val('evt-date')}`, date: 'Date', slot: 'Time slot', type: 'Type of event', guests: 'People', name: 'Name', email: 'Email', phone: 'Phone', msg: 'Message', price: 'Indicative price' }
        : { s: `Demande événement — ${val('evt-date')}`, date: 'Date', slot: 'Créneau', type: "Type d'événement", guests: 'Personnes', name: 'Nom', email: 'E-mail', phone: 'Téléphone', msg: 'Message', price: 'Tarif indicatif' };
      sendRequest(L.s, [
        `${L.date}: ${val('evt-date')}`,
        slotTxt && `${L.slot}: ${slotTxt}`,
        val('evt-type') && `${L.type}: ${val('evt-type')}`,
        val('evt-guests') && `${L.guests}: ${val('evt-guests')}`,
        '',
        `${L.name}: ${val('evt-name')}`,
        `${L.email}: ${val('evt-email')}`,
        `${L.phone}: ${val('evt-phone') || '—'}`,
        val('evt-message') && `\n${L.msg}: ${val('evt-message')}`,
        '',
        `${L.price}: ${BOOKING_CONFIG.eventPrice} €`,
      ]);
    });
  }

  const poolForm = document.getElementById('pool-form');
  if (poolForm) {
    const totalBox = document.getElementById('pool-total-value');
    function renderPoolTotal() {
      if (!totalBox) return;
      const n = Math.max(1, parseInt(val('pool-guests'), 10) || 1);
      totalBox.textContent = `${(n * BOOKING_CONFIG.poolPricePerPerson).toLocaleString(isEn() ? 'en-GB' : 'fr-FR')} €`;
    }
    const guestsInput = document.getElementById('pool-guests');
    if (guestsInput) guestsInput.addEventListener('input', renderPoolTotal);
    document.querySelectorAll('.lang-btn').forEach((btn) => btn.addEventListener('click', () => setTimeout(renderPoolTotal, 0)));
    renderPoolTotal();

    poolForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const ok = val('pool-date') && val('pool-name') && val('pool-email');
      showFormError('pool-error', !ok);
      if (!ok) return;
      const n = Math.max(1, parseInt(val('pool-guests'), 10) || 1);
      const poolSlotSel = document.getElementById('pool-slot');
      const poolSlotTxt = poolSlotSel ? poolSlotSel.selectedOptions[0].textContent : '';
      const L = isEn()
        ? { s: `Pool request — ${val('pool-date')}`, date: 'Date', slot: 'Time slot', guests: 'People', name: 'Name', email: 'Email', phone: 'Phone', total: 'Indicative total' }
        : { s: `Demande piscine — ${val('pool-date')}`, date: 'Date', slot: 'Créneau', guests: 'Personnes', name: 'Nom', email: 'E-mail', phone: 'Téléphone', total: 'Total indicatif' };
      sendRequest(L.s, [
        `${L.date}: ${val('pool-date')}`,
        poolSlotTxt && `${L.slot}: ${poolSlotTxt}`,
        `${L.guests}: ${n}`,
        '',
        `${L.name}: ${val('pool-name')}`,
        `${L.email}: ${val('pool-email')}`,
        `${L.phone}: ${val('pool-phone') || '—'}`,
        '',
        `${L.total}: ${n * BOOKING_CONFIG.poolPricePerPerson} € (${n} × ${BOOKING_CONFIG.poolPricePerPerson} €)`,
      ]);
    });
  }
})();

/* ============================================================
   Ancre « Réserver » — toujours atterrir EN HAUT de la section,
   même quand les photos au-dessus se chargent et décalent la page.
   ============================================================ */
(function () {
  const reserveSection = document.getElementById('reserve');
  const scrollToReserve = () => reserveSection.scrollIntoView({ block: 'start' });

  if (reserveSection) {
    // Clic sur n'importe quel lien « Réserver » de la même page
    document.querySelectorAll('a[href$="#reserve"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToReserve();
        history.replaceState(null, '', '#reserve');
      });
    });
    // Arrivée depuis une autre page (ex. « Réserver cet appartement ») :
    // on recale la position une fois toutes les images chargées.
    if (window.location.hash === '#reserve') {
      window.addEventListener('load', () => setTimeout(scrollToReserve, 60));
    }
  }
})();

/* ============================================================
   Apparitions douces au défilement (.reveal → .in-view)
   Respecte automatiquement « réduire les animations » via le CSS.
   ============================================================ */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('in-view'));
}
