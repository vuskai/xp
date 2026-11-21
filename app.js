const M = new URLSearchParams(location.search).get('m'), call = api.call;
const h = (t, c, x, f) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; if (f) f(e); return e; };
const btn = (t, tip, fn) => h('button', 'nb', t, e => { e.title = tip; e.onclick = fn; });

if (M === 'bar') {
  document.body.className = 'bar';
  const tabs = h('div', 'tabs'), tb = h('div', 'tb'); let S = { tabs: [] }, last = 0;
  const back = btn('◀', 'Quay lại (Alt+←)', () => call('back')), fwd = btn('▶', 'Tiến tới (Alt+→)', () => call('forward')),
    rel = btn('⟳', 'Tải lại (Ctrl+R)', () => call(S.loading ? 'stop' : 'reload')),
    url = h('input', 'url', null, e => { e.placeholder = 'Nhập địa chỉ web hoặc từ khóa tìm kiếm'; e.spellcheck = false;
      e.onkeydown = k => { if (k.key === 'Enter') { call('nav', e.value); e.blur(); } }; e.onfocus = () => e.select(); }),
    star = btn('☆', 'Thêm dấu trang (Ctrl+D)', () => call('star'));
  tb.append(back, fwd, rel, btn('🏠', 'Trang chủ', () => call('home')), url,
    btn('🔍', 'Tìm kiếm nội dung đã nhập', () => call('nav', url.value, true)), star,
    ...[['⭐', 'Dấu trang', 'bm'], ['🕘', 'Lịch sử', 'hist'], ['⬇', 'Tải xuống', 'dl'], ['⚙', 'Cài đặt', 'set']].map(([i, t, k]) => btn(i, t, () => call('panel', k))));
  document.body.append(tabs, tb);
  api.on('state', s => {
    S = s;
    tabs.replaceChildren(...s.tabs.map(t => h('div', 'tab' + (t.id === s.active ? ' on' : ''), null, d => {
      d.append(t.loading ? h('i', 'spin') : t.favicon ? h('img', 0, null, i => { i.src = t.favicon; }) : h('span', 'dot', '🌐'),
        h('span', 'ttl', t.title || 'Tab mới'),
        h('button', 'x', '✕', x => { x.onclick = e => { e.stopPropagation(); call('close', t.id); }; }));
      d.onclick = () => call('switch', t.id);
    })), h('button', 'add', '+', e => { e.onclick = () => call('newtab'); }));
    back.disabled = !s.canBack; fwd.disabled = !s.canFwd; rel.textContent = s.loading ? '✕' : '⟳';
    star.textContent = s.bookmarked ? '★' : '☆';
    if (s.active !== last || document.activeElement !== url) { url.value = s.url; last = s.active; }
  });
  api.on('focus', () => url.focus());
} else {
  document.body.className = 'panel';
  const box = h('div', 'pbox'); document.body.append(box); let kind = null;
  const row = (t, s, open, del) => h('div', 'row', null, r => {
    r.append(h('div', 'rt', null, d => d.append(h('b', 0, t || s), h('small', 0, s))));
    if (del) r.append(h('button', 'rx', '✕', x => { x.onclick = e => { e.stopPropagation(); del(); }; }));
    r.onclick = open;
  });
  const head = t => h('div', 'ph', null, d => d.append(h('h3', 0, t), h('button', 'rx', '✕', x => { x.onclick = () => call('panel', kind); })));
  const fmt = n => n > 1e6 ? (n / 1e6).toFixed(1) + ' MB' : Math.round(n / 1e3) + ' KB';
  async function draw() {
    box.replaceChildren(); if (!kind) return;
    if (kind === 'bm') {
      box.append(head('Dấu trang')); const l = await call('bms');
      if (!l.length) box.append(h('p', 'em', 'Chưa có dấu trang. Bấm ☆ trên thanh công cụ để thêm.'));
      l.forEach(b => box.append(row(b.title, b.url, () => call('nav', b.url), async () => { await call('delbm', b.url); draw(); })));
    } else if (kind === 'hist') {
      box.append(head('Lịch sử'));
      const q = h('input', 'in', null, e => { e.placeholder = 'Tìm trong lịch sử'; }), l = await call('hist'), ls = h('div');
      const f = () => ls.replaceChildren(...l.filter(x => (x.title + x.url).toLowerCase().includes(q.value.toLowerCase())).map(x => row(x.title, x.url, () => call('nav', x.url))));
      q.oninput = f;
      box.append(q, h('button', 'act', 'Xóa toàn bộ lịch sử', e => { e.onclick = async () => { await call('clrhist'); draw(); }; }), ls); f();
    } else if (kind === 'dl') {
      box.append(head('Tải xuống')); const l = await call('dls');
      if (!l.length) box.append(h('p', 'em', 'Chưa có tệp tải xuống.'));
      l.forEach(d => box.append(row(d.name, d.state + (d.total ? ` · ${fmt(d.got)} / ${fmt(d.total)}` : ''), () => call('openf', d.id))));
    } else {
      const s = await call('settings'), hm = h('input', 'in', null, e => { e.value = s.home; }),
        en = h('select', 'in', null, e => ['google', 'bing', 'duckduckgo'].forEach(k => e.add(new Option(k, k, false, k === s.engine)))), ok = h('p', 'em', '');
      box.append(head('Cài đặt'), h('label', 0, 'Trang chủ (http/https)'), hm, h('label', 0, 'Công cụ tìm kiếm'), en,
        h('button', 'act', 'Lưu', e => { e.onclick = async () => { await call('settings', { home: hm.value, engine: en.value }); ok.textContent = 'Đã lưu.'; }; }), ok);
    }
  }
  api.on('panel', k => { kind = k; draw(); });
  api.on('dl', () => { if (kind === 'dl' || kind === 'bm') draw(); });
}
