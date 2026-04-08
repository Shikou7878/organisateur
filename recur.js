/* =====================================================
   RECUR.JS — Tâches récurrentes
   Génération automatique quotidienne / hebdo / mensuelle
   ===================================================== */

// ── Génération automatique ───────────────────────────

function checkRecurrences() {
  const today   = todayStr();
  let changed   = false;

  recurTasks.forEach(rt => {
    if (!rt.active) return;

    const d     = new Date(today + 'T12:00:00');
    let match   = false;

    if (rt.freq === 'daily')                             match = true;
    if (rt.freq === 'weekly'  && d.getDay()  == rt.weekday)  match = true;
    if (rt.freq === 'monthly' && d.getDate() == rt.monthday) match = true;

    if (!match) return;
    if (rt.startDate && today < rt.startDate) return;

    // Déjà générée aujourd'hui ?
    const alreadyExists = tasks.some(t => t.recurId === rt.id && t.generatedDate === today);
    if (alreadyExists) return;

    tasks.push({
      id: uid(), name: rt.name, priority: rt.priority,
      duration: rt.duration, done: false,
      recurId: rt.id, generatedDate: today
    });
    changed = true;
  });

  if (changed) save();
}

// ── CRUD ─────────────────────────────────────────────

function addRecurTask() {
  const input     = document.getElementById('recur-input');
  const name      = input.value.trim();
  if (!name) return;

  const freq      = document.getElementById('recur-freq').value;
  const weekday   = parseInt(document.getElementById('recur-weekday').value);
  const startDate = document.getElementById('recur-start').value || todayStr();
  const today     = new Date(todayStr() + 'T12:00:00');

  recurTasks.push({
    id:        uid(),
    name,
    priority:  document.getElementById('recur-priority').value,
    duration:  parseInt(document.getElementById('recur-duration').value),
    freq,
    weekday,
    monthday:  today.getDate(),
    startDate,
    active:    true
  });

  input.value = '';
  save();
  renderRecur();
  checkRecurrences();
  renderTasks();
}

function toggleRecur(id) {
  const r = recurTasks.find(r => r.id == id);
  if (r) { r.active = !r.active; save(); renderRecur(); }
}

function deleteRecur(id) {
  recurTasks = recurTasks.filter(r => r.id != id);
  save();
  renderRecur();
}

// ── Rendu ────────────────────────────────────────────

function renderRecur() {
  const FREQ  = { daily: 'Chaque jour', weekly: 'Chaque semaine', monthly: 'Chaque mois' };
  const WDAYS = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
  const list  = document.getElementById('recur-list');

  if (!recurTasks.length) {
    list.innerHTML = '<div class="empty-state">Aucune tâche récurrente.</div>';
    return;
  }

  list.innerHTML = recurTasks.map(r => `
    <div class="recur-item">
      <div class="check-circle${r.active ? '' : ' done'}" onclick="toggleRecur('${r.id}')" title="${r.active ? 'Désactiver' : 'Activer'}"></div>
      <div class="task-name${r.active ? '' : ' done'}">${esc(r.name)}</div>
      <span class="recur-freq">
        ${FREQ[r.freq]}
        ${r.freq === 'weekly'  ? ' (' + WDAYS[r.weekday] + ')' : ''}
        ${r.freq === 'monthly' ? ' (le ' + r.monthday + ')' : ''}
      </span>
      <span class="badge badge-${r.priority}" style="font-size:.68rem;">${r.priority === 'urgent' ? 'Urgent' : r.priority === 'important' ? 'Important' : 'Normal'}</span>
      <span class="task-dur">${r.duration}m</span>
      <button class="del-btn" onclick="deleteRecur('${r.id}')">×</button>
    </div>`).join('');
}

// Écoute Entrée
document.getElementById('recur-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addRecurTask();
});
