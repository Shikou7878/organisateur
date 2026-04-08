/* =====================================================
   TASKS.JS — Tâches du jour
   Ajout, suppression, toggle, rendu
   ===================================================== */

function addTask() {
  const input = document.getElementById('task-input');
  const name  = input.value.trim();
  if (!name) return;
  tasks.push({
    id:       uid(),
    name,
    priority: document.getElementById('task-priority').value,
    duration: parseInt(document.getElementById('task-duration').value),
    done:     false
  });
  input.value = '';
  save();
  renderTasks();
}

function toggleTask(id) {
  const t = tasks.find(t => t.id == id);
  if (t) { t.done = !t.done; save(); renderTasks(); }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id != id);
  save();
  renderTasks();
}

function renderTasks() {
  const order  = { urgent: 0, important: 1, normal: 2 };
  const labels = { urgent: 'Urgent', important: 'Important', normal: 'Normal', done: 'Complétées' };
  const sorted = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return order[a.priority] - order[b.priority];
  });

  // Stats
  const total   = tasks.length;
  const done    = tasks.filter(t => t.done).length;
  const left    = total - done;
  const timeLeft = tasks.filter(t => !t.done).reduce((s, t) => s + t.duration, 0);

  document.getElementById('s-total').textContent = total;
  document.getElementById('s-done').textContent  = done;
  document.getElementById('s-left').textContent  = left;
  document.getElementById('s-time').textContent  = timeLeft >= 60
    ? Math.floor(timeLeft / 60) + 'h' + (timeLeft % 60 ? String(timeLeft % 60).padStart(2, '0') : '')
    : timeLeft + ' min';
  document.getElementById('tasks-subtitle').textContent = total + ' tâche' + (total > 1 ? 's' : '');
  document.getElementById('progress-bar').style.width   = total ? Math.round(done / total * 100) + '%' : '0%';

  const list = document.getElementById('task-list');

  if (!sorted.length) {
    list.innerHTML = '<div class="empty-state">Aucune tâche. Commencez par en ajouter une !</div>';
    return;
  }

  // Groupes
  const groups = { urgent: [], important: [], normal: [], done: [] };
  sorted.forEach(t => {
    if (t.done) groups.done.push(t);
    else groups[t.priority].push(t);
  });

  let html = '';
  for (const key of ['urgent', 'important', 'normal', 'done']) {
    if (!groups[key].length) continue;
    html += `<div class="task-group"><div class="group-label">${labels[key]}</div>`;
    groups[key].forEach(t => {
      const isRecur  = !!t.recurId;
      const isAgenda = !!t.agendaId;
      html += `
        <div class="task-card" draggable="true" ondragstart="startDrag(event,'${t.id}',null)">
          <div class="check-circle${t.done ? ' done' : ''}" onclick="toggleTask('${t.id}')"></div>
          ${isRecur  ? '<span class="recur-icon" title="Tâche récurrente">↻</span>' : ''}
          ${isAgenda ? '<span class="recur-icon" title="Depuis l\'agenda" style="color:var(--accent);">📅</span>' : ''}
          <div class="task-name${t.done ? ' done' : ''}">${esc(t.name)}</div>
          ${!t.done ? `<span class="badge badge-${t.priority}">${labels[t.priority]}</span>` : ''}
          <span class="task-dur">${t.duration}m</span>
          <button class="del-btn" onclick="deleteTask('${t.id}')">×</button>
        </div>`;
    });
    html += '</div>';
  }
  list.innerHTML = html;
}

// Écoute de la touche Entrée sur le champ de saisie
document.getElementById('task-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});
