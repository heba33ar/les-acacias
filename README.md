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
- ✅ **Disponibilités synchronisées Airbnb / Booking** : calendrier visuel
     sur chaque page appartement + vérification des dates dans le
     formulaire, via les liens iCal (lecture seule, rafraîchi toutes les
     heures) → **à mettre en ligne en suivant `SETUP.md`**
- ✅ **Demande de réservation par e-mail** : pas de paiement en ligne,
     pas de compte client, aucune donnée stockée — vous confirmez chaque
     demande vous-même
- ✅ **Page Événements** (`evenements.html`) : privatisation à la journée,
     300 €, demande par e-mail, règlement sur place
- ✅ **Page Piscine** (`piscine.html`) : entrée à la journée, 25 €/personne,
     demande par e-mail, règlement sur place

- ✅ **Espace admin** (`admin.html`) : modification des textes FR/EN,
     des photos et des tarifs sans toucher au code — connexion par lien
     magique e-mail (voir `SETUP.md`, section « Espace admin »)

## Comment ça marche
- Le site est statique (HTML/CSS/JS). Une seule fonction serveur,
  `api/availability.js`, lit vos calendriers Airbnb/Booking (liens iCal
  dans les réglages Vercel) et répond « libre / occupé ». Elle ne stocke
  rien et ne peut rien modifier.
- Toute réservation directe se conclut par e-mail : vous bloquez ensuite
  les dates sur Airbnb ou Booking, et le site les affiche occupées à la
  prochaine synchronisation (au plus 1 heure).
- L'espace admin enregistre les contenus personnalisés dans Supabase
  (`site_content` + photos dans le stockage). Le site public les lit en
  lecture seule via `config.js` ; si rien n'est personnalisé, il garde
  les textes/photos/tarifs écrits dans le code.
- `QUESTIONS-TARIFS.md` : la liste des questions à faire valider par le
  propriétaire avant d'affiner les tarifs.

## Tarifs et frais
Tous les montants se règlent **en un seul endroit** : en haut de `script.js`,
dans le bloc `BOOKING_CONFIG` :
- `nightlyRate` — prix par nuit (base 2 personnes) : 150 € / 130 € / 110 €
- `baseGuests` / `extraGuestPerNight` — 2 personnes incluses, +30 €/nuit
  par personne supplémentaire
- `weekDiscountPct` / `monthDiscountPct` — −10 % dès 7 nuits, −15 % dès 28 nuits
- `cleaningFee` — frais de ménage par séjour : 40 €
- `minNights` — séjour minimum : 1 nuit
- `touristTaxPerPersonPerNight` — taxe de séjour : 3,30 € (par personne et par nuit)
- `securityDeposit` — dépôt de garantie : 290 €
- `maxGuests` — capacité : 6 / 6 / 4 personnes
- `eventPrice` — événement (journée ou soirée) : 300 €
- `poolPricePerPerson` — piscine : 25 € par personne et par créneau

Le détail complet des conditions validées par le propriétaire est dans
`QUESTIONS-TARIFS.md`. Une fois l'espace admin branché, tout se modifie
depuis `admin.html` (onglet Tarifs).

> Le site envoie des **demandes** par e-mail (séjours, événements,
> piscine) — aucun paiement en ligne. Les prix affichés sont indicatifs ;
> vous confirmez le tarif exact en répondant au client.

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
