/* =====================================================
   FIREBASE.JS — Synchronisation et persistance
   Gère Firebase en temps réel + fallback local
   ===================================================== */

// ── Helpers config ──────────────────────────────────

function getSavedConfig() {
  try {
    return JSON.parse(localStorage.getItem('orga-fb-config') || 'null');
  } catch(e) {
    return null;
  }
}

function openSetup() {
  document.getElementById('setup-modal').classList.remove('hidden');
}

// ── Actions modale setup ─────────────────────────────

function skipFirebase() {
  localStorage.setItem('orga-fb-skip', '1');
  document.getElementById('setup-modal').classList.add('hidden');
  useFirebase = false;
  setBanner('Mode local — données sur cet appareil uniquement', 'error');
  loadLocal();
  renderAll();
}

function saveFirebaseConfig() {
  const cfg = {
    apiKey:            document.getElementById('cfg-apiKey').value.trim(),
    projectId:         document.getElementById('cfg-projectId').value.trim(),
    appId:             document.getElementById('cfg-appId').value.trim(),
    messagingSenderId: document.getElementById('cfg-senderId').value.trim(),
    userKey:           document.getElementById('cfg-userkey').value.trim() || 'mon-organisateur'
  };
  if (!cfg.apiKey || !cfg.projectId) {
    alert('Veuillez remplir au moins apiKey et projectId.');
    return;
  }
  localStorage.setItem('orga-fb-config', JSON.stringify(cfg));
  localStorage.removeItem('orga-fb-skip');
  document.getElementById('setup-modal').classList.add('hidden');
  location.reload();
}

// ── Initialisation Firebase ──────────────────────────

function initFirebase(cfg) {
  try {
    const fbConfig = {
      apiKey:            cfg.apiKey,
      authDomain:        cfg.projectId + '.firebaseapp.com',
      projectId:         cfg.projectId,
      storageBucket:     cfg.projectId + '.appspot.com',
      messagingSenderId: cfg.messagingSenderId,
      appId:             cfg.appId,
      databaseURL:       'https://' + cfg.projectId + '-default-rtdb.europe-west1.firebasedatabase.app'
    };
    firebase.initializeApp(fbConfig);
    db         = firebase.database();
    userKey    = cfg.userKey || 'mon-organisateur';
    useFirebase = true;
    setBanner('Connexion Firebase…', 'loading');
    listenFirebase();
  } catch(e) {
    console.error('Firebase init error:', e);
    setBanner('Erreur Firebase — mode local activé', 'error');
    loadLocal();
    renderAll();
  }
}

// ── Écoute temps réel ────────────────────────────────

function listenFirebase() {
  const ref = db.ref('users/' + userKey);
  ref.on('value', snap => {
    const data  = snap.val() || {};
    tasks       = Object.values(data.tasks       || {});
    plannerData = data.plannerData               || {};
    agendaTasks = Object.values(data.agendaTasks || {});
    recurTasks  = Object.values(data.recurTasks  || {});
    lastSyncTime = new Date();

    checkRecurrences();
    checkAgendaTransfer();
    renderAll();

    const hhmm = lastSyncTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setBanner('Synchronisé · ' + hhmm, 'ok');
    document.getElementById('sync-status').textContent = 'Sync ' + hhmm;

  }, err => {
    setBanner('Erreur de synchronisation', 'error');
  });
}

// ── Bandeau de statut ────────────────────────────────

function setBanner(msg, type) {
  const b = document.getElementById('sync-banner');
  b.textContent = type === 'ok'    ? '✓ ' + msg
                : type === 'error' ? '⚠ ' + msg
                :                    '⏳ ' + msg;
  b.className = type;
  if (type === 'ok') setTimeout(() => b.classList.add('hidden'), 4000);
}

// ── Sauvegarde Firebase ──────────────────────────────

async function saveToFirebase() {
  if (!useFirebase || !db) { saveLocal(); return; }
  setBanner('Sauvegarde…', 'loading');
  try {
    const toObj = arr => arr.reduce((o, t) => { o[t.id] = t; return o; }, {});
    await db.ref('users/' + userKey).set({
      tasks:       toObj(tasks),
      plannerData,
      agendaTasks: toObj(agendaTasks),
      recurTasks:  toObj(recurTasks),
      updatedAt:   Date.now()
    });
  } catch(e) {
    setBanner('Erreur lors de la sauvegarde', 'error');
  }
}

// ── Fallback local (localStorage) ───────────────────

function saveLocal() {
  localStorage.setItem('orga-tasks3',   JSON.stringify(tasks));
  localStorage.setItem('orga-planner3', JSON.stringify(plannerData));
  localStorage.setItem('orga-agenda3',  JSON.stringify(agendaTasks));
  localStorage.setItem('orga-recur3',   JSON.stringify(recurTasks));
}

function loadLocal() {
  tasks       = JSON.parse(localStorage.getItem('orga-tasks3')   || '[]');
  plannerData = JSON.parse(localStorage.getItem('orga-planner3') || '{}');
  agendaTasks = JSON.parse(localStorage.getItem('orga-agenda3')  || '[]');
  recurTasks  = JSON.parse(localStorage.getItem('orga-recur3')   || '[]');
  checkRecurrences();
  checkAgendaTransfer();
}

// ── Point d'entrée unique pour sauvegarder ───────────

async function save() {
  if (useFirebase) await saveToFirebase();
  else saveLocal();
}
