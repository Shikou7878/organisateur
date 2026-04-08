/* =====================================================
   MATRIX.JS — Matrice d'Eisenhower
   Visualisation des tâches selon urgence / importance
   ===================================================== */

function renderMatrix() {
  const q = [[], [], [], []];

  tasks.filter(t => !t.done).forEach(t => {
    if      (t.priority === 'urgent')    q[0].push(t);
    else if (t.priority === 'important') q[1].push(t);
    else                                 q[2].push(t);
    // q[3] = ni urgent ni important (vide dans ce modèle à 3 priorités)
  });

  const cells = [
    { cls: 'mc-q1', head: 'Urgent + important',      sub: 'À faire maintenant', tasks: q[0] },
    { cls: 'mc-q2', head: 'Important, pas urgent',   sub: 'À planifier',        tasks: q[1] },
    { cls: 'mc-q3', head: 'Urgent, pas important',   sub: 'À déléguer',         tasks: q[2] },
    { cls: 'mc-q4', head: 'Ni urgent ni important',  sub: 'À éliminer',         tasks: q[3] }
  ];

  document.getElementById('matrix-grid').innerHTML = cells.map(c => `
    <div class="matrix-cell ${c.cls}">
      <div class="mc-head">${c.head}</div>
      <div class="mc-sub">${c.sub}</div>
      ${c.tasks.length
        ? c.tasks.map(t => `<div class="mc-task">${esc(t.name)}</div>`).join('')
        : '<div style="font-size:.78rem;color:var(--faint);font-style:italic;">—</div>'}
    </div>`).join('');
}
