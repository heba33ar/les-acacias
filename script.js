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
  touristTaxPerPersonPerNight: 1,

  // Dépôt de garantie (montant indicatif, simplement affiché —
  // retenu seulement en cas de dommages, comme sur Booking)
  securityDeposit: 296,

  // Prix de base pour 2 personnes ; supplément par personne au-delà
  baseGuests: 2,
  extraGuestPerNight: 40,

  // Un appartement par numéro (correspond à data-apt dans index.html)
  apartments: {
    1: { name: 'T3 Confort',  name_en: 'T3 Confort',  maxGuests: 6, nightlyRate: 200, cleaningFee: 50, minNights: 1 },
    2: { name: 'T3 Terrasse', name_en: 'T3 Terrasse', maxGuests: 6, nightlyRate: 180, cleaningFee: 50, minNights: 1 },
    3: { name: 'T2 Terrasse', name_en: 'T2 Terrasse', maxGuests: 4, nightlyRate: 160, cleaningFee: 50, minNights: 1 },
  },
};

// Affiche « Dès X € / nuit » partout où un élément porte data-apt-price.
const PRICE_T = {
  fr: {
    short: (r) => `Dès ${r} € / nuit`,
    long: (r, b, x) => `Dès ${r} € par nuit pour ${b} personnes · +${x} € par nuit et par personne supplémentaire`,
  },
  en: {
    short: (r) => `From €${r} / night`,
    long: (r, b, x) => `From €${r} per night for ${b} guests · +€${x} per night per extra guest`,
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
}

const translations = {
  fr: {
    'brand.sub': 'Caveirac · Gard',
    'nav.apartments': 'Les appartements',
    'nav.domaine': 'Le domaine',
    'nav.location': 'Le lieu',
    'nav.contact': 'Contact',
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
    'book.apt': 'Appartement',
    'book.checkin': 'Arrivée',
    'book.checkout': 'Départ',
    'book.guests': 'Voyageurs',
    'book.name': 'Votre nom',
    'book.email': 'E-mail',
    'book.phone': 'Téléphone',
    'book.message': 'Message (optionnel)',
    'book.submit': 'Envoyer ma demande',
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
    'rules.deposit': "Dépôt de garantie : jusqu'à 296 € en cas de dommages",
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
    'book.apt': 'Apartment',
    'book.checkin': 'Check-in',
    'book.checkout': 'Check-out',
    'book.guests': 'Guests',
    'book.name': 'Your name',
    'book.email': 'Email',
    'book.phone': 'Phone',
    'book.message': 'Message (optional)',
    'book.submit': 'Send my request',
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
    'rules.deposit': 'Damage deposit: up to €296 in case of damage',
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
const initial = saved || (navigator.language && navigator.language.startsWith('en') ? 'en' : 'fr');
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
    },
    en: {
      aptLabel: (a) => `${a.name_en} — up to ${a.maxGuests}`,
      aptName: (a) => a.name_en,
      nights: (n) => `${n} night${n > 1 ? 's' : ''}`,
      lineNights: 'Accommodation', cleaning: 'Cleaning fee', tax: 'Tourist tax',
      extras: 'Extra guests',
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
    const cleaning = apt.cleaningFee;
    const tax = BOOKING_CONFIG.touristTaxPerPersonPerNight * g * n;
    return { apt, n, g, extraGuests, lodging, extras, cleaning, tax, total: lodging + extras + cleaning + tax };
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
    if (e.cleaning > 0) rows.push([t.cleaning, eur(e.cleaning)]);
    if (e.tax > 0) rows.push([`${t.tax} (${e.g} × ${e.n})`, eur(e.tax)]);
    let html = rows.map(([k, v]) => `<div class="est-line"><span>${k}</span><span>${v}</span></div>`).join('');
    html += `<div class="est-line est-total"><span>${t.total}</span><span>${eur(e.total)}</span></div>`;
    html += `<p class="est-note">${t.baseNote(BOOKING_CONFIG.baseGuests, BOOKING_CONFIG.extraGuestPerNight)}</p>`;
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

  bookingForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    clearError();
    const err = validate();
    if (err) { showError(err); return; }
    const { subject, body } = buildEmail();
    const href = `mailto:${BOOKING_CONFIG.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
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
