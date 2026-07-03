# Les Acacias — site web

Site vitrine pour Les Acacias, petite résidence de trois appartements à Caveirac (Gard).

## Étape actuelle
- ✅ Page d'accueil bilingue (FR/EN) avec sélecteur de langue
- ✅ Présentation des 3 appartements (T3 Confort et T3 Terrasse : 6 pers.,
     T2 Terrasse : 4 pers.)
- ✅ Section lieu / distances
- ✅ **Refonte design** : palette vert profond / pierre / off-white,
     typographie éditoriale (Fraunces + Inter), héros plein écran,
     animations douces au défilement
- ✅ Tarifs réels affichés (« Dès X € / nuit ») + estimation automatique
     dans le formulaire (base 2 personnes, +40 €/nuit par personne
     supplémentaire, ménage 50 €, taxe de séjour 1 €/pers/nuit)
- ⏳ Paiement en ligne par carte (Stripe) + disponibilité en temps réel
     — étape 2 (Vercel + Supabase)
- ⏳ Synchronisation des calendriers Airbnb / Booking / Abritel — étape 3
- ⏳ Portail admin, pages Événements et Piscine — étapes suivantes

## Tarifs et frais
Tous les montants se règlent **en un seul endroit** : en haut de `script.js`,
dans le bloc `BOOKING_CONFIG` :
- `nightlyRate` — prix par nuit (base 2 personnes) : 200 € / 180 € / 160 €
- `baseGuests` / `extraGuestPerNight` — 2 personnes incluses, +40 €/nuit
  par personne supplémentaire
- `cleaningFee` — frais de ménage par séjour : 50 €
- `minNights` — séjour minimum : 1 nuit
- `touristTaxPerPersonPerNight` — taxe de séjour : 1 € (par personne et par nuit)
- `maxGuests` — capacité : 6 / 6 / 4 personnes

> ⚠️ Important : cette version envoie une **demande** par e-mail ; elle ne
> prend pas le paiement et ne vérifie pas la disponibilité en temps réel.
> Le paiement par carte (Stripe Checkout, acompte de 100 €) et la
> disponibilité automatique arrivent à l'étape 2 (Vercel + Supabase).

## Lancer le site en local
Aucune installation nécessaire — c'est un site statique :

```bash
# depuis le dossier du projet
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Ou ouvrir directement `index.html` dans un navigateur.

## Photos
Les photos ont été récupérées automatiquement depuis votre annonce Booking.com et Airbnb.

**Organisation :**

```
photos/
├── hero.jpg                 ← grande photo de la page d'accueil
├── location.jpg             ← photo de la section « Le lieu »
├── apartment-1/             ← photos du T3 Confort
│   ├── 01.jpg
│   ├── 02.jpg
│   └── ... (64 photos initiales)
├── apartment-2/             ← photos du T3 Terrasse
├── apartment-3/             ← photos du T2 Terrasse
├── caveirac/                ← bandeau « Caveirac » (01.jpg, 02.jpg… jusqu'à 12)
└── property/                ← photos du domaine, par nom de fichier :
    ├── jardin.jpg           ← le jardin
    ├── cuisine-ete.jpg      ← la cuisine d'été
    └── buanderie.jpg        ← la buanderie
```

**Les 3 appartements** ont chacun leur page de détail :
`appartement-1.html` (T3 Confort), `appartement-2.html` (T3 Terrasse),
`appartement-3.html` (T2 Terrasse). La page d'accueil affiche 3 cartes qui
mènent vers ces pages. La photo de couverture de chaque carte est le `01.jpg`
du dossier de l'appartement.

**Pour ne garder que les bonnes photos de chaque appartement :**
1. Ouvrez le dossier `photos/apartment-1/`, `apartment-2/` ou `apartment-3/`.
2. Supprimez les photos qui n'appartiennent pas à cet appartement.
3. Rechargez la page — les photos supprimées disparaissent automatiquement de la galerie.

Aucun fichier de code à modifier : le site détecte les photos manquantes et adapte la galerie tout seul.

**Pour remplacer `hero.jpg` ou `location.jpg` :** déposez votre nouveau fichier dans `photos/` en conservant exactement ce nom.

## Modifier les textes
- Les textes français sont dans `index.html`.
- Les traductions FR/EN sont dans `script.js` (objet `translations`).
- Pour changer un texte, modifiez l'entrée correspondante dans **les deux** fichiers (la clé `data-i18n` fait le lien).

## Contact affiché sur le site
- Téléphone : 06 62 51 77 65
- E-mail : lesacacias30@gmail.com
