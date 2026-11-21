const { app, BaseWindow, WebContentsView, ipcMain, session, shell } = require('electron');
const path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const UI = path.join(__dirname, 'ui'), UIU = pathToFileURL(UI).href, TOP = 84, SIDE = 340, PART = 'persist:xpbrowser';
const ENG = { google: 'https://www.google.com/search?q=%s', bing: 'https://www.bing.com/search?q=%s', duckduckgo: 'https://duckduckgo.com/?q=%s' };
let win, bar, side, sideKind = null, tabs = [], active = 0, nid = 1, dls = [], file, st;
const web = u => /^https?:\/\//i.test(u), okNav = u => web(u) || u.startsWith(UIU);
const save = () => { try { fs.writeFileSync(file, JSON.stringify(st)); } catch {} };
const cur = () => tabs.find(t => t.id === active);

// Chỉ http/https mới được mở; các giao thức khác (javascript:, file: ngoài ui/...) bị chặn.
function toURL(x, force) {
  x = x.trim(); if (!x) return null;
  if (!force) {
    if (web(x)) return x;
    if (!/\s/.test(x)) {
      if (/^(localhost|\d{1,3}(\.\d{1,3}){3})(:\d+)?([/?#].*)?$/i.test(x)) return 'http://' + x;
      if (/^([\w-]+\.)+[a-z]{2,}(:\d+)?([/?#].*)?$/i.test(x)) return 'https://' + x;
    }
  }
  return ENG[st.engine].replace('%s', encodeURIComponent(x));
}
const loadPage = (wc, k, q = {}) => wc.loadFile(path.join(UI, 'page.html'), { query: { k, e: ENG[st.engine], ...q } });
function shown(t) {
  const u = t.view.webContents.getURL();
  if (!u.startsWith(UIU)) return u;
  const p = new URL(u).searchParams; return p.get('k') === 'err' ? p.get('u') || '' : '';
}
function state() {
  const t = cur(), wc = t && t.view.webContents, u = t ? shown(t) : '';
  return { active, side: sideKind, url: u, loading: !!(t && t.loading),
    canBack: !!wc && wc.navigationHistory.canGoBack(), canFwd: !!wc && wc.navigationHistory.canGoForward(),
    bookmarked: st.bookmarks.some(b => b.url === u),
    tabs: tabs.map(x => ({ id: x.id, title: x.title, favicon: x.favicon, loading: x.loading })) };
}
const push = () => { if (bar && !bar.webContents.isDestroyed()) bar.webContents.send('state', state()); };
const pushSide = () => { if (side && !side.webContents.isDestroyed()) side.webContents.send('dl'); };
const sess = () => { st.session = tabs.map(x => x.last).filter(Boolean); save(); };

function layout() {
  const { width: w, height: h } = win.getContentBounds(), sw = sideKind ? SIDE : 0;
  bar.setBounds({ x: 0, y: 0, width: w, height: TOP });
  side.setBounds({ x: w - sw, y: TOP, width: sw, height: h - TOP });
  const t = cur(); if (t) t.view.setBounds({ x: 0, y: TOP, width: w - sw, height: h - TOP });
}
function select(id) {
  const t = tabs.find(x => x.id === id); if (!t) return;
  const p = cur(); if (p && p !== t) win.contentView.removeChildView(p.view);
  active = id; win.contentView.addChildView(t.view);
  if (sideKind) win.contentView.addChildView(side);
  win.contentView.addChildView(bar); layout(); push();
}
function newTab(u) {
  const view = new WebContentsView({ webPreferences: { partition: PART, sandbox: true, contextIsolation: true, nodeIntegration: false } });
  const t = { id: nid++, view, title: '', favicon: '', loading: false, last: web(u || '') ? u : '' }, wc = view.webContents; tabs.push(t);
  wc.setWindowOpenHandler(({ url }) => { if (web(url)) newTab(url); return { action: 'deny' }; });
  const guard = (e, url) => { if (!okNav(url)) e.preventDefault(); };
  wc.on('will-navigate', guard); wc.on('will-redirect', guard);
  wc.on('page-title-updated', (e, ti) => { t.title = ti; const h = st.history.find(x => x.url === wc.getURL()); if (h) { h.title = ti; save(); } push(); });
  wc.on('page-favicon-updated', (e, f) => { t.favicon = f[0] || ''; push(); });
  wc.on('did-start-loading', () => { t.loading = true; push(); });
  wc.on('did-stop-loading', () => { t.loading = false; push(); });
  wc.on('did-navigate', (e, url) => {
    if (web(url)) { t.last = url; st.history.unshift({ url, title: t.title || url, t: Date.now() }); st.history.length = Math.min(st.history.length, 2000); save(); }
    sess(); push();
  });
  wc.on('did-navigate-in-page', push);
  wc.on('did-fail-load', (e, code, desc, url, main) => { if (main && code !== -3 && !url.startsWith(UIU)) loadPage(wc, 'err', { u: url, d: desc }); });
  wc.on('render-process-gone', () => loadPage(wc, 'err', { u: shown(t), d: 'Tiến trình hiển thị đã dừng' }));
  wc.on('before-input-event', key);
  if (u && web(u)) wc.loadURL(u).catch(() => {}); else loadPage(wc, 'new');
  select(t.id);
}
function closeTab(id) {
  const i = tabs.findIndex(x => x.id === id); if (i < 0) return;
  const [t] = tabs.splice(i, 1); win.contentView.removeChildView(t.view); t.view.webContents.close();
  if (!tabs.length) { newTab(); return; }
  if (id === active) select(tabs[Math.min(i, tabs.length - 1)].id); else push();
  sess();
}
function showSide(k) {
  if (sideKind === k) k = null; sideKind = k;
  if (k) { win.contentView.addChildView(side); side.webContents.send('panel', k); } else win.contentView.removeChildView(side);
  layout(); push();
}
function key(e, i) {
  if (i.type !== 'keyDown') return;
  const c = i.control || i.meta, k = i.key.toLowerCase(); let h = true;
  if (c && k === 't') H.newtab(); else if (c && k === 'w') H.close(active);
  else if ((c && k === 'r') || k === 'f5') H.reload(); else if (c && k === 'l') bar.webContents.send('focus');
  else if (i.alt && k === 'arrowleft') H.back(); else if (i.alt && k === 'arrowright') H.forward();
  else if (c && k === 'd') H.star();
  else if (c && k === 'tab') { const n = tabs.findIndex(t => t.id === active); select(tabs[(n + 1) % tabs.length].id); }
  else h = false;
  if (h) e.preventDefault();
}
const H = {
  nav: (x, force) => { const u = toURL(String(x || ''), force); if (u && cur()) cur().view.webContents.loadURL(u).catch(() => {}); },
  newtab: u => { newTab(u); }, close: id => { closeTab(id); }, switch: id => { select(id); },
  back: () => { const t = cur(); if (t) t.view.webContents.navigationHistory.goBack(); },
  forward: () => { const t = cur(); if (t) t.view.webContents.navigationHistory.goForward(); },
  reload: () => { const t = cur(); if (!t) return; const wc = t.view.webContents, u = shown(t);
    if (wc.getURL().startsWith(UIU) && web(u)) wc.loadURL(u).catch(() => {}); else wc.reload(); },
  stop: () => { const t = cur(); if (t) t.view.webContents.stop(); },
  home: () => H.nav(st.home),
  star: () => { const t = cur(); if (!t) return; const u = shown(t); if (!web(u)) return;
    const i = st.bookmarks.findIndex(b => b.url === u);
    if (i < 0) st.bookmarks.unshift({ url: u, title: t.title || u }); else st.bookmarks.splice(i, 1);
    save(); push(); pushSide(); },
  panel: k => { showSide(k); },
  bms: () => st.bookmarks, hist: () => st.history.slice(0, 300), dls: () => dls,
  delbm: u => { st.bookmarks = st.bookmarks.filter(b => b.url !== u); save(); push(); },
  clrhist: () => { st.history = []; save(); },
  openf: id => { const d = dls.find(x => x.id === id); if (d) shell.showItemInFolder(d.path); },
  settings: s => { if (s) { if (web(String(s.home))) st.home = s.home; if (ENG[s.engine]) st.engine = s.engine; save(); } return { home: st.home, engine: st.engine }; }
};
// Chỉ giao diện của chính ứng dụng (thanh trên và bảng bên) được gọi IPC.
ipcMain.handle('b', (e, c, ...a) => {
  if (![bar.webContents, side.webContents].includes(e.sender) || !Object.hasOwn(H, c)) return;
  return H[c](...a);
});

app.whenReady().then(() => {
  file = path.join(app.getPath('userData'), 'store.json');
  const def = { home: 'https://www.google.com', engine: 'google', bookmarks: [], history: [], session: [] };
  try { st = { ...def, ...JSON.parse(fs.readFileSync(file, 'utf8')) }; } catch { st = def; }
  const ses = session.fromPartition(PART);
  ses.setUserAgent(ses.getUserAgent().replace(/\s(Electron|xp-browser)\/\S+/g, ''));
  ses.setPermissionRequestHandler((wc, p, cb) => cb(['fullscreen', 'clipboard-sanitized-write', 'pointerLock'].includes(p)));
  ses.on('will-download', (e, item) => {
    let p = path.join(app.getPath('downloads'), path.basename(item.getFilename()));
    if (fs.existsSync(p)) p = path.join(app.getPath('downloads'), Date.now() + '-' + path.basename(p));
    const d = { id: Date.now(), name: path.basename(p), state: 'đang tải', got: 0, total: item.getTotalBytes(), path: p };
    dls.unshift(d); item.setSavePath(p);
    item.on('updated', () => { d.got = item.getReceivedBytes(); pushSide(); });
    item.once('done', (ev, s) => { d.state = s === 'completed' ? 'hoàn tất' : 'lỗi'; pushSide(); });
  });
  win = new BaseWindow({ width: 1280, height: 820, minWidth: 640, minHeight: 420, title: 'XP Browser' });
  const wp = { preload: path.join(__dirname, 'preload.js'), sandbox: true, contextIsolation: true, nodeIntegration: false };
  bar = new WebContentsView({ webPreferences: wp }); side = new WebContentsView({ webPreferences: wp });
  for (const [v, m] of [[bar, 'bar'], [side, 'panel']]) {
    const wc = v.webContents;
    wc.loadFile(path.join(UI, 'index.html'), { query: { m } });
    wc.on('before-input-event', key);
    wc.on('will-navigate', e => e.preventDefault());
    wc.setWindowOpenHandler(() => ({ action: 'deny' }));
  }
  win.contentView.addChildView(bar);
  win.on('resize', layout); win.on('closed', () => app.quit());
  (st.session && st.session.length ? st.session : [undefined]).forEach(u => newTab(u));
});
app.on('window-all-closed', () => app.quit());
