// The tracker view: the checklist of all 55 trophies with filters, the spoiler shield,
// per-trophy guides with a cited source chip on every step, and the earned toggles.

export const KIND_FILTERS = [
  { key: 'all', label: 'All 55' },
  { key: 'story', label: 'Story' },
  { key: 'missable', label: 'Missable' },
  { key: 'collectibles', label: 'Collectibles' },
  { key: 'activities', label: 'Activities' },
  { key: 'misc', label: 'Feats & fortune' },
];

export const KIND_LABELS = {
  story: 'Story',
  collectibles: 'Collectibles',
  activities: 'Activities',
  misc: 'Feats & fortune',
};

export const GRADE_POINTS = { platinum: 300, gold: 90, silver: 30, bronze: 15 };

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function isShielded(trophy, state) {
  return state.shield
    && trophy.kind === 'story'
    && !state.earned.has(trophy.id)
    && !state.revealed.has(trophy.id);
}

function matchesFilters(trophy, state) {
  if (state.kind === 'missable' && !trophy.missable) return false;
  if (state.kind !== 'all' && state.kind !== 'missable' && trophy.kind !== state.kind) return false;
  if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
  if (state.hideEarned && state.earned.has(trophy.id)) return false;
  if (state.query) {
    if (isShielded(trophy, state)) return false;
    const haystack = `${trophy.name} ${trophy.description}`.toLowerCase();
    if (!haystack.includes(state.query)) return false;
  }
  return true;
}

function badge(text, className) {
  return el('span', `badge ${className ?? ''}`.trim(), text);
}

function buildGuideBody(trophy, ctx) {
  const body = el('div', 'guide-body');
  if (trophy.missable && trophy.missableNote) {
    const note = el('p', 'missable-note');
    const strong = el('strong', '', 'MISSABLE — ');
    note.append(strong, document.createTextNode(trophy.missableNote));
    body.append(note);
  }
  body.append(el('p', 'guide-text', trophy.guide));

  const steps = el('ol', 'steps');
  for (const step of trophy.steps) {
    const li = el('li', '', step.text);
    li.append(el('span', 'step-cite', `— ${step.cite}`));
    steps.append(li);
  }
  body.append(steps);

  const sourcesLine = el('p', 'guide-sources');
  sourcesLine.append(document.createTextNode('Sources: '));
  trophy.sources.forEach((key, index) => {
    const source = ctx.sources.get(key);
    if (!source) return;
    if (index > 0) sourcesLine.append(document.createTextNode(' · '));
    const link = el('a', '', source.label);
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    sourcesLine.append(link);
  });
  body.append(sourcesLine);
  return body;
}

function buildCard(trophy, ctx) {
  const { state } = ctx;
  const card = el('article', `card grade-${trophy.grade}`);
  card.id = `trophy-${trophy.id}`;
  if (state.earned.has(trophy.id)) card.classList.add('is-earned');
  if (trophy.missable) card.classList.add('is-missable');

  const top = el('div', 'card-top');
  const shielded = isShielded(trophy, state);

  if (!shielded) {
    const boxWrap = el('label', 'earn-box');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = state.earned.has(trophy.id);
    box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    box.addEventListener('change', () => ctx.toggleEarned(trophy.id, box.checked));
    boxWrap.append(box);
    top.append(boxWrap);
  }

  const main = el('div', 'card-main');
  const nameRow = el('div', 'card-name-row');
  if (shielded) {
    nameRow.append(el('h3', 'card-name hidden-name', 'Hidden story trophy'));
  } else {
    nameRow.append(el('h3', 'card-name', trophy.name));
  }
  main.append(nameRow);
  main.append(el('p', 'official-desc', shielded
    ? 'Its name and description stay hidden behind the spoiler shield until you earn it.'
    : trophy.description));

  const badges = el('div', 'badges');
  badges.append(badge(trophy.grade, `grade-${trophy.grade}`));
  badges.append(badge(KIND_LABELS[trophy.kind] ?? trophy.kind));
  badges.append(badge(`Phase ${trophy.stage}`, 'stage'));
  if (!shielded) {
    badges.append(badge(`Difficulty ${trophy.difficulty}/10`));
    badges.append(badge(trophy.time));
  }
  if (trophy.missable) badges.append(badge('Missable', 'missable'));
  main.append(badges);
  top.append(main);

  if (shielded) {
    const reveal = el('button', 'reveal-btn', 'Reveal anyway');
    reveal.type = 'button';
    reveal.addEventListener('click', () => ctx.reveal(trophy.id));
    top.append(reveal);
  } else {
    const toggle = el('button', 'guide-toggle', ctx.openId === trophy.id ? 'Close guide' : 'Guide & steps');
    toggle.type = 'button';
    toggle.addEventListener('click', () => ctx.toggleOpen(trophy.id));
    top.append(toggle);
  }

  card.append(top);
  if (!shielded && ctx.openId === trophy.id) card.append(buildGuideBody(trophy, ctx));
  return card;
}

export function renderTracker(ctx) {
  const list = document.getElementById('trophyList');
  const shown = ctx.trophies.filter((trophy) => matchesFilters(trophy, ctx.state));
  list.replaceChildren(...shown.map((trophy) => buildCard(trophy, ctx)));

  const earnedShown = shown.filter((trophy) => ctx.state.earned.has(trophy.id)).length;
  document.getElementById('resultLine').textContent = shown.length === ctx.trophies.length
    ? `All 55 trophies · ${earnedShown} earned`
    : `Showing ${shown.length} of 55 trophies · ${earnedShown} earned in this view`;
  document.getElementById('shieldNote').hidden = !ctx.state.shield;
}

export function buildKindChips(ctx) {
  const wrap = document.getElementById('kindChips');
  wrap.replaceChildren(...KIND_FILTERS.map(({ key, label }) => {
    const chip = el('button', `chip${key === 'missable' ? ' chip-missable' : ''}`, label);
    chip.type = 'button';
    if (ctx.state.kind === key) chip.classList.add('is-active');
    chip.addEventListener('click', () => {
      ctx.state.kind = key;
      ctx.refresh();
    });
    return chip;
  }));
}
