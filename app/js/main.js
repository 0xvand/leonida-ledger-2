// LEONIDA LEDGER — boot and wiring: loads the two data files, owns the saved state
// (earned set, spoiler reveals, shield and filter settings in localStorage), keeps the
// progress header honest, switches the four views, and handles export / import.

import { GRADE_POINTS, buildKindChips, renderTracker } from './tracker.js';
import { renderMissables, renderRoadmap, renderSources } from './views.js';

const STORAGE_KEY = 'leonida-ledger-v2';
const RING_CIRCUMFERENCE = 226.2;

const trophyDoc = await (await fetch('data/trophies.json')).json();
const guidebook = await (await fetch('data/guidebook.json')).json();

const saved = readSaved();
const state = {
  earned: new Set(saved.earned),
  revealed: new Set(saved.revealed),
  shield: Boolean(saved.shield),
  hideEarned: Boolean(saved.hideEarned),
  kind: 'all',
  grade: 'all',
  query: '',
};

const ctx = {
  trophies: trophyDoc.trophies,
  byId: new Map(trophyDoc.trophies.map((trophy) => [trophy.id, trophy])),
  sources: new Map(guidebook.sources.map((source) => [source.key, source])),
  guidebook,
  state,
  openId: null,
  refresh,
  toggleEarned,
  toggleOpen,
  reveal,
  openGuide,
};

function readSaved() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return {
      earned: Array.isArray(raw.earned) ? raw.earned.filter(Number.isInteger) : [],
      revealed: Array.isArray(raw.revealed) ? raw.revealed.filter(Number.isInteger) : [],
      shield: raw.shield,
      hideEarned: raw.hideEarned,
    };
  } catch {
    return { earned: [], revealed: [], shield: false, hideEarned: false };
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    earned: [...state.earned],
    revealed: [...state.revealed],
    shield: state.shield,
    hideEarned: state.hideEarned,
  }));
}

function toggleEarned(id, on) {
  if (on) state.earned.add(id);
  else state.earned.delete(id);
  save();
  refresh();
}

function toggleOpen(id) {
  ctx.openId = ctx.openId === id ? null : id;
  renderTracker(ctx);
}

function reveal(id) {
  state.revealed.add(id);
  save();
  renderTracker(ctx);
}

function openGuide(id) {
  showView('tracker');
  ctx.openId = id;
  renderTracker(ctx);
  document.getElementById(`trophy-${id}`)?.scrollIntoView({ block: 'start' });
}

function refreshHeader() {
  const total = ctx.trophies.length;
  const earnedCount = state.earned.size;
  const pct = Math.round((earnedCount / total) * 100);
  document.getElementById('earnedCount').textContent = String(earnedCount);
  document.getElementById('pctText').textContent = `${pct}%`;
  document.getElementById('ringFill').style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - earnedCount / total));

  let points = 0;
  for (const trophy of ctx.trophies) {
    if (state.earned.has(trophy.id)) points += GRADE_POINTS[trophy.grade] ?? 0;
  }
  document.getElementById('pointsEarned').textContent = String(points);

  const counts = document.getElementById('gradeCounts');
  counts.replaceChildren(...['platinum', 'gold', 'silver', 'bronze'].map((grade) => {
    const inGrade = ctx.trophies.filter((trophy) => trophy.grade === grade);
    const got = inGrade.filter((trophy) => state.earned.has(trophy.id)).length;
    const li = document.createElement('li');
    const b = document.createElement('b');
    b.textContent = `${got}/${inGrade.length}`;
    li.append(b, document.createTextNode(` ${grade}`));
    return li;
  }));
}

function refresh() {
  refreshHeader();
  buildKindChips(ctx);
  renderTracker(ctx);
  renderRoadmap(ctx);
  renderMissables(ctx);
  renderSources(ctx);
}

function showView(name) {
  for (const view of ['tracker', 'roadmap', 'missables', 'sources']) {
    document.getElementById(`view-${view}`).hidden = view !== name;
  }
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('is-active', tab.dataset.view === name);
  }
}

function wireControls() {
  for (const tab of document.querySelectorAll('.tab')) {
    tab.addEventListener('click', () => showView(tab.dataset.view));
  }
  document.getElementById('search').addEventListener('input', (event) => {
    state.query = event.target.value.trim().toLowerCase();
    renderTracker(ctx);
  });
  document.getElementById('gradeFilter').addEventListener('change', (event) => {
    state.grade = event.target.value;
    renderTracker(ctx);
  });
  document.getElementById('hideEarned').addEventListener('change', (event) => {
    state.hideEarned = event.target.checked;
    save();
    renderTracker(ctx);
  });
  document.getElementById('shieldToggle').addEventListener('change', (event) => {
    state.shield = event.target.checked;
    save();
    renderTracker(ctx);
  });
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importFile').addEventListener('change', importProgress);
}

function exportProgress() {
  const payload = JSON.stringify({
    app: 'leonida-ledger',
    version: 2,
    exportedAt: new Date().toISOString(),
    earned: [...state.earned].sort((a, b) => a - b),
  }, null, 2);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  link.download = 'leonida-ledger-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function importProgress(event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(ids)) throw new Error('no earned list');
    state.earned = new Set(ids.filter((id) => ctx.byId.has(id)));
    save();
    refresh();
  } catch {
    document.getElementById('resultLine').textContent = 'That file did not parse as a LEONIDA LEDGER progress export.';
  }
  event.target.value = '';
}

// Deep links double as the screenshot rig: #view=roadmap, #open=28 (tracker with that
// guide open), #shield=1, and #earn=2,3,8 to show a run already under way.
function applyHash() {
  const params = new URLSearchParams(location.hash.replace(/^#/, ''));
  const earn = params.get('earn');
  let seeded = false;
  if (earn) {
    for (const part of earn.split(',')) {
      const id = Number(part);
      if (ctx.byId.has(id)) state.earned.add(id);
    }
    seeded = true;
  }
  if (params.get('shield') === '1') {
    state.shield = true;
    document.getElementById('shieldToggle').checked = true;
    seeded = true;
  }
  if (seeded) {
    save();
    refresh();
  }
  const view = params.get('view');
  if (view && ['tracker', 'roadmap', 'missables', 'sources'].includes(view)) showView(view);
  const open = Number(params.get('open'));
  if (Number.isInteger(open) && ctx.byId.has(open)) {
    ctx.openId = open;
    renderTracker(ctx);
    document.getElementById(`trophy-${open}`)?.scrollIntoView({ block: 'start' });
  }
}

document.getElementById('shieldToggle').checked = state.shield;
document.getElementById('hideEarned').checked = state.hideEarned;
wireControls();
refresh();
applyHash();
// Hash deep links also apply when the fragment changes in place, not just on a
// cold load — the screenshot rig and shared links both rely on that.
window.addEventListener('hashchange', applyHash);
