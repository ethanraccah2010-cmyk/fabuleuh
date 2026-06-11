/* =====================================================================
   GET /api/disponibilites?date=YYYY-MM-DD
   ---------------------------------------------------------------------
   Lit Google Agenda et renvoie la liste des créneaux RÉELLEMENT libres
   pour la date demandée (selon les horaires et la règle 1 résa = 1 h).

   Réponse 200 : { date, creneaux: [{ heure:"12:00", service:"midi" }], total }
   ===================================================================== */
const {
  genererCreneaux,
  dateValide,
  getCalendarClient,
  lirePlagesOccupees,
  creneauLibre,
} = require("../lib/calendar");

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  // 1. Méthode
  if (req.method !== "GET") {
    return res.status(405).json({ erreur: "Méthode non autorisée." });
  }

  // 2. Paramètre date
  const date = (req.query && req.query.date) || "";
  if (!dateValide(date)) {
    return res.status(400).json({ erreur: "Date invalide (format attendu : AAAA-MM-JJ)." });
  }

  try {
    // 3. Créneaux candidats de la journée
    const candidats = genererCreneaux(date);
    if (!candidats.length) {
      return res.status(200).json({ date, creneaux: [], total: 0, message: "Aucun service ce jour-là." });
    }

    // 4. Fenêtre de lecture de l'agenda (du 1er au dernier créneau de la journée)
    const timeMin = candidats[0].debut;
    const timeMax = candidats[candidats.length - 1].fin;

    // 5. Lecture des plages occupées dans l'agenda
    const calendar = getCalendarClient();
    const plages = await lirePlagesOccupees(calendar, timeMin, timeMax);

    // 6. On garde les créneaux libres ET pas déjà passés (utile pour aujourd'hui)
    const maintenant = Date.now();
    const libres = candidats
      .filter((c) => c.debut.getTime() > maintenant)
      .filter((c) => creneauLibre(c, plages))
      .map((c) => ({ heure: c.heure, service: c.service }));

    return res.status(200).json({ date, creneaux: libres, total: libres.length });
  } catch (err) {
    console.error("disponibilites:", err);
    if (err.code === "CONFIG") {
      return res.status(500).json({ erreur: "Service de réservation non configuré. Merci d'appeler le restaurant." });
    }
    return res.status(502).json({ erreur: "Agenda momentanément injoignable. Réessayez ou appelez-nous." });
  }
};
