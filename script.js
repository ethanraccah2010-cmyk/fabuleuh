/* =====================================================================
   LE FABUL'EUH GRILL — JavaScript (vanilla, aucun framework)
   1. Navigation  2. Reveal scroll  3. Données carte  4. Onglets
   5. Formulaire réservation  6. Année footer  7. Fallback images
   ===================================================================== */
(function () {
  "use strict";

  /* === 1. NAVIGATION ============================================== */
  const nav       = document.querySelector(".nav");
  const hamburger = document.querySelector(".hamburger");
  const navMobile = document.querySelector(".nav__mobile");

  const onScroll = () => { if (nav) nav.classList.toggle("scrolled", window.scrollY > 24); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (hamburger && navMobile) {
    const toggleMenu = (force) => {
      const open = force !== undefined ? force : !navMobile.classList.contains("open");
      navMobile.classList.toggle("open", open);
      hamburger.classList.toggle("open", open);
      hamburger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    hamburger.addEventListener("click", () => toggleMenu());
    navMobile.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));
    window.addEventListener("resize", () => { if (window.innerWidth >= 1024) toggleMenu(false); });
  }

  /* === 2. REVEAL AU SCROLL ======================================== */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* === 3. DONNÉES DE LA CARTE ====================================
     ⚠️  TRANSCRIPTION DEPUIS LE PDF FOURNI — À VÉRIFIER AVANT MISE EN LIGNE
     ---------------------------------------------------------------
     Structure : tableau de catégories { id, label, intro, items[] }.
     Chaque article : { name, price, desc?, tag? }.
     L'ORDRE DU TABLEAU = l'ordre des onglets et des panneaux affichés.
     Pour les cocktails, les tags « Avec alcool » / « Sans alcool » sont
     colorés automatiquement (rouge / vert) — voir le rendu plus bas.
     =============================================================== */
  const CARTE = [
    {
      id: "aperitifs", label: "Apéritifs & Bières",
      intro: "Pour bien démarrer.",
      items: [
        { name: "Kir Royal — 10 cl", price: "9,00 €", desc: "Crème de framboise, cassis ou pêche.", tag: "Apéritif" },
        { name: "Kir Vin Blanc — 10 cl", price: "4,50 €", desc: "Crème de framboise, cassis ou pêche." },
        { name: "Martini Rosso ou Bianco — 6 cl", price: "4,50 €" },
        { name: "Ricard — 2 cl", price: "4,00 €" },
        { name: "Bushmills — 4 cl", price: "10,00 €", desc: "Irlandais 10 ans single malt." },
        { name: "Whiskey Jack Daniel's — 4 cl", price: "8,15 €" },
        { name: "Scotch Whisky — 4 cl", price: "7,50 €" },
        { name: "1664 Blonde (pression)", price: "33 cl : 6,50 € · 50 cl : 8,50 €", tag: "Bière" },
        { name: "Panaché ou Monaco (pression)", price: "33 cl : 6,50 € · 50 cl : 8,50 €", tag: "Bière" },
        { name: "Grimbergen Blonde (pression)", price: "33 cl : 7,00 € · 50 cl : 9,00 €", tag: "Bière" },
        { name: "Bière du Moment (pression)", price: "33 cl : 7,00 € · 50 cl : 9,00 €", tag: "Bière" }
      ]
    },
    {
      id: "burgers", label: "Burgers",
      intro: "Pains briochés et steaks hachés frais, hachés à la commande. Doublez votre burger : 3,50 €. Suppl. bacon, œuf ou frites cheddar : 1 €.",
      items: [
        { name: "Le Fabul'euh", price: "17,90 €", desc: "Pain brioché, effeuillé de bœuf Charolais, salade, oignons rouges et Fourme d'Ambert fondue.", tag: "Signature" },
        { name: "Le Cheeseburger", price: "14,90 €", desc: "Pain brioché, sauce burger, steak haché frais, salade, oignons rouges et sauce cheddar fondu." },
        { name: "Le Raclette", price: "16,90 €", desc: "Pain brioché, sauce burger, steak haché frais, salade, oignons rouges et fromage à raclette." },
        { name: "Le Chicken", price: "14,90 €", desc: "Pain brioché, sauce burger, poulet croustillant, salade, oignons rouges et sauce aux morilles." }
      ]
    },
    {
      id: "viandes", label: "Viandes & Grillades",
      intro: "Nos plats sont servis avec une garniture et une sauce au choix. Garnitures : frites maison, haricots verts assaisonnés, pommes de terre grenaille, riz, salade verte, aligot fermier 200 g (suppl. 2,50 €). Sauces maison : roquefort, béarnaise, poivre, morilles (suppl. 1 €), confit d'oignons (suppl. 1 €).",
      items: [
        { name: "Assiette des Saveurs — 300 g", price: "22,90 €", desc: "Fondant de bœuf mariné, filet de kangourou, mini-brochette de poulet marinée façon tandoori.", tag: "Voyage gustatif" },
        { name: "Trio de l'Aveyron et du Ségala — 300 g", price: "25,90 €", desc: "½ chou farci artisanal, mini saucisse artisanale, pavé de veau fermier (Veau d'Aveyron et du Ségala Label Rouge)." },
        { name: "Entrecôte de Bœuf — La Classique 250 g", price: "22,50 €", desc: "Au sel de Guérande.", tag: "Le Bœuf Fan Club" },
        { name: "Entrecôte de Bœuf — La MAXiiii 500 g", price: "32,50 €", desc: "Au sel de Guérande." },
        { name: "Le Tendre Effeuillé de Charolais — 150 g", price: "15,50 €", tag: "Sélection du boucher" },
        { name: "Bavette d'Aloyau — 170 g", price: "16,50 €", desc: "Suppl. confit d'oignon 1 €." },
        { name: "Fondant de Bœuf — 220 g", price: "16,50 €", desc: "Mariné Tex Mex." },
        { name: "Le Steak Haché Frais", price: "13,50 €", desc: "Et ses palets de chèvre frais." },
        { name: "Tartare de Bœuf « Maison » — 200 g", price: "16,90 €", tag: "Maison" },
        { name: "Tartare de Bœuf « Maison » — 400 g", price: "23,90 €", tag: "Maison" },
        { name: "Filet de Bœuf", price: "25,90 €", desc: "Chateaubriand 180 g.", tag: "Viande d'exception" },
        { name: "Filet de Veau Fermier", price: "29,90 €", desc: "Façon Grenadin 180 g — Veau d'Aveyron et du Ségala Label Rouge.", tag: "Viande d'exception" },
        { name: "Cœur d'Aloyau de Veau Fermier", price: "23,90 €", desc: "Veau d'Aveyron et du Ségala Label Rouge." },
        { name: "Barbecue Ribs de Porc — 450 g", price: "22,90 €" },
        { name: "Filet de Kangourou — 220 g", price: "18,50 €" },
        { name: "Chou Farci Artisanal", price: "17,90 €" },
        { name: "La Tartineflette", price: "14,50 €", desc: "Tartine chaude : crème fraîche, mozzarella râpée, lardons fumés, oignons rissolés et fromage à raclette." },
        { name: "Saucisse du Sud-Ouest Artisanale", price: "14,50 €", tag: "Incontournable" },
        { name: "Brochette de Poulet", price: "15,20 €", desc: "Marinée façon Tandoori 180 g.", tag: "Incontournable" }
      ]
    },
    {
      id: "apartager", label: "À Partager",
      intro: "À grignoter à plusieurs, en attendant les grillades.",
      items: [
        { name: "Panier Fromager", price: "13,90 €", desc: "4 bouchées de cheddar légèrement relevées, 4 bâtonnets de mozzarella et 4 bouchées de camembert." },
        { name: "Panier Classique", price: "12,90 €", desc: "4 oignons frits croustillants, 4 beignets de filet entier de poulet et 4 calamars frits." },
        { name: "Tapas de Calamars Frits", price: "6,90 €", desc: "6 pièces." },
        { name: "Planche Mixte Charcuteries & Fromages", price: "17,00 €" }
      ]
    },
    {
      id: "entrees", label: "Entrées & Salades",
      intro: "Assiette garniture seule ou en accompagnement d'une entrée : 5 €.",
      items: [
        { name: "Œuf Poché", price: "9,90 €", desc: "Fabrication artisanale. Sauce aux morilles artisanale.", tag: "Maison" },
        { name: "Camembert Rôti au Four et ses Lardons Fumés", price: "9,90 €", desc: "Seul ou à partager." },
        { name: "Petite Salade de Chèvre Chaud", price: "8,20 €", desc: "Salade verte, vinaigrette, fromage de chèvre frais sur son toast et oignons." },
        { name: "La Miniflette", price: "8,90 €", desc: "½ tartine chaude : crème fraîche, mozzarella râpée, lardons fumés, oignons rissolés et fromage à raclette." },
        { name: "Ravioles au Parmesan et au Pesto", price: "8,90 €" }
      ]
    },
    {
      id: "menus", label: "Menus",
      intro: "Formules du restaurant.",
      items: [
        { name: "Midi Express", price: "10,90 €", desc: "Du lundi au vendredi, le midi uniquement (sauf jours fériés). Plat + boisson ou plat + dessert. Plats : steak haché frais maison façon bouchère, poulet croustillant, calamars frits à la romaine." },
        { name: "Menu du Chef", price: "17,90 € midi / 20,90 € soir", desc: "Entrée-plat-dessert ou plat-dessert-boisson. Entrées : tartare de bœuf maison, ½ chou farci artisanal (suppl. 1,50 €), calamars frits. Plats : brochette de poulet tandoori, bavette d'aloyau (suppl. confit d'oignons 1 €), filet de bœuf chateaubriand (suppl. 8 €), dos de loup de mer." },
        { name: "Menu Burger", price: "15,90 €", desc: "Burger + boisson. Le Chicken, Le Cheeseburger ou Le Raclette (suppl. 2 €)." },
        { name: "Menu Festif", price: "34,90 €", desc: "Apéritif (coupe de champagne ou Virgin Paradise) · Plat (filet de bœuf chateaubriand 180 g ou cœur d'aloyau de veau fermier 220 g, pommes grenailles et sauce aux morilles) · Dessert (chou craquelin façon profiterole ou coupe gourmande).", tag: "Festif" },
        { name: "Enfants Sages", price: "7,90 €", desc: "Jusqu'à 10 ans. Plat + boisson + dessert + surprise. Plats : steak haché frais, nuggets de poulet, burger enfant (double steak +2,50 €). Desserts : café express, 2 pancakes sauce chocolat.", tag: "Enfants" }
      ]
    },
    {
      id: "boissons", label: "Jus, Sodas & Eaux",
      intro: "Boissons fraîches et softs.",
      items: [
        { name: "Jus au Verre au Choix — 33 cl", price: "4,00 €", desc: "Jus d'orange ou jus d'ananas." },
        { name: "Diabolo — 33 cl", price: "4,10 €", desc: "Sirop menthe, fraise, citron, grenadine ou pêche." },
        { name: "Sodas en Bouteille", price: "4,10 €", desc: "Soda normal ou light 33 cl · Thé glacé 25 cl · Orangina 25 cl." },
        { name: "Perrier — 33 cl", price: "4,10 €" },
        { name: "Eau Gazeuse", price: "100 cl : 6,00 € · 50 cl : 5,00 €" },
        { name: "Eau Plate", price: "100 cl : 5,00 € · 50 cl : 4,00 €" }
      ]
    },
    {
      id: "cocktails", label: "Cocktails",
      intro: "Avec alcool : 9 € · Sans alcool : 7 €.",
      items: [
        { name: "Red Dream", price: "9,00 €", desc: "Gin, citron vert, purée de fraise et jus de citron vert.", tag: "Avec alcool" },
        { name: "Spritz", price: "9,00 €", desc: "Prosecco, Perrier, Apérol et orange fraîche.", tag: "Avec alcool" },
        { name: "Mojito Classique, Fraise ou Passion", price: "9,00 €", desc: "Rhum agricole, sirop de sucre de canne, citron vert, Perrier, menthe fraîche et cassonade.", tag: "Avec alcool" },
        { name: "Moscow Mule", price: "9,00 €", desc: "Vodka, citron vert, sirop de sucre de canne et Ginger Beer.", tag: "Avec alcool" },
        { name: "Caïpirinha / Caïpiroska / Ti'punch", price: "9,00 €", desc: "Cachaça, vodka ou rhum, citron vert et sirop de sucre de canne.", tag: "Avec alcool" },
        { name: "Piña Colada", price: "9,00 €", desc: "Rhum agricole, crème de Coco Lopez, crème fraîche et jus d'ananas.", tag: "Avec alcool" },
        { name: "Sex on the Beach", price: "9,00 €", desc: "Vodka, jus exotique, jus de citron vert, jus d'ananas et sirop de grenadine.", tag: "Avec alcool" },
        { name: "Virgin Mojito Classique, Fraise ou Passion", price: "7,00 €", desc: "Sirop saveur rhum, sirop de sucre de canne, citron vert, Perrier, menthe fraîche et cassonade.", tag: "Sans alcool" },
        { name: "Virgin Colada", price: "7,00 €", desc: "Sirop saveur rhum, crème de Coco Lopez, sirop de sucre de canne, crème fraîche et jus d'ananas.", tag: "Sans alcool" },
        { name: "Virgin Caraïbes", price: "7,00 €", desc: "Jus de goyave, jus de citron vert et sirop de grenadine.", tag: "Sans alcool" },
        { name: "Virgin Paradise", price: "7,00 €", desc: "Jus exotique et sirop de grenadine.", tag: "Sans alcool" }
      ]
    },
    {
      id: "cave", label: "La Cave",
      intro: "Une sélection de vins et de champagnes. Pichets (rouge, rosé ou blanc) : 50 cl 13,50 € · 25 cl 9,00 € · verre 12 cl 4,50 €.",
      items: [
        { name: "St Estèphe 2018 — Domaine Le Prieuré Jehanne", price: "55,00 €", desc: "Bouteille 75 cl.", tag: "Prestige · Rouge" },
        { name: "St Julien 2019 — Aspirant de Beychevelle", price: "55,00 €", desc: "Bouteille 75 cl.", tag: "Prestige · Rouge" },
        { name: "Nuits-Saint-Georges 2018 — Domaine Albert Bichot", price: "89,00 €", desc: "Bouteille 75 cl.", tag: "Prestige · Rouge" },
        { name: "Côte-Rôtie 2020 — La Sarrasine, Domaine de Bonserine", price: "89,00 €", desc: "Bouteille 75 cl.", tag: "Prestige · Rouge" },
        { name: "Chablis Blanc Cuvée Prestige 2022 — Domaine Chevallier", price: "39,00 €", desc: "Bouteille 75 cl.", tag: "Prestige · Blanc" },
        { name: "Miraval 2021 — AOP Côtes de Provence", price: "32,00 €", desc: "Bouteille 75 cl.", tag: "Prestige · Rosé" },
        { name: "Champagne Louis Roederer Brut Cuvée Collection", price: "69,00 €", desc: "Bouteille 75 cl.", tag: "Champagne" },
        { name: "AOP Haut-Médoc Chevalier d'Arcins", price: "Bouteille 28,00 € · Verre 7,00 €", tag: "Rouge" },
        { name: "Vin Californien Woodhaven", price: "Bouteille 28,00 € · Verre 7,00 €", tag: "Rouge" },
        { name: "Côtes du Rhône Les Jarlotiers", price: "Bouteille 24,00 € · Verre 6,00 €", tag: "Rouge" },
        { name: "AOP Bourgogne Pinot Noir", price: "Bouteille 25,00 € · Verre 6,50 €", tag: "Rouge" },
        { name: "Bourgogne Aligoté", price: "Bouteille 24,00 € · Verre 6,00 €", tag: "Blanc" },
        { name: "Pouilly Fumé", price: "Bouteille 28,00 € · Verre 7,00 €", tag: "Blanc" },
        { name: "AOP Côte de Provence Château Cavalier", price: "Bouteille 26,00 € · Verre 6,50 €", tag: "Rosé" }
      ]
    },
    {
      id: "fromages", label: "Fromages & Café",
      intro: "Pour finir en douceur.",
      items: [
        { name: "Assiette de Fromage", price: "6,90 €", desc: "Fromages fermiers du moment accompagnés d'une salade verte. Pour 1 € seulement, un verre de vin de pays en accompagnement." },
        { name: "Expresso ou Décaféiné Simple", price: "2,20 €" },
        { name: "Expresso ou Décaféiné Double", price: "4,20 €" },
        { name: "Thé ou Infusion", price: "3,20 €" },
        { name: "Café Crème Fouettée", price: "3,50 €" },
        { name: "Café du Brasseur", price: "6,00 €", desc: "Café, digestifs 2 cl." },
        { name: "Irish Coffee ou Caribbean Coffee", price: "8,50 €", desc: "Café, whisky ou rhum 2 cl, sirop de sucre de canne, crème fouettée." },
        { name: "Digestifs 4 cl", price: "7,00 €", desc: "Liqueur de menthe, Vieille Prune de Souillac, Cognac, Baileys, Poire, Calvados, Vieux Rhum, Armagnac, Limoncello, Get 31, rhums arrangés maison." }
      ]
    },
    {
      id: "desserts", label: "Desserts",
      intro: "La touche gourmande de fin de repas.",
      items: [
        { name: "Crème Brûlée", price: "6,50 €" },
        { name: "Cœur Coulant au Chocolat", price: "7,20 €", desc: "Et sa glace vanille." },
        { name: "Profiterole Chou Craquelin", price: "6,90 €" },
        { name: "Banane et M&M's", price: "5,90 €", desc: "Bananes, sauce chocolat chaud et éclats de M&M's." },
        { name: "Brioche Artisanale Façon Pain Perdu", price: "7,50 €", desc: "Nappée de sauce caramel au beurre salé. Suppl. Nutella 1 €." },
        { name: "Fromage Blanc", price: "4,90 €", desc: "Coulis de fruits rouges ou sauce caramel beurre salé." },
        { name: "Île Flottante", price: "5,50 €", desc: "Amandes effilées nappées d'un caramel au beurre salé." },
        { name: "Gaufre Gourmande", price: "7,50 €", desc: "Nappée de sauce chocolat. Suppl. Nutella 1 €." },
        { name: "Café ou Thé Douceur", price: "6,90 €", desc: "Café ou thé et ses mignardises du moment." },
        { name: "La Chocolatine", price: "7,90 €", desc: "Glace chocolat, glace Nuty, sauce chocolat chaud et crème fouettée.", tag: "Coupe glacée" },
        { name: "La Délicieuse", price: "6,50 €", desc: "Glace vanille, bananes, sauce caramel beurre salé, éclats de M&M's et crème fouettée.", tag: "Coupe glacée" },
        { name: "La Petite Dame Blanche", price: "6,00 €", desc: "Glace vanille, sauce chocolat chaud et crème fouettée.", tag: "Coupe glacée" },
        { name: "2 Boules au Choix", price: "5,20 €", desc: "Fabrication artisanale. Crèmes glacées : chocolat, vanille, nuty, rhum raisin, caramel beurre salé, fraise, noix de coco. Sorbets : mangue, citron jaune, passion, cassis noir." },
        { name: "Les Pauses Digestives", price: "4,90 €", desc: "Une boule de glace ou sorbet au choix + alcool 2 cl au choix." }
      ]
    }
  ];

  /* === 3bis. RENDU DE LA CARTE ==================================== */
  const tabsWrap   = document.getElementById("menu-tabs");
  const panelsWrap = document.getElementById("menu-panels");

  // Tags « Avec alcool » / « Sans alcool » → badge rouge / vert (cocktails)
  const tagClassFor = (tag) => {
    if (tag === "Avec alcool") return "menu-item__tag menu-item__tag--alc";
    if (tag === "Sans alcool") return "menu-item__tag menu-item__tag--noalc";
    return "menu-item__tag";
  };

  if (tabsWrap && panelsWrap) {
    CARTE.forEach((cat, i) => {
      const tab = document.createElement("button");
      tab.className = "tab" + (i === 0 ? " active" : "");
      tab.textContent = cat.label;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", i === 0 ? "true" : "false");
      tab.dataset.target = cat.id;
      tabsWrap.appendChild(tab);

      const panel = document.createElement("section");
      panel.className = "tab-panel" + (i === 0 ? " active" : "");
      panel.id = cat.id;
      panel.setAttribute("role", "tabpanel");

      let html = "";
      if (cat.intro) html += `<p class="menu-cat__intro">${cat.intro}</p>`;
      html += '<div class="menu-list">';
      cat.items.forEach((it) => {
        const tag  = it.tag  ? `<span class="${tagClassFor(it.tag)}">${it.tag}</span>` : "";
        const desc = it.desc ? `<p class="menu-item__desc">${it.desc}</p>` : "";
        html += `
          <article class="menu-item">
            <span class="menu-item__name">${it.name}${tag}</span>
            <span class="menu-item__price">${it.price}</span>
            ${desc}
          </article>`;
      });
      html += "</div>";
      panel.innerHTML = html;
      panelsWrap.appendChild(panel);
    });

    /* === 4. ONGLETS ============================================== */
    tabsWrap.addEventListener("click", (e) => {
      const tab = e.target.closest(".tab");
      if (!tab) return;
      const target = tab.dataset.target;
      tabsWrap.querySelectorAll(".tab").forEach((t) => {
        const on = t === tab;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", String(on));
      });
      panelsWrap.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === target));
    });

    // Ouvre l'onglet correspondant à l'ancre (#viandes, #burgers…)
    const hash = location.hash.replace("#", "");
    if (hash) {
      const t = tabsWrap.querySelector(`.tab[data-target="${hash}"]`);
      if (t) t.click();
    }
  }

  /* === 5. RÉSERVATION EN LIGNE (Google Agenda) ===================
     Flux : choix d'une date → /api/disponibilites affiche les créneaux
     libres → clic sur un créneau → envoi à /api/reserver (re-vérif +
     création de l'événement). Gère le chargement, le succès et l'erreur.
     =============================================================== */
  const form = document.getElementById("reservation-form");
  if (form) {
    const feedback      = form.querySelector(".form__feedback");
    const dateInput     = form.querySelector('[name="date"]');
    const heureInput    = form.querySelector("#heure");        // input caché : créneau choisi
    const creneaux      = form.querySelector("#creneaux");     // conteneur des boutons
    const creneauxField = form.querySelector("#creneaux-field");
    const submitBtn     = form.querySelector("#reservation-submit");
    const submitHtml    = submitBtn ? submitBtn.innerHTML : "";

    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const isPhone = (v) => /^[+()\d\s.-]{8,}$/.test(v);
    const LABELS  = { midi: "Midi", soir: "Soir" };

    const showError  = (field, msg) => { const w = field.closest(".field"); if (!w) return; w.classList.add("field--error"); const e = w.querySelector(".field__err"); if (e && msg) e.textContent = msg; };
    const clearError = (field) => field && field.closest(".field")?.classList.remove("field--error");

    const showFeedback = (html, erreur) => {
      if (!feedback) return;
      feedback.classList.toggle("form__feedback--error", !!erreur);
      feedback.innerHTML = html;
      feedback.classList.add("show");
      feedback.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    const hideFeedback = () => feedback && feedback.classList.remove("show");

    const setCreneaux    = (state, html) => { creneaux.dataset.state = state; creneaux.innerHTML = html; };
    const resetSelection = () => { if (heureInput) heureInput.value = ""; };

    // Date minimale = aujourd'hui
    if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

    // --- Charge et affiche les créneaux libres d'une date ---
    async function chargerCreneaux(date) {
      resetSelection();
      clearError(heureInput);
      if (!date) {
        setCreneaux("vide", '<p class="creneaux__hint"><i class="fa-solid fa-calendar-day"></i> Choisissez d\'abord une date pour afficher les créneaux disponibles.</p>');
        return;
      }
      setCreneaux("chargement", '<p class="creneaux__hint"><i class="fa-solid fa-spinner fa-spin"></i> Recherche des créneaux disponibles…</p>');
      try {
        const res  = await fetch(`/api/disponibilites?date=${encodeURIComponent(date)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.erreur || "Erreur");
        if (!data.creneaux || !data.creneaux.length) {
          setCreneaux("vide", '<p class="creneaux__hint creneaux__hint--vide"><i class="fa-solid fa-circle-xmark"></i> Aucun créneau disponible ce jour-là. Essayez une autre date ou appelez le 01 69 96 92 32.</p>');
          return;
        }
        // Regroupe les créneaux par service (midi / soir)
        const groupes = {};
        data.creneaux.forEach((c) => { (groupes[c.service] = groupes[c.service] || []).push(c.heure); });
        let html = "";
        Object.keys(groupes).forEach((service) => {
          html += `<div class="creneaux__groupe"><span class="creneaux__titre">${LABELS[service] || service}</span><div class="creneaux__list">`;
          groupes[service].forEach((h) => {
            html += `<button type="button" class="creneau" data-heure="${h}">${h.replace(":", "h")}</button>`;
          });
          html += "</div></div>";
        });
        setCreneaux("ok", html);
      } catch (err) {
        setCreneaux("erreur", '<p class="creneaux__hint creneaux__hint--vide"><i class="fa-solid fa-triangle-exclamation"></i> Impossible de charger les créneaux. Réessayez ou appelez le 01 69 96 92 32.</p>');
      }
    }

    // Sélection d'un créneau (délégation d'événement)
    creneaux.addEventListener("click", (e) => {
      const btn = e.target.closest(".creneau");
      if (!btn) return;
      creneaux.querySelectorAll(".creneau").forEach((b) => b.classList.remove("creneau--active"));
      btn.classList.add("creneau--active");
      if (heureInput) heureInput.value = btn.dataset.heure;
      clearError(heureInput);
    });

    // Changement de date → on recharge les créneaux
    if (dateInput) dateInput.addEventListener("change", () => { hideFeedback(); chargerCreneaux(dateInput.value); });

    // Validation des champs (hors créneau, géré à part)
    function validerChamps() {
      let ok = true;
      form.querySelectorAll("input[required]").forEach((field) => {
        clearError(field);
        const val = (field.value || "").trim();
        if (!val) { showError(field, "Champ requis."); ok = false; return; }
        if (field.type === "email" && !isEmail(val)) { showError(field, "E-mail invalide."); ok = false; }
        if (field.name === "telephone" && !isPhone(val)) { showError(field, "Téléphone invalide."); ok = false; }
        if (field.name === "couverts" && Number(val) < 1) { showError(field, "Au moins 1 couvert."); ok = false; }
      });
      // Un créneau doit être sélectionné
      if (!heureInput || !heureInput.value) { creneauxField.classList.add("field--error"); ok = false; }
      else creneauxField.classList.remove("field--error");
      return ok;
    }

    // --- Envoi de la réservation ---
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideFeedback();
      if (!validerChamps()) {
        form.querySelector(".field--error")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      const payload = {
        prenom:    form.prenom.value.trim(),
        nom:       form.nom.value.trim(),
        email:     form.email.value.trim(),
        telephone: form.telephone.value.trim(),
        couverts:  parseInt(form.couverts.value, 10),
        date:      form.date.value,
        heure:     heureInput.value,
        message:   form.message ? form.message.value.trim() : "",
      };

      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Réservation…'; }
      try {
        const res  = await fetch("/api/reserver", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          // 409 = créneau pris entre-temps → on rafraîchit la liste pour refléter la réalité
          if (res.status === 409 && dateInput) chargerCreneaux(dateInput.value);
          throw new Error(data.erreur || "Réservation impossible.");
        }
        showFeedback(`<i class="fa-solid fa-circle-check"></i> ${data.message || "Réservation confirmée !"} À très vite au Fabul'euh !`, false);
        form.reset();
        resetSelection();
        setCreneaux("vide", '<p class="creneaux__hint"><i class="fa-solid fa-calendar-day"></i> Choisissez une date pour une nouvelle réservation.</p>');
      } catch (err) {
        showFeedback(`<i class="fa-solid fa-triangle-exclamation"></i> ${err.message} Vous pouvez aussi appeler le <a href="tel:+33169969232">01 69 96 92 32</a>.`, true);
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = submitHtml; }
      }
    });

    // Efface l'erreur d'un champ dès qu'on le corrige
    form.querySelectorAll("input, textarea").forEach((field) =>
      field.addEventListener("input", () => clearError(field)));
  }

  /* === 6. ANNÉE FOOTER =========================================== */
  document.querySelectorAll(".js-year").forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* === 7. FALLBACK IMAGES MANQUANTES ============================= */
  const makePlaceholder = (img) => {
    const ph = document.createElement("div");
    ph.className = "img-fallback";
    ph.setAttribute("role", "img");
    ph.setAttribute("aria-label", img.alt || "Photo à venir");
    ph.innerHTML =
      '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M16 20c-6 0-9 5-9 11 0 8 6 13 13 14 1 7 5 13 11 17-3-1-7-1-10 1 5 1 9 4 12 8 4 5 8 7 14 7s10-2 14-7c3-4 7-7 12-8-3-2-7-2-10-1 6-4 10-10 11-17 7-1 13-6 13-14 0-6-3-11-9-11-4 0-7 2-9 6-5-5-12-8-22-8s-17 3-22 8c-2-4-5-6-9-6z"/></svg><span>' +
      (img.alt || "Photo à venir") + "</span>";
    img.replaceWith(ph);
  };
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => makePlaceholder(img), { once: true });
    if (img.complete && img.naturalWidth === 0) makePlaceholder(img);
  });
  const heroMedia = document.querySelector(".hero__media");
  if (heroMedia) {
    const test = new Image();
    test.onerror = () => { heroMedia.style.display = "none"; };
    test.src = "images/hero.jpg";
  }
})();
