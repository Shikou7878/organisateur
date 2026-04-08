/* =====================================================
   PLANNER.JS — Planificateur horaire
   Drag & drop, créneaux, heures bloquées
   ===================================================== */

const MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const DAYS_FR   = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];

function getPlannerDay(dt) {
  if (!plannerData[dt])        plannerData[dt]         = { slots: {}, greyed: [] };
  if (!plannerData[dt].slots)  plannerData[dt].slots   = {};
  if (!plannerData[dt].greyed) plannerData[dt].greyed  = [];
  return plannerData[dt];
}

function onPlannerDateChange() {
  plannerDate = document.getElementById('planner-date').value;
  renderPlanner();
}

function renderPlanner() {
  const inp = document.getElementById('planner-date');
  if (!inp.value) inp.value = plannerDate;
  plannerDate = inp.value || todayStr();

  const d = new Date(plannerDate + 'T12:00:00');
  document.getElementById('planner-date-label').textContent =
    DAYS_FR[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS_FR[d.getMonth()] + ' ' + d.getFullYear();

  const dayData   = getPlannerDay(plannerDate);
  const placedIds = new Set();
  Object.values(dayData.slots).forEach(arr => arr.forEach(e => placedIds.add(e.taskId)));

  // Pool = tâches non complétées + tâches agenda de ce jour, non encore placées
  const agendaForDay = agendaTasks.filter(at => at.date === plannerDate && !placedIds.has(at.id));
  const pool = [...tasks.filter(t => !t.done && !placedIds.has(t.id)), ...agendaForDay];

  const poolEl = document.getElementById('planner-pool');
  poolEl.innerHTML = pool.length
    ? pool.map(t => `
        <div class="task-card" draggable="true" ondragstart="startDrag(event,'${t.id}',null)" style="margin-bottom:5px;">
          <div class="task-name" style="font-size:.85rem;">${esc(t.name)}</div>
          <span class="badge badge-${t.priority}" style="font-size:.68rem;">${t.priority === 'urgent' ? 'Urg' : t.priority === 'important' ? 'Imp' : 'Norm'}</span>
          <span class="task-dur">${t.duration}m</span>
        </div>`).join('')
    : '<div class="empty-state" style="padding:1rem .75rem;font-size:.8rem;">Toutes les tâches sont placées.</div>';

  // Grille horaire 04h → 23h
  const hours       = Array.from({ length: 20 }, (_, i) => i + 4);
  const allTaskPool = [...tasks, ...agendaTasks];
  const pad         = n => String(n).padStart(2, '0');

  document.getElementById('planner-wrap').innerHTML = hours.map(h => {
    const isGreyed  = dayData.greyed.includes(h);
    const slotItems = dayData.slots[h] || [];
    const tasksHtml = slotItems.map(e => {
      const t = allTaskPool.find(t => t.id == e.taskId);
      if (!t) return '';
      return `
        <div class="slot-task priority-${t.priority}" draggable="true" ondragstart="startDrag(event,'${t.id}',${h})">
          <span class="slot-task-name">${esc(t.name)}</span>
          <span class="slot-task-dur">${t.duration}m</span>
          <button class="slot-remove" onclick="removeFromSlot(${h},'${t.id}')">×</button>
        </div>`;
    }).join('');

    return `
      <div class="planner-row${isGreyed ? ' greyed' : ''}">
        <div class="hour-col">
          <span class="hour-label">${pad(h)}:00</span>
          <button class="grey-btn" onclick="toggleGrey(${h})" title="${isGreyed ? 'Débloquer' : 'Bloquer'}">⊘</button>
        </div>
        <div class="slot-col" id="slot-${h}"
          ondragover="onDragOver(event,${h})"
          ondragleave="document.getElementById('slot-${h}').classList.remove('drag-over')"
          ondrop="onDrop(event,${h})">
          ${isGreyed
            ? '<span class="greyed-label">créneau bloqué</span>'
            : (tasksHtml || '<span class="drop-hint">déposer ici</span>')}
        </div>
      </div>`;
  }).join('');
}

// ── Drag & drop ──────────────────────────────────────

function startDrag(e, taskId, fromSlot) {
  dragTaskId   = taskId;
  dragFromSlot = fromSlot;
  e.dataTransfer.effectAllowed = 'move';
}

function onDragOver(e, h) {
  e.preventDefault();
  const dd = getPlannerDay(plannerDate);
  if (!dd.greyed.includes(h)) document.getElementById('slot-' + h).classList.add('drag-over');
}

function onDrop(e, h) {
  e.preventDefault();
  document.getElementById('slot-' + h).classList.remove('drag-over');
  const dd = getPlannerDay(plannerDate);
  if (dd.greyed.includes(h)) return;
  if (!dd.slots[h]) dd.slots[h] = [];

  // Retirer de l'ancien créneau si déplacé depuis un slot
  if (dragFromSlot !== null && dragFromSlot !== undefined) {
    const fh = parseInt(dragFromSlot);
    if (dd.slots[fh]) dd.slots[fh] = dd.slots[fh].filter(e => e.taskId != dragTaskId);
  }

  // Ajouter au nouveau créneau (sans doublon)
  if (!dd.slots[h].find(e => e.taskId == dragTaskId)) {
    dd.slots[h].push({ taskId: dragTaskId });
  }

  save();
  renderPlanner();
}

function removeFromSlot(h, taskId) {
  const dd = getPlannerDay(plannerDate);
  if (dd.slots[h]) dd.slots[h] = dd.slots[h].filter(e => e.taskId != taskId);
  save();
  renderPlanner();
}

function toggleGrey(h) {
  const dd  = getPlannerDay(plannerDate);
  const idx = dd.greyed.indexOf(h);
  if (idx >= 0) dd.greyed.splice(idx, 1);
  else dd.greyed.push(h);
  save();
  renderPlanner();
}
