/* =====================================================================
   LE FABUL'EUH GRILL — Helper Google Agenda (réservations)
   ---------------------------------------------------------------------
   Code commun aux deux fonctions serverless (/api/disponibilites et
   /api/reserver). Gère :
     - l'authentification OAuth (refresh token, AUCUNE clé en dur) ;
     - la génération des créneaux selon les règles métier ;
     - la conversion d'heures locales Europe/Paris en instants UTC ;
     - la lecture de l'agenda (freebusy) et la création d'événements.

   ⚠️ Ce fichier n'est PAS une route : il est rangé dans /lib (hors /api).
   ===================================================================== */
const { google } = require("googleapis");

/* ----- Réglages métier (modifiables facilement) -------------------- */
const TIMEZONE = "Europe/Paris";
const SLOT_MINUTES = 30;   // créneaux proposés toutes les 30 min
const DUREE_MINUTES = 60;  // une réservation occupe 1 h

// Services et horaires. "dernier" = dernier créneau réservable
// (il laisse 1 h d'occupation avant la fermeture du service) :
//   midi : ferme 14h30 → dernier créneau 13h30
//   soir : ferme 22h00 → dernier créneau 21h00
const SERVICES = [
  { nom: "midi", debut: "11:30", dernier: "13:30" },
  { nom: "soir", debut: "19:00", dernier: "21:00" },
];

/* ----- Outils horaires (fuseau Europe/Paris) ----------------------- */

// Décalage (ms) entre Europe/Paris et UTC pour un instant donné.
// Gère automatiquement l'heure d'été / d'hiver via l'API Intl.
function offsetParisMs(utcMs) {
  const d = new Date(utcMs);
  const paris = new Date(d.toLocaleString("en-US", { timeZone: TIMEZONE }));
  const utc = new Date(d.toLocaleString("en-US", { timeZone: "UTC" }));
  return paris.getTime() - utc.getTime();
}

// Convertit une date "YYYY-MM-DD" + une heure "HH:MM" (murale, Paris)
// en objet Date correspondant au bon instant UTC.
function parisToDate(dateStr, timeStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm, 0);
  const offset = offsetParisMs(guess);
  return new Date(guess - offset);
}

// Ajoute des minutes à une heure "HH:MM" → "HH:MM" (sans passage de jour ici).
function ajouterMinutes(timeStr, minutes) {
  let [h, m] = timeStr.split(":").map(Number);
  m += minutes;
  h += Math.floor(m / 60);
  m %= 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/* ----- Génération des créneaux candidats d'une journée ------------- */
// Renvoie [{ heure:"12:00", service:"midi", debut:Date, fin:Date }, ...]
function genererCreneaux(dateStr) {
  const creneaux = [];
  for (const service of SERVICES) {
    let heure = service.debut;
    // Boucle jusqu'au dernier créneau inclus.
    // (comparaison de chaînes "HH:MM" valide car format fixe à 2 chiffres)
    while (heure <= service.dernier) {
      const debut = parisToDate(dateStr, heure);
      const fin = new Date(debut.getTime() + DUREE_MINUTES * 60 * 1000);
      creneaux.push({ heure, service: service.nom, debut, fin });
      heure = ajouterMinutes(heure, SLOT_MINUTES);
    }
  }
  return creneaux;
}

/* ----- Validation simple d'une date "YYYY-MM-DD" ------------------- */
function dateValide(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr || "")) return false;
  const d = new Date(`${dateStr}T00:00:00Z`);
  return !isNaN(d.getTime());
}

/* ----- Authentification Google (OAuth refresh token) --------------- */
function getCalendarClient() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN || !process.env.GOOGLE_CALENDAR_ID) {
    // Variable manquante → on lève une erreur explicite (interceptée par l'API).
    const e = new Error("Configuration Google Agenda incomplète (variables d'environnement manquantes).");
    e.code = "CONFIG";
    throw e;
  }
  const oauth2 = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
  oauth2.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
  return google.calendar({ version: "v3", auth: oauth2 });
}

/* ----- Lecture des plages occupées (freebusy) ---------------------- */
// Renvoie un tableau d'intervalles { debut:ms, fin:ms } occupés.
async function lirePlagesOccupees(calendar, timeMin, timeMax) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      timeZone: TIMEZONE,
      items: [{ id: calendarId }],
    },
  });
  const cal = res.data.calendars && res.data.calendars[calendarId];
  if (!cal) return [];
  if (cal.errors && cal.errors.length) {
    const e = new Error("Agenda introuvable ou accès refusé.");
    e.code = "CALENDAR";
    throw e;
  }
  return (cal.busy || []).map((b) => ({
    debut: new Date(b.start).getTime(),
    fin: new Date(b.end).getTime(),
  }));
}

// Un créneau est libre s'il ne chevauche AUCUNE plage occupée.
function creneauLibre(creneau, plages) {
  const d = creneau.debut.getTime();
  const f = creneau.fin.getTime();
  return !plages.some((p) => d < p.fin && f > p.debut); // chevauchement strict
}

/* ----- Création de l'événement de réservation ---------------------- */
async function creerEvenement(calendar, infos) {
  const { date, heure, prenom, nom, couverts, email, telephone, message } = infos;
  const finHeure = ajouterMinutes(heure, DUREE_MINUTES);

  const event = {
    summary: `Réservation – ${prenom} ${nom} (${couverts} couv.)`,
    description:
      `Réservation via le site Le Fabul'euh Grill\n\n` +
      `Couverts : ${couverts}\n` +
      `E-mail : ${email}\n` +
      `Téléphone : ${telephone}\n` +
      `Message : ${message && message.trim() ? message.trim() : "—"}`,
    start: { dateTime: `${date}T${heure}:00`, timeZone: TIMEZONE },
    end: { dateTime: `${date}T${finHeure}:00`, timeZone: TIMEZONE },
  };

  const res = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    requestBody: event,
  });
  return res.data;
}

module.exports = {
  TIMEZONE,
  SERVICES,
  DUREE_MINUTES,
  genererCreneaux,
  dateValide,
  getCalendarClient,
  lirePlagesOccupees,
  creneauLibre,
  creerEvenement,
  parisToDate,
};
