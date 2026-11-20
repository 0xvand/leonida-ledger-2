// The three supporting views: the six-phase roadmap to the platinum, the missables
// warning page, and the sources & citations ledger.

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderRoadmap(ctx) {
  const root = document.getElementById('roadmapRoot');
  const sections = ctx.guidebook.roadmap.map((phase) => {
    const section = el('section', 'phase');
    const head = el('div', 'phase-head');
    const title = el('h2');
    title.append(el('span', 'phase-no', `Phase ${phase.stage} — `), document.createTextNode(phase.title.replace(/^Phase \d+ — /, '')));
    head.append(title, el('span', 'phase-hours', phase.hours));
    section.append(head);
    section.append(el('p', 'phase-summary', phase.summary));

    if (phase.tips?.length) {
      const tips = el('ul', 'phase-tips');
      for (const tip of phase.tips) tips.append(el('li', '', tip));
      section.append(tips);
    }

    const earnedHere = phase.trophyIds.filter((id) => ctx.state.earned.has(id)).length;
    const progress = el('p', 'phase-progress');
    const count = el('b', '', `${earnedHere} of ${phase.trophyIds.length}`);
    progress.append(count, document.createTextNode(' earned in this phase — tap a trophy to open its guide:'));
    section.append(progress);

    const chips = el('div', 'trophy-chips');
    for (const id of phase.trophyIds) {
      const trophy = ctx.byId.get(id);
      if (!trophy) continue;
      const chip = el('button', 'tchip', '');
      chip.type = 'button';
      if (ctx.state.earned.has(id)) chip.classList.add('done');
      if (trophy.missable) chip.classList.add('miss');
      chip.append(el('span', `dot grade-${trophy.grade}`), document.createTextNode(
        `${ctx.state.earned.has(id) ? '✓ ' : ''}${trophy.name}${trophy.missable ? ' ⚠' : ''}`,
      ));
      chip.addEventListener('click', () => ctx.openGuide(id));
      chips.append(chip);
    }
    section.append(chips);
    return section;
  });
  root.replaceChildren(...sections);
}

export function renderMissables(ctx) {
  const root = document.getElementById('missablesRoot');
  const trophy = ctx.byId.get(28);

  const alert = el('section', 'alert-panel');
  alert.append(el('h2', '', '⚠ One missable trophy in the whole game'));
  alert.append(el('p', '', `${trophy.name} — “${trophy.description}”`));
  alert.append(el('p', '', trophy.missableNote));
  alert.append(el('p', '', 'The moment is small and easy to walk past: during Chapter 1, at Jason\u2019s house, the game offers a meditation. Take it. The other 17 meditation spots stay in free roam forever, so if the Chapter 1 spot is banked, this trophy can never be lost — and if it is missed, no amount of cleanup in the same playthrough brings it back.'));
  const open = el('button', 'open-guide-btn', 'Open the full guide & its 4 cited steps');
  open.type = 'button';
  open.addEventListener('click', () => ctx.openGuide(28));
  alert.append(open);

  const calm = el('section', 'calm-panel');
  calm.append(el('h3', '', 'Everything else is unmissable'));
  calm.append(el('p', '', 'The other 54 trophies can all be earned in free roam after the finale, at your own pace: the story trophies come from a linear campaign, and every collectible, activity and feat stays in the world. Two habits protect the whole run — never enter a cheat on a trophy playthrough (cheats disable trophies and saving for the session), and keep a manual save from before the final mission, because missions cannot be replayed.'));

  const habit = el('section', 'calm-panel');
  habit.append(el('h3', '', 'The Chapter 1 rule'));
  habit.append(el('p', '', 'Meditate whenever the story offers the prompt, starting with the one at Jason\u2019s house. It takes seconds, it counts toward the 18, and it is the only moment in a roughly 200-hour platinum run that cannot be redone.'));

  root.replaceChildren(alert, calm, habit);
}

export function renderSources(ctx) {
  const root = document.getElementById('sourcesRoot');

  const method = el('section', 'method-panel');
  method.append(el('h2', '', 'How the citations work'));
  method.append(el('p', '', ctx.guidebook.about.citationMethod));
  const totals = ctx.guidebook.about.totals;
  method.append(el('p', '', `The ledger in numbers: ${totals.trophies} trophies, ${totals.steps} steps, each carrying its source, drawn from ${totals.sources} dated sources.`));

  const grid = el('div', 'source-grid');
  for (const source of ctx.guidebook.sources) {
    const card = el('article', 'source-card');
    const heading = el('h3');
    const link = el('a', '', source.label);
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    heading.append(link);
    card.append(heading);
    card.append(el('p', 'source-date', source.date));
    card.append(el('p', '', source.note));
    grid.append(card);
  }
  root.replaceChildren(method, grid);
}
