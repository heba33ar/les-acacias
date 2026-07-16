# Mise en ligne — guide pas à pas

Le site est **statique et sans base de données**. Une seule petite fonction
serveur, en lecture seule, lit vos calendriers Airbnb et Booking pour
afficher les disponibilités. Aucun paiement en ligne, aucune donnée client
stockée — rien à pirater.

Comptez 20 à 30 minutes. Tout est gratuit.

---

## 1. Récupérer vos liens de calendrier iCal (10 min)

Un lien iCal est une adresse secrète qui liste les dates réservées
(sans les noms ni les paiements). Il en faut un par plateforme et par
appartement.

**Airbnb** : Calendrier → cliquez sur l'annonce → **Disponibilité** →
« Connecter à un autre site web » / **Exporter le calendrier** →
copiez l'adresse `https://www.airbnb.fr/calendar/ical/…ics`.

**Booking** : Extranet → **Tarifs et disponibilités → Synchroniser les
calendriers** → **Exporter le calendrier** → copiez l'adresse `…ics`.

Faites-le pour chacun des 3 appartements (2 liens par appartement).
⚠️ Ces liens sont à garder pour vous : ils iront dans les réglages
Vercel, jamais dans le code.

## 2. Déployer sur Vercel (10 min)

1. Créez un compte sur https://vercel.com **avec votre compte GitHub**.
2. **Add New → Project** → importez votre dépôt `les-acacias`.
3. Avant de déployer, ouvrez **Environment Variables** et ajoutez
   3 variables (les liens séparés par une virgule, sans espace autour) :

   | Nom | Valeur (exemple) |
   |---|---|
   | `ICAL_APT1` | `https://airbnb…/xxx.ics,https://ical.booking.com/…yyy.ics` |
   | `ICAL_APT2` | idem pour le T3 Terrasse |
   | `ICAL_APT3` | idem pour le T2 Terrasse |

4. **Deploy**. Votre site est en ligne sur `https://….vercel.app`.

## 3. Vérifier (2 min)

- Ouvrez une page appartement : le calendrier « Disponibilités » doit
  afficher les dates occupées (celles de vos réservations Airbnb/Booking).
- Dans le formulaire de réservation, choisissez des dates déjà réservées :
  le site doit afficher « Ces dates ne sont pas disponibles ».
- Les disponibilités se rafraîchissent automatiquement toutes les heures.

## 4. Plus tard, si vous voulez

- **Nom de domaine** (~10 €/an, ex. lesacacias-caveirac.fr chez OVH) :
  Vercel → Settings → Domains, et suivez les instructions.
- **Abritel** propose aussi un export iCal : ajoutez simplement son lien
  à la suite dans `ICAL_APT1/2/3` (séparé par une virgule), puis
  **Redeploy**.

## Si un calendrier change d'adresse

Régénérez le lien sur la plateforme, remplacez-le dans
Vercel → Settings → Environment Variables, puis **Redeploy**
(menu ⋯ du dernier déploiement).

---

# Espace admin (textes, photos, tarifs)

L'espace admin (`votre-site/admin.html`) permet de modifier les textes
FR/EN, les photos et les tarifs **sans toucher au code**. Connexion par
**lien magique** envoyé par e-mail — aucun mot de passe. Une seule
adresse est autorisée : lesacacias30@gmail.com.

Il repose sur Supabase (gratuit). Comptez 15 minutes.

## 1. Créer le projet Supabase

1. https://supabase.com → **Start your project** → créez un compte
   (avec GitHub, c'est le plus simple).
2. **New project** : nom `les-acacias`, région **Paris/Frankfurt**,
   mot de passe généré (gardez-le).
3. **SQL Editor** → **New query** → collez tout le contenu de
   `supabase-admin.sql` → **Run** (vous devez voir « Success »).

## 2. Autoriser uniquement votre adresse

1. **Authentication → Users → Add user → Create new user** :
   `lesacacias30@gmail.com`, cochez **Auto Confirm User**.
   (Pas de mot de passe nécessaire.)
2. **Authentication → Sign In / Up** : désactivez
   **Allow new users to sign up** — personne d'autre ne pourra créer
   de compte.
3. **Authentication → URL Configuration** :
   - Site URL : l'adresse de votre site (ex. `https://les-acacias.vercel.app`)
   - Redirect URLs : ajoutez `https://VOTRE-SITE/admin.html`

## 3. Brancher le site

1. **Project Settings → API** : copiez **Project URL** et la clé
   **anon public** (pas la service_role !).
2. Ouvrez le fichier `config.js` du site et collez les deux valeurs.
   La clé « anon » est faite pour être publique : elle ne permet que la
   lecture. Commitez et pushez — Vercel redéploie tout seul.

## 4. Utiliser l'admin

1. Ouvrez `https://VOTRE-SITE/admin.html` → entrez votre e-mail →
   **Recevoir le lien de connexion** → cliquez sur le lien reçu.
2. Modifiez textes / photos / tarifs, puis **Enregistrer**.
   Le site public est à jour immédiatement.

⚠️ L'e-mail du lien magique est envoyé par Supabase : en gratuit,
c'est limité à quelques envois par heure — largement assez pour un
usage personnel, mais si le lien n'arrive pas, attendez un peu et
regardez les spams. Le lien reste valable 1 heure.
