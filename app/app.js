// GTA VI trophy tracker: checklist with localStorage progress, export/import,
// kind + grade filters, search, spoiler mode, a 5-stage platinum roadmap and a
// guide panel with cited sources for every trophy. No network requests at run
// time beyond the app's own files (data/trophies.json). URL params for
// deterministic views: ?filter=<kind|grade> ?spoiler=1 ?open=<id> ?demo=1
const STORAGE_KEY = 'gta6-trophy-guide-progress-v1';
const KIND_LABELS = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online' };
const STAGES = [
  { n: 1, title: 'Stage 1 — Play the story (Chapters 1–5)', hours: '60–80 hours', text: 'Finish all five chapters and the named story missions. Do the Chapter 1 meditation spot early, scan vehicles and study animals as you travel.' },
  { n: 2, title: 'Stage 2 — Strangers & side characters', hours: 'about 10 hours', text: 'Finish the 8 stranger strands and the final missions for Andy, Kenton, Billy, Randy and Tyrone, plus the hunt for Bret.' },
  { n: 3, title: 'Stage 3 — Activities, races & robberies', hours: 'ongoing', text: '250 stunts, gold in all 42 Shooting Range challenges, drone races at all 14 locations, 20 race wins, 50 of the 80 challenges, and the robbery and partner trophies.' },
  { n: 4, title: 'Stage 4 — Collectibles & economy', hours: 'ongoing', text: 'Explore all 52 areas, WAiNK It at 100 locations, 3 card sets, 100 vehicles, all 8 garages, 10 Scooter Bros registrations, $250,000 laundered, $100,000 spent.' },
  { n: 5, title: 'Stage 5 — 100% completion & platinum', hours: 'about 100 hours', text: 'Finish the 100% checklist (200 of 277 vehicles, 100 of 255 animals, any 70 of 80 challenges). A Long Road pops, then the platinum.' },
];

const params = new URLSearchParams(location.search);
const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detailPanel');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const missableOnlyEl = document.getElementById('missableOnly');
const unearnedOnlyEl = document.getElementById('unearnedOnly');

let trophies = [];
let earned = loadProgress();
let selectedId = null;

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(ids) ? ids.filter((x) => Number.isInteger(x)) : []);
  } catch {
    return new Set();
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function isSpoilerHidden(t) {
  return spoilerEl.checked && t.kind === 'story' && !earned.has(t.id);
}

function badge(text, cls) {
  const s = document.createElement('span');
  s.className = 'badge ' + cls;
  s.textContent = text;
  return s;
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.id)).length;
  const pct = total ? Math.round((100 * done) / total) : 0;
  document.getElementById('progressBig').textContent = done + ' / ' + total;
  document.getElementById('progressText').textContent = done + ' earned — platinum ' + pct + '% complete';
  const fill = document.getElementById('progressFill');
  fill.style.width = pct + '%';
  document.getElementById('progressBarWrap').setAttribute('aria-valuenow', String(done));
  const byGrade = {};
  for (const t of trophies) {
    byGrade[t.grade] = byGrade[t.grade] || [0, 0];
    byGrade[t.grade][1] += 1;
    if (earned.has(t.id)) byGrade[t.grade][0] += 1;
  }
  document.getElementById('gradeCounts').textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => (byGrade[g] ? byGrade[g][0] + '/' + byGrade[g][1] + ' ' + g : ''))
    .filter(Boolean)
    .join(' · ');
}

function visibleTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (missableOnlyEl.checked && !t.missable) return false;
    if (unearnedOnlyEl.checked && earned.has(t.id)) return false;
    if (q) {
      const hay = (t.name + ' ' + t.description + ' ' + (t.mission || '') + ' ' + (t.chapter || '')).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderList() {
  const shown = visibleTrophies();
  listEl.replaceChildren();
  document.getElementById('listMeta').textContent =
    'Showing ' + shown.length + ' of ' + trophies.length + ' trophies' +
    (spoilerEl.checked ? ' — spoiler mode on: un-earned story trophies are hidden' : '');
  for (const t of shown) {
    const li = document.createElement('li');
    li.dataset.id = String(t.id);
    li.className = 'trophy' + (earned.has(t.id) ? ' earned' : '') + (t.id === selectedId ? ' selected' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' earned');
    box.addEventListener('click', (e) => e.stopPropagation());
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      saveProgress();
      renderAll();
    });
    const body = document.createElement('div');
    body.className = 'trophy-body';
    const name = document.createElement('div');
    name.className = 'trophy-name';
    name.textContent = isSpoilerHidden(t) ? 'Hidden story trophy — earn it to reveal' : t.name;
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = isSpoilerHidden(t) ? 'Story spoiler hidden until earned (spoiler mode).' : t.description;
    const tags = document.createElement('div');
    tags.className = 'trophy-tags';
    tags.append(badge(t.grade, t.grade), badge(KIND_LABELS[t.kind] || t.kind, 'kind'), badge('Stage ' + t.roadmap, 'stage'));
    if (t.missable) tags.append(badge('⚠ Missable', 'missable'));
    if (t.chapter) tags.append(badge(t.chapter, 'stage'));
    body.append(name, desc, tags);
    li.append(box, body);
    li.addEventListener('click', () => { selectedId = t.id; renderAll(); });
    listEl.append(li);
  }
  if (!shown.length) {
    const li = document.createElement('li');
    li.className = 'muted';
    li.textContent = 'No trophies match these filters.';
    listEl.append(li);
  }
}

function renderRoadmap() {
  const host = document.getElementById('stages');
  host.replaceChildren();
  for (const s of STAGES) {
    const items = trophies.filter((t) => t.roadmap === s.n);
    const done = items.filter((t) => earned.has(t.id)).length;
    const li = document.createElement('li');
    li.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = s.title;
    const hours = document.createElement('p');
    hours.className = 'hours';
    hours.textContent = s.hours + ' · ' + done + '/' + items.length + ' earned';
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = s.text;
    const ul = document.createElement('ul');
    const shown = items.slice(0, 6);
    for (const t of shown) {
      const row = document.createElement('li');
      if (earned.has(t.id)) row.className = 'done';
      row.textContent = (isSpoilerHidden(t) ? 'Hidden story trophy' : t.name) + (t.missable ? ' ⚠' : '');
      row.addEventListener('click', () => { selectedId = t.id; renderAll(); });
      row.style.cursor = 'pointer';
      ul.append(row);
    }
    if (items.length > shown.length) {
      const more = document.createElement('li');
      more.className = 'muted';
      more.textContent = '+' + (items.length - shown.length) + ' more in the checklist below';
      ul.append(more);
    }
    li.append(h, hours, p, ul);
    host.append(li);
  }
}

function renderDetail() {
  const t = trophies.find((x) => x.id === selectedId);
  if (!t) {
    detailEl.innerHTML = '<p class="detail-empty">Select a trophy on the left to read its guide and sources here.</p>';
    return;
  }
  detailEl.replaceChildren();
  const h = document.createElement('h2');
  h.textContent = isSpoilerHidden(t) ? 'Hidden story trophy' : t.name;
  const tags = document.createElement('div');
  tags.className = 'trophy-tags';
  tags.append(badge(t.grade, t.grade), badge(KIND_LABELS[t.kind] || t.kind, 'kind'), badge('Roadmap stage ' + t.roadmap, 'stage'));
  if (t.missable) tags.append(badge('⚠ Missable', 'missable'));
  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = isSpoilerHidden(t)
    ? 'Official name and description hidden by spoiler mode until this story trophy is earned.'
    : 'Official description: “' + t.description + '”';
  const meta = document.createElement('p');
  meta.className = 'detail-meta';
  meta.textContent = [t.chapter, t.mission].filter(Boolean).join(' · ') || 'No chapter or mission attached.';
  detailEl.append(h, tags, desc, meta);
  if (t.missable) {
    const warn = document.createElement('p');
    warn.className = 'detail-warn';
    warn.textContent = '⚠ Missable — the only trophy PowerPyx flags as potentially missable. Do the Chapter 1 meditation spot before finishing Chapter 1, and keep a manual save from the start of the chapter.';
    detailEl.append(warn);
  }
  const guideTitle = document.createElement('h3');
  guideTitle.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  // In spoiler mode an un-earned story trophy's guide is hidden too: the
  // guide itself names the chapter and the mission, so showing it would
  // spoil exactly what the setting is meant to hide.
  guide.textContent = isSpoilerHidden(t)
    ? 'Guide hidden by spoiler mode until this story trophy is earned.'
    : t.guide;
  detailEl.append(guideTitle, guide);
  if (isSpoilerHidden(t)) {
    const actions = document.createElement('div');
    actions.className = 'detail-actions';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.textContent = 'Mark as earned';
    toggle.addEventListener('click', () => {
      earned.add(t.id);
      saveProgress();
      renderAll();
    });
    actions.append(toggle);
    detailEl.append(actions);
    return;
  }
  const srcTitle = document.createElement('h3');
  srcTitle.textContent = 'Sources';
  const ul = document.createElement('ul');
  ul.className = 'detail-sources';
  for (const s of t.sources || []) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.name;
    a.target = '_blank';
    a.rel = 'noopener';
    li.append(a);
    ul.append(li);
  }
  if (!ul.children.length) {
    const li = document.createElement('li');
    li.textContent = 'Official trophy description (PlayStation).';
    ul.append(li);
  }
  detailEl.append(srcTitle, ul);
  const actions = document.createElement('div');
  actions.className = 'detail-actions';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = earned.has(t.id) ? 'Mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => {
    if (earned.has(t.id)) earned.delete(t.id);
    else earned.add(t.id);
    saveProgress();
    renderAll();
  });
  actions.append(toggle);
  detailEl.append(actions);
}

function renderAll() {
  renderProgress();
  renderList();
  renderRoadmap();
  renderDetail();
}

function download(filename, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

document.getElementById('export').addEventListener('click', () => {
  download('gta6-trophy-progress.json', JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b) }, null, 2));
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('bad file');
    earned = new Set(ids.filter((x) => Number.isInteger(x)));
    saveProgress();
    renderAll();
  } catch {
    alert('That file is not a trophy-progress export from this guide.');
  }
  e.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    saveProgress();
    renderAll();
  }
});
for (const el of [searchEl, kindEl, gradeEl, spoilerEl, missableOnlyEl, unearnedOnlyEl]) {
  el.addEventListener('input', renderAll);
  el.addEventListener('change', renderAll);
}

// Load the trophy data, then honour the URL params for deterministic views.
const doc = await (await fetch('data/trophies.json')).json();
trophies = doc.trophies || doc;
const filter = params.get('filter');
if (filter) {
  if (Object.keys(KIND_LABELS).includes(filter)) kindEl.value = filter;
  else if (['platinum', 'gold', 'silver', 'bronze'].includes(filter)) gradeEl.value = filter;
  else if (filter === 'missable') missableOnlyEl.checked = true;
}
if (params.get('spoiler') === '1') spoilerEl.checked = true;
if (params.get('demo') === '1') {
  // A handful of earned trophies so progress, counts and the roadmap show state.
  for (const id of [2, 3, 15, 28, 42]) earned.add(id);
  saveProgress();
}
const openId = Number(params.get('open'));
if (Number.isInteger(openId) && trophies.some((t) => t.id === openId)) selectedId = openId;
renderAll();
