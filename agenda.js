/* =====================================================
   AGENDA.JS — Agenda hebdomadaire
   Ajout de tâches futures + transfert auto vers tâches du jour
   ===================================================== */

const DAYS_AGENDA   = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
const MONTHS_AGENDA = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc'];

// ── Transfert automatique agenda → tâches du jour ───

function checkAgendaTransfer() {
  const today   = todayStr();
  let changed   = false;
  agendaTasks.forEach(at => {
    if (at.date !== today || at.transferred) return;
    const exists = tasks.some(t => t.agendaId === at.id && t.generatedDate === today);
    if (!exists) {
      tasks.push({
        id: uid(), name: at.name, priority: at.priority,
        duration: at.duration, done: false,
        agendaId: at.id, generatedDate: today
      });
      at.transferred = true;
      changed = true;
    }
  });
  if (changed) save();
}

// ── CRUD ─────────────────────────────────────────────

function addAgendaTask() {
  const input = document.getElementById('agenda-input');
  const name  = input.value.trim();
  if (!name) return;
  const date  = document.getElementById('agenda-date').value;
  if (!date) { alert('Veuillez choisir une date.'); return; }

  agendaTasks.push({
    id:       uid(),
    name,
    priority: document.getElementById('agenda-priority').value,
    duration: parseInt(document.getElementById('agenda-duration').value),
    date,
    done:        false,
    transferred: false
  });
  input.value = '';
  save();
  renderAgenda();
}

function toggleAgenda(id) {
  const t = agendaTasks.find(t => t.id == id);
  if (t) { t.done = !t.done; save(); renderAgenda(); }
}

function deleteAgenda(id) {
  agendaTasks = agendaTasks.filter(t => t.id != id);
  save();
  renderAgenda();
}

// ── Navigation semaine ───────────────────────────────

function weekOffset(n) {
  if (n === 0) agendaWeekStart = getWeekStart(new Date());
  else         agendaWeekStart = addDays(agendaWeekStart, n * 7);
  renderAgenda();
}

// ── Rendu ────────────────────────────────────────────

function renderAgenda() {
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(agendaWeekStart, i));
  const to       = weekDays[6];
  const from     = weekDays[0];
  const todayS   = todayStr();

  document.getElementById('agenda-range').textContent =
    from.getDate() + ' ' + MONTHS_AGENDA[from.getMonth()] +
    ' – ' +
    to.getDate()   + ' ' + MONTHS_AGENDA[to.getMonth()] + ' ' + to.getFullYear();

  let html = '';

  weekDays.forEach((d, i) => {
    const ds       = dateStr(d);
    const dayTasks = agendaTasks.filter(t => t.date === ds);
    const isToday  = ds === todayS;
    const isPast   = ds < todayS;

    html += `
      <div class="agenda-day">
        <div class="agenda-day-header">
          <span class="agenda-day-date${isToday ? ' today' : ''}" style="${isPast ? 'opacity:.5' : ''}">
            ${DAYS_AGENDA[i]} ${d.getDate()} ${MONTHS_AGENDA[d.getMonth()]}
            ${isToday ? ' — Aujourd\'hui' : ''}
            ${isPast ? '<span style="font-size:.72rem;color:var(--faint);margin-left:6px;">passé</span>' : ''}
          </span>
          <span class="agenda-day-count">${dayTasks.length} tâche${dayTasks.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="agenda-day-body">
          ${dayTasks.length
            ? dayTasks.map(t => `
                <div class="agenda-task-item">
                  <div class="check-circle${t.done ? ' done' : ''}" onclick="toggleAgenda('${t.id}')"></div>
                  <div class="task-name${t.done ? ' done' : ''}" style="font-size:.88rem;">${esc(t.name)}</div>
                  ${t.transferred ? '<span style="font-size:.7rem;color:var(--accent);" title="Transféré dans les tâches du jour">✓ transféré</span>' : ''}
                  <span class="badge badge-${t.priority}" style="font-size:.68rem;">${t.priority === 'urgent' ? 'Urgent' : t.priority === 'important' ? 'Important' : 'Normal'}</span>
                  <span class="task-dur">${t.duration}m</span>
                  <button class="del-btn" onclick="deleteAgenda('${t.id}')">×</button>
                </div>`).join('')
            : '<div class="agenda-empty">Aucune tâche</div>'}
        </div>
      </div>`;
  });

  // Tâches au-delà de la semaine affichée
  const afterWeek = agendaTasks
    .filter(t => t.date > dateStr(to))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (afterWeek.length) {
    const byDate = {};
    afterWeek.forEach(t => {
      if (!byDate[t.date]) byDate[t.date] = [];
      byDate[t.date].push(t);
    });

    html += `<div style="margin-top:1.5rem;"><div class="group-label" style="margin-bottom:8px;">À venir (au-delà de cette semaine)</div>`;
    Object.entries(byDate).forEach(([ds, ts]) => {
      const d2 = new Date(ds + 'T12:00:00');
      const dn = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][d2.getDay()];
      html += `
        <div class="agenda-day">
          <div class="agenda-day-header">
            <span class="agenda-day-date">${dn} ${d2.getDate()} ${MONTHS_AGENDA[d2.getMonth()]} ${d2.getFullYear()}</span>
            <span class="agenda-day-count">${ts.length} tâche${ts.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="agenda-day-body">
            ${ts.map(t => `
              <div class="agenda-task-item">
                <div class="check-circle${t.done ? ' done' : ''}" onclick="toggleAgenda('${t.id}')"></div>
                <div class="task-name${t.done ? ' done' : ''}" style="font-size:.88rem;">${esc(t.name)}</div>
                <span class="badge badge-${t.priority}" style="font-size:.68rem;">${t.priority === 'urgent' ? 'Urgent' : t.priority === 'important' ? 'Important' : 'Normal'}</span>
                <span class="task-dur">${t.duration}m</span>
                <button class="del-btn" onclick="deleteAgenda('${t.id}')">×</button>
              </div>`).join('')}
          </div>
        </div>`;
    });
    html += '</div>';
  }

  document.getElementById('agenda-list').innerHTML = html;
}

// Écoute Entrée sur le champ agenda
document.getElementById('agenda-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addAgendaTask();
});
