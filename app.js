const KEY = 'applyboard-v1';
const STATUSES = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'];
const COLORS = {Wishlist:'#8b95b0', Applied:'#2f4bff', Interview:'#e09a00', Offer:'#1f9d55', Rejected:'#c4423a'};
const $ = id => document.getElementById(id);
const today = () => new Date().toISOString().slice(0, 10);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(d)) return d;
  } catch (e) {}
  return [
    {id: 1, company: 'Northwind Labs', role: 'Frontend developer intern', link: '', status: 'Applied', date: today(), notes: 'Used my portfolio link in the form.'},
    {id: 2, company: 'Pixel Harbor', role: 'UI engineering intern', link: '', status: 'Wishlist', date: today(), notes: 'Deadline is next month.'},
    {id: 3, company: 'Brightpath', role: 'Web developer intern', link: '', status: 'Interview', date: today(), notes: 'Prepare a short demo of the tracker.'}
  ];
}
let items = load();
let lastDeleted = null, toastTimer;

function save() { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} }

function visible() {
  const q = $('q').value.trim().toLowerCase(), f = $('f').value;
  return items.filter(i => (!f || i.status === f) &&
    (!q || [i.company, i.role, i.notes].join(' ').toLowerCase().includes(q)));
}

function render() {
  const list = visible();
  $('board').innerHTML = STATUSES.map(s => {
    const cards = list.filter(i => i.status === s);
    return `<section class="col" style="--c:${COLORS[s]}" aria-label="${s}">
      <h2>${s}<span>${cards.length}</span></h2>
      ${cards.map(cardHtml).join('') || '<p class="empty">Nothing here yet.</p>'}
    </section>`;
  }).join('');
  const applied = items.filter(i => i.status !== 'Wishlist').length;
  const replied = items.filter(i => ['Interview', 'Offer', 'Rejected'].includes(i.status)).length;
  $('sTotal').textContent = items.length;
  $('sApplied').textContent = applied;
  $('sRate').textContent = applied ? Math.round(replied / applied * 100) + '%' : '0%';
}

function cardHtml(i) {
  const link = /^https?:\/\//.test(i.link) ? ` <a href="${esc(i.link)}" target="_blank" rel="noopener noreferrer">Posting</a>` : '';
  return `<article class="card" data-id="${i.id}">
    <h3>${esc(i.company)}</h3>
    <p>${esc(i.role)}${link}</p>
    <p>${esc(i.date)}</p>
    ${i.notes ? `<p>${esc(i.notes)}</p>` : ''}
    <div class="row">
      <select data-act="move" aria-label="Move ${esc(i.company)} to another status">
        ${STATUSES.map(s => `<option${s === i.status ? ' selected' : ''}>${s}</option>`).join('')}
      </select>
      <button data-act="edit">Edit</button>
      <button data-act="del">Delete</button>
    </div>
  </article>`;
}

function toast(msg, canUndo) {
  $('toastMsg').textContent = msg;
  $('undo').style.display = canUndo ? '' : 'none';
  $('toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('show'), 5000);
}

function openForm(item) {
  $('dlgTitle').textContent = item ? 'Edit application' : 'Add application';
  $('form').dataset.id = item ? item.id : '';
  $('company').value = item ? item.company : '';
  $('role').value = item ? item.role : '';
  $('link').value = item ? item.link : '';
  $('status').value = item ? item.status : 'Applied';
  $('date').value = item ? item.date : today();
  $('notes').value = item ? item.notes : '';
  $('dlg').showModal();
  $('company').focus();
}

$('form').addEventListener('submit', () => {
  const id = Number($('form').dataset.id);
  const data = {company: $('company').value.trim(), role: $('role').value.trim(), link: $('link').value.trim(),
    status: $('status').value, date: $('date').value || today(), notes: $('notes').value.trim()};
  if (id) items = items.map(i => i.id === id ? {...i, ...data} : i);
  else items.unshift({id: Date.now(), ...data});
  save(); render(); toast(id ? 'Application updated.' : 'Application added.', false);
});

$('board').addEventListener('click', e => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const id = Number(btn.closest('.card').dataset.id), item = items.find(i => i.id === id);
  if (btn.dataset.act === 'edit') openForm(item);
  if (btn.dataset.act === 'del') {
    lastDeleted = {item, index: items.indexOf(item)};
    items = items.filter(i => i.id !== id);
    save(); render(); toast('Application deleted.', true);
  }
});
$('board').addEventListener('change', e => {
  if (e.target.dataset.act !== 'move') return;
  const id = Number(e.target.closest('.card').dataset.id);
  items = items.map(i => i.id === id ? {...i, status: e.target.value} : i);
  save(); render(); toast('Moved to ' + e.target.value + '.', false);
});

$('undo').addEventListener('click', () => {
  if (!lastDeleted) return;
  items.splice(lastDeleted.index, 0, lastDeleted.item);
  lastDeleted = null; save(); render(); toast('Application restored.', false);
});
$('add').addEventListener('click', () => openForm(null));
$('cancel').addEventListener('click', () => $('dlg').close());
$('q').addEventListener('input', render);
$('f').addEventListener('change', render);
$('export').addEventListener('click', async () => {
  const text = JSON.stringify(items, null, 2);
  try { await navigator.clipboard.writeText(text); toast('JSON copied to your clipboard.', false); }
  catch (e) { toast('Copy was blocked by the browser.', false); }
});
$('theme').addEventListener('click', () => {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
});

STATUSES.forEach(s => {
  $('status').add(new Option(s, s));
  $('f').add(new Option(s, s));
});
render();
