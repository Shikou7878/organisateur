/* =====================================================
   APP.JS — Initialisation et navigation
   Point d'entrée principal de l'application
   ===================================================== */

// ── Navigation entre pages ───────────────────────────

function showPage(name, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  el.classList.add('active');

  // Rendu spécifique à la page
  if (name === 'planner') renderPlanner();
  if (name === 'matrix')  renderMatrix();
  if (name === 'agenda')  renderAgenda();
  if (name === 'recur')   renderRecur();
}

// ── Rendu global (appelé après chaque sync Firebase) ─

function renderAll() {
  renderTasks();
  if (document.getElementById('page-planner').classList.contains('active')) renderPlanner();
  if (document.getElementById('page-matrix').classList.contains('active'))  renderMatrix();
  if (document.getElementById('page-agenda').classList.contains('active'))  renderAgenda();
  if (document.getElementById('page-recur').classList.contains('active'))   renderRecur();
}

// ── Date dans la sidebar ─────────────────────────────

function setDate() {
  const d      = new Date();
  const DAYS   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  const MONTHS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  document.getElementById('date-chip').textContent =
    DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
}

// ── Initialisation ───────────────────────────────────

// Valeurs par défaut des champs date
document.getElementById('planner-date').value = todayStr();
const tom = new Date();
tom.setDate(tom.getDate() + 1);
document.getElementById('agenda-date').value = tom.toISOString().slice(0, 10);

setDate();

// Choix Firebase ou local
const savedCfg = getSavedConfig();
const skipped  = localStorage.getItem('orga-fb-skip');

if (savedCfg && savedCfg.apiKey && savedCfg.apiKey !== 'VOTRE_API_KEY') {
  // Config sauvegardée → pré-remplir le formulaire et connecter
  document.getElementById('setup-modal').classList.add('hidden');
  document.getElementById('cfg-apiKey').value   = savedCfg.apiKey            || '';
  document.getElementById('cfg-projectId').value = savedCfg.projectId        || '';
  document.getElementById('cfg-appId').value     = savedCfg.appId            || '';
  document.getElementById('cfg-senderId').value  = savedCfg.messagingSenderId || '';
  document.getElementById('cfg-userkey').value   = savedCfg.userKey          || '';
  initFirebase(savedCfg);

} else if (skipped) {
  // Mode local explicitement choisi
  document.getElementById('setup-modal').classList.add('hidden');
  setBanner('Mode local — données sur cet appareil uniquement', 'error');
  loadLocal();
  renderAll();

} else if (FIREBASE_CONFIG.apiKey !== 'VOTRE_API_KEY') {
  // Config hardcodée dans config.js
  document.getElementById('setup-modal').classList.add('hidden');
  const cfg = { ...FIREBASE_CONFIG, userKey: USER_KEY };
  initFirebase(cfg);

} else {
  // Aucune config → afficher la modale
  setBanner('Configuration requise', 'error');
}
