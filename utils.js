/* =====================================================
   UTILS.JS — Fonctions utilitaires partagées
   ===================================================== */

/** Retourne la date d'aujourd'hui au format YYYY-MM-DD */
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/** Retourne le lundi de la semaine contenant la date d */
function getWeekStart(d) {
  const day  = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const m    = new Date(d);
  m.setDate(d.getDate() + diff);
  m.setHours(0, 0, 0, 0);
  return m;
}

/** Ajoute n jours à la date d */
function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Convertit une Date en string YYYY-MM-DD */
function dateStr(d) {
  return d.toISOString().slice(0, 10);
}

/** Échappe les caractères HTML pour éviter les injections */
function esc(s) {
  return String(s)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

/** Génère un identifiant unique */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
