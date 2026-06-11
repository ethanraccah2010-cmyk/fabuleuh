# Site web — Le Fabul'euh Grill (Montgeron)

Site vitrine du restaurant **Le Fabul'euh Grill** — grill / steakhouse, viande française
régionale, ZA Maurice Garin, Av. Jean Jaurès / Rte de Corbeil, 91230 Montgeron.

Site **100 % statique** : HTML / CSS / JavaScript pur, **sans framework, sans build,
sans dépendance npm**. Hébergeable tel quel sur Vercel ou Netlify. Mobile-first.

---

## 🗂️ Arborescence

```
.
├── index.html       → Accueil (hero, notre maison, confiance, aperçu carte, galerie, CTA)
├── menu.html         → La carte (onglets par catégorie, données dans script.js)
├── contact.html      → Coordonnées, horaires, plan Google Maps, formulaire de réservation
├── style.css         → Toute la mise en forme (palette dans :root en haut du fichier)
├── script.js         → Navigation, reveal scroll, données de la carte, onglets, formulaire
├── images/           → Photos / placeholders (voir liste plus bas)
├── vercel.json       → Config Vercel (cleanUrls)
├── robots.txt        → Indexation moteurs
├── sitemap.xml       → Plan du site (SEO)
└── README.md         → Ce fichier
```

---

## ✏️ Comment modifier le contenu

> Les emplacements à personnaliser sont **commentés dans le code** (`À CONFIRMER`,
> `PLACEHOLDER`, `TODO`). Cherchez ces mots pour les retrouver vite.

### 1. Les prix et les plats — `script.js`
Toute la carte est un **tableau JavaScript** `CARTE` en haut de `script.js`.
Chaque catégorie : `{ id, label, intro, items[] }`. Chaque plat :
```js
{ name: "Le Cheeseburger", price: "14,90 €", desc: "Pain brioché, sauce burger…", tag: "Signature" }
```
- **Modifier un prix** → changez la valeur `price`.
- **Ajouter un plat** → copiez/collez une ligne `{ … }` dans le bon `items`.
- **Nouvelle catégorie** → ajoutez un bloc `{ id, label, intro, items: [...] }` ; l'onglet
  et le panneau se génèrent automatiquement.

> ⚠️ **Les prix ont été transcrits depuis la carte fournie (PDF).** Un bandeau de
> relecture est affiché en haut de `menu.html` : vérifiez les intitulés et les prix,
> puis **supprimez ce bandeau** (`<div class="note">…</div>`) avant la mise en ligne.

### 2. Les photos — dossier `images/`
Déposez vos images en gardant les **mêmes noms** ; tant qu'une photo manque, un
placeholder « tête de taureau » s'affiche automatiquement (aucune image cassée).
Fichiers attendus :
- `logo.png` — logo officiel (PNG transparent), utilisé en barre de nav, hero et footer
- `hero.jpg` — grande photo de grillade (plein écran d'accueil)
- `maison.jpg` — salle / ambiance diner
- `cat-viandes.jpg`, `cat-burgers.jpg`, `cat-salades.jpg`, `cat-desserts.jpg` — aperçu carte
- `gallery-1.jpg` … `gallery-5.jpg` — galerie (5 images)
- `og-image.jpg` — image de partage réseaux sociaux (1200×630)

### 3. Le téléphone
Affiché `01 69 96 92 32` — lien `tel:+33169969232`. Présent dans les 3 pages.

### 4. L'e-mail (⚠️ à confirmer)
Aucun e-mail public vérifié : `contact@lefabuleuh.com` est un **placeholder**.
Remplacez-le dans `contact.html` et le footer des 3 pages.

### 5. Les horaires
À modifier au footer des 3 pages, dans le bloc infos de `contact.html`, et dans le
**JSON-LD** (`openingHoursSpecification`) de `index.html` et `contact.html`.

### 6. Le formulaire de réservation
Le formulaire (`contact.html`) valide les champs en JS et affiche une **confirmation
simulée** — aucun e-mail n'est envoyé. Pour brancher l'envoi réel, voir le `TODO`
dans la section 5 de `script.js` (formspree, EmailJS, fonction serverless Vercel…).

### 7. Les couleurs
Palette centralisée en haut de `style.css`, section `:root` (`--noir`, `--rouge`…).

---

## 🚀 Déploiement (Vercel)

`vercel.json` active `cleanUrls` (pages accessibles sans `.html` : `/menu`, `/contact`).

**Interface web :** vercel.com → Add New → Project → import du dépôt → Framework
**Other** (aucun build) → Deploy.

**CLI :**
```bash
npm i -g vercel    # une seule fois
vercel             # prévisualisation
vercel --prod      # production
```

**Après mise en ligne :** branchez le domaine final, puis remplacez l'URL
`https://lefabuleuh.com` partout (canoniques, Open Graph, `sitemap.xml`, `robots.txt`,
JSON-LD). Vérifiez aussi les coordonnées GPS du JSON-LD.

---

## 🔎 SEO local — déjà en place
- `<title>` + `<meta description>` uniques par page (mots-clés : *restaurant grill
  Montgeron*, *steakhouse Montgeron*, *viande Montgeron Essonne*).
- Données structurées **JSON-LD `Restaurant`** (nom, adresse, téléphone, horaires, géo).
- **Open Graph**, attributs `alt` descriptifs, `lang="fr"`, `sitemap.xml` + `robots.txt`.

**À faire après mise en ligne :** Google Search Console + fiche Google Business Profile
(clé du SEO local).

---

## ✅ Checklist avant mise en ligne
- [ ] Prix et intitulés de la carte validés (puis retirer le bandeau de `menu.html`)
- [ ] Vraies photos déposées dans `images/`
- [ ] E-mail réel confirmé (placeholder à remplacer)
- [ ] Envoi réel du formulaire de réservation branché
- [ ] Horaires validés par le restaurant
- [ ] Coordonnées GPS exactes dans le JSON-LD
- [ ] Nom de domaine final reporté partout

---

## 🛠️ Aperçu en local (front uniquement)
```bash
python3 -m http.server 8000   # puis http://localhost:8000
```
> ⚠️ Ce serveur ne lance PAS les fonctions `/api`. Pour tester la réservation
> connectée à Google Agenda en local, utilisez `vercel dev` (voir ci-dessous).

---

## 📅 Réservation connectée à Google Agenda

Le formulaire de `contact.html` lit les créneaux libres en direct dans un agenda
Google et y crée l'événement à la réservation. Deux fonctions serverless gèrent ça :

- `api/disponibilites.js` — renvoie les créneaux libres d'une date (lecture agenda).
- `api/reserver.js` — re-vérifie la disponibilité puis crée l'événement.
- `lib/calendar.js` — code commun (OAuth, créneaux, fuseau Europe/Paris).

**Règles** : midi 11h30–14h30, soir 19h00–22h00 · créneaux toutes les 30 min ·
1 réservation = 1 h · 1 seule résa par créneau · dernier créneau midi 13h30, soir 21h00.

### 1. Installer la dépendance
```bash
npm install          # installe googleapis (déclaré dans package.json)
```
(En production, Vercel l'installe automatiquement au déploiement.)

### 2. Créer les identifiants Google (une seule fois)
1. **Google Cloud Console** → créez un projet → **API et services → Bibliothèque**
   → activez **Google Calendar API**.
2. **API et services → Écran de consentement OAuth** : type « Externe », renseignez
   le nom de l'app, et **ajoutez votre compte Google en utilisateur de test**.
3. **API et services → Identifiants → Créer des identifiants → ID client OAuth**
   → type **Application Web**. Dans « URI de redirection autorisés », ajoutez :
   `https://developers.google.com/oauthplayground`
   → notez le **Client ID** et le **Client Secret**.
4. **Obtenir le refresh token** via [OAuth 2.0 Playground](https://developers.google.com/oauthplayground) :
   - roue crantée (⚙️) en haut à droite → cochez **« Use your own OAuth credentials »**
     → collez Client ID + Client Secret.
   - Étape 1 : dans la liste, saisissez le scope
     `https://www.googleapis.com/auth/calendar` → **Authorize APIs** → connectez-vous.
   - Étape 2 : **Exchange authorization code for tokens** → copiez le **Refresh token**.
5. **ID de l'agenda** : Google Agenda → l'agenda concerné → **Paramètres** →
   « Intégrer l'agenda » → **Identifiant de l'agenda** (souvent
   `…@group.calendar.google.com`, ou votre adresse Gmail pour l'agenda principal).
   ⚠️ Si c'est un agenda secondaire, partagez-le avec le compte qui a généré le token,
   en droit **« Apporter des modifications aux événements »**.

### 3. Configurer les 4 variables sur Vercel
**Project Settings → Environment Variables** (cochez Production + Preview) :

| Variable | Valeur |
|----------|--------|
| `GOOGLE_CLIENT_ID` | l'ID client OAuth |
| `GOOGLE_CLIENT_SECRET` | le secret client OAuth |
| `GOOGLE_REFRESH_TOKEN` | le refresh token du Playground |
| `GOOGLE_CALENDAR_ID` | l'identifiant de l'agenda |

Puis **redéployez** pour que les variables soient prises en compte.

### 4. Tester en local
```bash
npm i -g vercel                 # une seule fois
cp .env.example .env            # puis remplissez les 4 valeurs dans .env
vercel dev                      # sert le site + les fonctions /api
# → http://localhost:3000/contact.html
# Tests rapides des endpoints :
#   http://localhost:3000/api/disponibilites?date=2026-06-20
#   (réservation : via le formulaire de la page contact)
```
Vérifiez ensuite dans Google Agenda qu'un événement
« Réservation – Prénom Nom (X couv.) » a bien été créé, et que le créneau
disparaît de la liste au rechargement.
