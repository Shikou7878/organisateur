/* =====================================================
   STATE.JS — État global de l'application
   Toutes les données partagées entre les modules
   ===================================================== */

let tasks        = [];
let plannerData  = {};
let agendaTasks  = [];
let recurTasks   = [];

let agendaWeekStart = getWeekStart(new Date());
let plannerDate     = todayStr();
let dragTaskId      = null;
let dragFromSlot    = null;

let db           = null;
let useFirebase  = false;
let userKey      = USER_KEY;
let lastSyncTime = null;
