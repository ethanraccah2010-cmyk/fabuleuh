/* =====================================================================
   POST /api/reserver
   ---------------------------------------------------------------------
   Corps JSON attendu :
     { prenom, nom, email, telephone, couverts, date, heure, message? }

   Étapes :
     1. Validation des champs.
     2. Vérification que le créneau existe bien ce jour-là (anti-triche).
     3. RE-VÉRIFICATION en direct que le créneau est toujours libre
        (anti double-réservation) juste avant d'écrire.
     4. Création de l'événement dans Google Agenda.

   Réponses : 200 { ok:true, ... } · 409 (créneau pris) · 400 (champs) · 5xx
   ===================================================================== */
const {
  genererCreneaux,
  dateValide,
  getCalendarClient,
  lirePlagesOccupees,
  creneauLibre,
  creerEvenement,
} = require("../lib/calendar");

const estEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");
const estTel = (v) => /^[+()\d\s.-]{8,}$/.test(v || "");

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  // 0. Méthode
  if (req.method !== "POST") {
    return res.status(405).json({ erreur: "Méthode non autorisée." });
  }

  // 1. Lecture du corps (déjà parsé par Vercel si JSON ; sinon on parse)
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  if (!body || typeof body !== "object") {
    return res.status(400).json({ erreur: "Requête invalide." });
  }

  const prenom = String(body.prenom || "").trim();
  const nom = String(body.nom || "").trim();
  const email = String(body.email || "").trim();
  const telephone = String(body.telephone || "").trim();
  const message = String(body.message || "").trim();
  const date = String(body.date || "").trim();
  const heure = String(body.heure || "").trim();
  const couverts = parseInt(body.couverts, 10);

  // 2. Validation des champs
  const erreurs = [];
  if (!prenom) erreurs.push("prénom");
  if (!nom) erreurs.push("nom");
  if (!estEmail(email)) erreurs.push("e-mail");
  if (!estTel(telephone)) erreurs.push("téléphone");
  if (!Number.isInteger(couverts) || couverts < 1 || couverts > 30) erreurs.push("couverts");
  if (!dateValide(date)) erreurs.push("date");
  if (!/^\d{2}:\d{2}$/.test(heure)) erreurs.push("créneau");
  if (erreurs.length) {
    return res.status(400).json({ erreur: `Champs invalides ou manquants : ${erreurs.join(", ")}.` });
  }

  try {
    // 3. Le créneau demandé doit exister dans la grille du jour
    const candidats = genererCreneaux(date);
    const creneau = candidats.find((c) => c.heure === heure);
    if (!creneau) {
      return res.status(400).json({ erreur: "Ce créneau n'existe pas pour cette date." });
    }
    // Pas de réservation dans le passé
    if (creneau.debut.getTime() <= Date.now()) {
      return res.status(409).json({ erreur: "Ce créneau est déjà passé. Choisissez-en un autre." });
    }

    // 4. RE-VÉRIFICATION en direct : le créneau est-il toujours libre ?
    const calendar = getCalendarClient();
    const plages = await lirePlagesOccupees(calendar, creneau.debut, creneau.fin);
    if (!creneauLibre(creneau, plages)) {
      return res.status(409).json({
        erreur: "Désolé, ce créneau vient d'être réservé. Merci d'en choisir un autre.",
      });
    }

    // 5. Création de l'événement (= confirmation automatique)
    const evt = await creerEvenement(calendar, {
      date, heure, prenom, nom, couverts, email, telephone, message,
    });

    return res.status(200).json({
      ok: true,
      message: `Réservation confirmée pour ${prenom} le ${date} à ${heure} (${couverts} couvert${couverts > 1 ? "s" : ""}).`,
      eventId: evt.id || null,
    });
  } catch (err) {
    console.error("reserver:", err);
    if (err.code === "CONFIG") {
      return res.status(500).json({ erreur: "Service de réservation non configuré. Merci d'appeler le restaurant." });
    }
    return res.status(502).json({ erreur: "Réservation impossible pour le moment (agenda injoignable). Réessayez ou appelez-nous." });
  }
};
