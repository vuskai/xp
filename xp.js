/* XP Luna shell: WindowManager, taskbar, Start menu, desktop icons, context menus, stickman. Loads after the base desktop script. */
(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],D=()=>$('#desk'),
E=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e},
esc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';'),
uid=()=>'x'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),APP=id=>A.find(a=>a[0]==id);
let U;try{U=JSON.parse(localStorage.xpui)}catch(e){}
U=Object.assign({pos:{},ex:[],hide:[],nm:{},pin:['ie','wmp','paint','note','calc'],use:{},stk:[],auto:0,grid:1,lock:0,ql:1,bg:'bliss',th:'blue',ss:1},U);
const us=()=>{try{localStorage.xpui=JSON.stringify(U)}catch(e){}};
const CW=84,CH=84;let CX=[200,200],M=[0,0],CM=[];
const trk=(e,fn)=>{const d=D(),up=()=>{removeEventListener('pointermove',fn);removeEventListener('pointerup',up);d.classList.remove('drag')};d.classList.add('drag');addEventListener('pointermove',fn);addEventListener('pointerup',up)};
const grab=(r,sz)=>{const o={...r};let s=null;const mv=v=>{if(!s)s=[v.clientX,v.clientY];const dx=v.clientX-s[0],dy=v.clientY-s[1];if(sz){r.w=Math.max(200,o.w+dx);r.h=Math.max(120,o.h+dy)}else{r.x=o.x+dx;r.y=Math.max(0,o.y+dy)}WM.pos(r)},end=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerdown',end,true);removeEventListener('keydown',end,true)};addEventListener('pointermove',mv);addEventListener('pointerdown',end,true);addEventListener('keydown',end,true)};

/* ---------- WindowManager: every app window goes through here ---------- */
const WM={m:new Map,z:10,n:0,id:0,
open(t,ic,w,h,build){
 const a=A.find(a=>a[1]==t),id='w'+ ++WM.id,el=E('div','win');if(a){U.use[a[0]]=(U.use[a[0]]||0)+1;us()}
 const r={id,app:a?a[0]:'dialog',title:t,icon:ic,x:40+WM.n%8*28,y:20+WM.n%8*28,w:Math.min(w,innerWidth-8),h:Math.min(h,innerHeight-40),min:0,max:0,foc:0,st:{},el};WM.n++;
 el.innerHTML=`<div class=tb><span class=ti>${ic}</span><span class=tt>${esc(t)}</span><button class=wb data-a=min>_</button><button class=wb data-a=max>□</button><button class="wb x" data-a=close>✕</button></div><div class=bd></div>`+['n','s','e','w','ne','nw','se','sw'].map(d=>`<i class="rz ${d}" data-d=${d}></i>`).join('');
 const tn=E('button','tbn',ic+' '+esc(t));tn.title=t;r.tn=tn;$('#tasks').append(tn);D().append(el);WM.m.set(id,r);WM.pos(r);
 const bd=el.querySelector('.bd'),tb=el.firstChild;
 try{build(bd,el)}catch(err){bd.textContent='Ứng dụng gặp lỗi: '+err.message}
 if(!bd.querySelector('.sb'))bd.append(E('div','sb','Sẵn sàng'));
 r.w=el.offsetWidth||r.w;r.h=el.offsetHeight||r.h;WM.pos(r);WM.focus(r);
 tb.onclick=e=>{const k=e.target.dataset.a;if(k=='min')WM.min(r);else if(k=='max')WM.max(r);else if(k=='close')WM.close(r);else if(e.target.closest('.ti')){const b=e.target.closest('.ti').getBoundingClientRect();WM.sys(r,b.left,b.bottom)}};
 tb.ondblclick=e=>{if(e.target.closest('.wb'))return;e.target.closest('.ti')?WM.close(r):WM.max(r)};
 tb.onpointerdown=e=>{if(e.target.closest('.wb')||r.max||e.button)return;const ox=e.clientX-r.x,oy=e.clientY-r.y;trk(e,v=>{r.x=v.clientX-ox;r.y=Math.max(0,Math.min(v.clientY-oy,innerHeight-60));WM.pos(r)})};
 el.onpointerdown=e=>{WM.focus(r);const d=e.target.dataset.d;if(!d||r.max)return;const o={...r,cx:e.clientX,cy:e.clientY};
  trk(e,v=>{const dx=v.clientX-o.cx,dy=v.clientY-o.cy;
   if(d.includes('e'))r.w=Math.max(200,o.w+dx);if(d.includes('s'))r.h=Math.max(120,o.h+dy);
   if(d.includes('w')){const w=Math.max(200,o.w-dx);r.x=o.x+o.w-w;r.w=w}
   if(d.includes('n')){const h=Math.max(120,o.h-dy);r.y=o.y+o.h-h;r.h=h}WM.pos(r)})};
 tn.onclick=()=>r.min?WM.focus(r):r.foc?WM.min(r):WM.focus(r);
 return r},
pos(r){const s=r.el.style;s.left=r.x+'px';s.top=r.y+'px';s.width=r.w+'px';s.height=r.h+'px'},
focus(r){if(r.min){r.min=0;r.el.style.display=''}WM.m.forEach(q=>{q.foc=q===r?1:0;q.el.classList.toggle('act',q===r);q.tn.classList.toggle('on',q===r)});r.el.style.zIndex=++WM.z},
min(r){r.min=1;r.foc=0;r.el.style.display='none';r.el.classList.remove('act');r.tn.classList.remove('on');WM.top()},
top(){const v=[...WM.m.values()].filter(q=>!q.min).sort((a,b)=>b.el.style.zIndex-a.el.style.zIndex)[0];if(v)WM.focus(v)},
max(r){r.max=r.max?0:1;r.el.classList.toggle('mx',!!r.max);r.el.querySelector('[data-a=max]').textContent=r.max?'❐':'□'},
rest(r){if(r.min)WM.focus(r);else if(r.max)WM.max(r)},
close(r){r.el.remove();r.tn.remove();WM.m.delete(r.id);WM.top()},
arrange(k){const v=[...WM.m.values()].filter(q=>!q.min),W=D().clientWidth,H=D().clientHeight,n=v.length;
 v.forEach((r,i)=>{if(r.max)WM.max(r);
  if(k=='c'){r.x=20+i*28;r.y=10+i*28;r.w=Math.min(r.w,W-60);r.h=Math.min(r.h,H-40)}
  else if(k=='h'){r.x=0;r.w=W;r.h=H/n|0;r.y=i*r.h}else{r.y=0;r.h=H;r.w=W/n|0;r.x=i*r.w}WM.pos(r)})},
desk(){const v=[...WM.m.values()];if(v.length&&v.every(r=>r.min))(WM.hid||[]).forEach(r=>WM.m.has(r.id)&&WM.focus(r));else{WM.hid=v.filter(r=>!r.min);WM.hid.forEach(r=>WM.min(r))}},
sys(r,x,y){menu([['Restore',()=>WM.rest(r),'↺',!(r.max||r.min)],['Move',()=>grab(r,0),'✥',r.max||r.min],['Size',()=>grab(r,1),'⇲',r.max||r.min],['Minimize',()=>WM.min(r),'_',r.min],['Maximize',()=>WM.max(r),'□',r.max],'-',['Close',()=>WM.close(r),'✕']],x,y)}};
openWin=(t,ic,w,h,b)=>WM.open(t,ic,w,h,b);
const winOf=el=>{const w=el.closest('.win'),t=el.closest('.tbn');return[...WM.m.values()].find(r=>r.el===w||r.tn===t)};
const closeWin=b=>b.closest('.win').querySelector('[data-a=close]').click();

/* ---------- Context menu engine ---------- */
const closeM=()=>{CM.forEach(e=>e.remove());CM=[]};
const hot=(m,r)=>{m.querySelectorAll('.hot').forEach(x=>x.classList.remove('hot'));r.classList.add('hot');m.hot=r};
function menu(items,x,y,par,alt){
 if(par)while(CM.length>par.lv+1)CM.pop().remove();else closeM();
 const m=E('div','cm');m.lv=par?par.lv+1:0;
 items.forEach(it=>{if(it==='-')return m.append(E('div','sep'));
  const [t,f,ic,d]=it,sub=Array.isArray(f),r=E('div','mi'+(d?' dis':''),`<span class=mc>${I[ic]||ic||''}</span><span class=t>${t}</span>${sub?'<span class=ar>▸</span>':''}`);
  r.open=()=>{const b=r.getBoundingClientRect();menu(f,b.right-3,b.top-3,m,b.left+3)};r.sub=sub;
  r.onmouseenter=()=>{hot(m,r);clearTimeout(m.tm);while(CM.length>m.lv+1)CM.pop().remove();if(sub&&!d)m.tm=setTimeout(r.open,180)};
  r.onclick=()=>{if(d)return;if(sub)return r.open();closeM();f&&f()};m.append(r)});
 CM.push(m);document.body.append(m);
 const w=m.offsetWidth,h=m.offsetHeight,B=innerHeight-30;
 if(x+w>innerWidth)x=alt!=null?alt-w:innerWidth-w-2;if(y+h>B)y=Math.max(2,B-h);
 m.style.left=x+'px';m.style.top=y+'px';return m}
addEventListener('pointerdown',e=>{if(CM.length&&!e.target.closest('.cm'))closeM()},true);
addEventListener('mousedown',e=>{if(e.target.closest('.cm'))e.stopPropagation()},true);
addEventListener('blur',closeM);addEventListener('resize',closeM);
addEventListener('keydown',e=>{
 if(!CM.length){if(e.key=='Escape')$('#sm').hidden=true;return}
 const L=CM.at(-1),rows=[...L.children].filter(r=>r.classList.contains('mi')&&!r.classList.contains('dis')),i=rows.indexOf(L.hot),k=e.key;let h=1;
 if(k=='ArrowDown')hot(L,rows[(i+1)%rows.length]);else if(k=='ArrowUp')hot(L,rows[(i<0?0:i)-1<0?rows.length-1:i-1]);
 else if(k=='ArrowRight'&&L.hot&&L.hot.sub){L.hot.open();const n=CM.at(-1),f=n.querySelector('.mi:not(.dis)');f&&hot(n,f)}
 else if(k=='ArrowLeft'&&CM.length>1)CM.pop().remove();
 else if(k=='Enter'&&L.hot)L.hot.click();else if(k=='Escape'){CM.length>1?CM.pop().remove():closeM()}else h=0;
 if(h){e.preventDefault();e.stopPropagation()}},true);

/* ---------- small helpers: dialogs, input box ---------- */
const dlg=(t,h,w,hh)=>WM.open(t,I.file,w||340,hh||180,b=>{b.style.padding='10px';b.innerHTML=h});
const ask=(t,l,d,cb)=>WM.open(t,I.file,340,140,b=>{b.style.padding='10px';b.innerHTML=`<p>${esc(l)}</p><input style="width:100%" value="${esc(d||'')}"><p style="text-align:right"><button>OK</button> <button>Cancel</button></p>`;
 const i=b.querySelector('input'),[ok,no]=b.querySelectorAll('button');ok.onclick=()=>{closeWin(b);cb(i.value)};no.onclick=()=>closeWin(b);i.onkeydown=e=>e.key=='Enter'&&ok.click();setTimeout(()=>{i.focus();i.select()})});
const listWin=(t,items,empty)=>dlg(t,items.length?items.map(x=>'• '+esc(x)).join('<br>'):esc(empty||'Trống.'),320,220);

/* ---------- Desktop icons: select, drag, grid, auto-arrange ---------- */
const defs=()=>{const L=[...A.filter(a=>!U.hide.includes(a[0])).map(a=>({id:a[0],n:U.nm[a[0]]||a[1],i:a[2],t:'app',sys:1,o:()=>run(a[0])})),
 ...U.ex.map(x=>({id:x.id,n:x.n,i:x.k=='folder'?I.folder:x.k=='text'?I.file:(APP(x.app)||[])[2]||I.ie,t:x.k,ex:x,o:()=>openEx(x)}))];
 if(U.ord)L.sort((a,b)=>(U.ord.indexOf(a.id)+1||999)-(U.ord.indexOf(b.id)+1||999));return L};
const openEx=x=>{if(x.ref){const t=U.ex.find(y=>y.id==x.ref);return t&&openEx(t)}
 if(x.k=='folder')WM.open(x.n,I.folder,420,300,b=>{b.innerHTML='<div class=lst style="padding:8px">Thư mục này trống.</div>'});
 else if(x.k=='text')run('note',{name:x.n,text:fs[x.n]||''});else if(x.app)run(x.app);else if(x.url)window.open(x.url,'_blank','noopener')};
const slot=i=>{const r=Math.max(1,((D().clientHeight-8)/CH)|0);return[8+(i/r|0)*CW,8+i%r*CH]},snap=p=>[8+Math.round((p[0]-8)/CW)*CW,8+Math.round((p[1]-8)/CH)*CH];
function icons(){
 const box=$('#icons'),L=defs();box.replaceChildren();
 if(U.auto)L.forEach((d,i)=>U.pos[d.id]=slot(i));
 else{const used=new Set(L.filter(d=>U.pos[d.id]).map(d=>U.pos[d.id].join()));L.forEach(d=>{if(!U.pos[d.id]){let k=0;while(used.has(slot(k).join()))k++;U.pos[d.id]=slot(k);used.add(slot(k).join())}})}
 L.forEach(d=>{const e=E('div','ic',`<big>${d.i}</big>${esc(d.n)}`),p=U.pos[d.id];e.dataset.id=d.id;
  e.style.left=Math.max(0,Math.min(p[0],D().clientWidth-CW+8))+'px';e.style.top=Math.max(0,Math.min(p[1],D().clientHeight-CH+8))+'px';
  e.ondblclick=()=>d.o();e.onpointerdown=ev=>iconDown(ev,e);box.append(e)});us()}
function iconDown(ev,e){
 if(ev.button)return;
 if(!e.classList.contains('s')){if(!ev.ctrlKey)$$('.ic.s').forEach(x=>x.classList.remove('s'));e.classList.add('s')}else if(ev.ctrlKey){e.classList.remove('s');return}
 const st=$$('.ic.s').map(x=>[x,x.offsetLeft,x.offsetTop]),sx=ev.clientX,sy=ev.clientY;let mv=0;
 trk(ev,v=>{const dx=v.clientX-sx,dy=v.clientY-sy;if(!mv&&Math.hypot(dx,dy)<4)return;mv=1;st.forEach(([x,l,t])=>{x.classList.add('gh');x.style.left=l+dx+'px';x.style.top=t+dy+'px'})});
 addEventListener('pointerup',()=>{if(!mv)return;
  st.forEach(([x])=>{let p=[x.offsetLeft,x.offsetTop];if(U.grid)p=snap(p);U.pos[x.dataset.id]=[Math.max(0,Math.min(p[0],D().clientWidth-CW+8)),Math.max(0,Math.min(p[1],D().clientHeight-CH+8))]});
  if(U.auto)U.ord=$$('.ic').sort((a,b)=>U.pos[a.dataset.id][0]-U.pos[b.dataset.id][0]||U.pos[a.dataset.id][1]-U.pos[b.dataset.id][1]).map(x=>x.dataset.id);
  icons()},{once:true})}
D().addEventListener('pointerdown',e=>{
 if(e.button||(e.target.id!='desk'&&e.target.id!='icons'))return;$$('.ic.s').forEach(x=>x.classList.remove('s'));
 const rb=$('#rb'),ox=e.clientX,oy=e.clientY;rb.style.display='block';
 trk(e,v=>{const l=Math.min(ox,v.clientX),t=Math.min(oy,v.clientY),w=Math.abs(v.clientX-ox),h=Math.abs(v.clientY-oy);Object.assign(rb.style,{left:l+'px',top:t+'px',width:w+'px',height:h+'px'});
  $$('.ic').forEach(x=>{const b=x.getBoundingClientRect();x.classList.toggle('s',b.right>l&&b.left<l+w&&b.bottom>t&&b.top<t+h)})});
 addEventListener('pointerup',()=>rb.style.display='none',{once:true})});
const sortBy=k=>{const L=defs().sort((a,b)=>k=='t'?(a.t>b.t?1:a.t<b.t?-1:0)||a.n.localeCompare(b.n):a.n.localeCompare(b.n));U.ord=L.map(d=>d.id);U.pos={};icons()};
const mkEx=k=>{let b=k=='folder'?'New Folder':'New Text Document.txt',n=b,i=1;while(U.ex.some(x=>x.n==n)||fs[n]!=null)n=b.replace(/(\.txt)?$/,` (${++i})$1`);
 if(k=='text'){fs[n]='';sv()}U.ex.push({id:uid(),k,n});icons()};
const del=d=>{if(d.ex){U.ex=U.ex.filter(x=>x!=d.ex);bin.push({n:d.ex.n,t:d.ex.k=='folder'?{}:(fs[d.ex.n]||'')});if(d.ex.k=='text')delete fs[d.ex.n];sv()}else U.hide.push(d.id);delete U.pos[d.id];icons()};
const prop=d=>dlg(esc(d.n)+' Properties',`<div style="display:flex;gap:10px;align-items:center">${d.i}<b>${esc(d.n)}</b></div><hr><p>Loại: ${d.ex?({folder:'Thư mục',text:'Tài liệu văn bản',link:'Lối tắt'})[d.ex.k]:'Ứng dụng'}</p><p>Vị trí: Desktop</p>`);

/* ---------- Display Properties, theme ---------- */
const BG={azure:'linear-gradient(#0a2a7a,#2f78d8 60%,#9fd0f5)',night:'linear-gradient(#050a28,#122a6a 70%,#1b4a2a)',teal:'#3a6ea5'},TH={blue:['#0a5fe8','#3d95ff','#0831d9','#245edc'],olive:['#7b9a4a','#a9c47a','#5a7a2a','#8aa65a'],silver:['#a8a9c0','#d6d7e6','#7e7f98','#b3b4cc']};
function theme(){const t=TH[U.th]||TH.blue,s=document.documentElement.style;['--t1','--t2','--bd','--tk'].forEach((k,i)=>s.setProperty(k,t[i]));D().style.background=BG[U.bg]||''}
const sel=(o,c,fn)=>{const s=E('select');o.forEach(([v,l])=>s.add(new Option(l,v,0,v==c)));s.onchange=()=>fn(s.value);return s};
const TABS=['Themes','Desktop Background','Screensaver','Appearance','Screen Resolution'];
function page(k){const p=E('p',0,{Themes:'Chủ đề giao diện:','Desktop Background':'Hình nền:',Screensaver:'Trình bảo vệ màn hình:',Appearance:'Bảng màu cửa sổ và taskbar:','Screen Resolution':`Kích thước vùng làm việc hiện tại: ${innerWidth} × ${innerHeight} (theo cửa sổ).`}[k]);
 const th=sel([['blue','Luna (Blue)'],['olive','Olive Green'],['silver','Silver']],U.th,v=>{U.th=v;theme();us()});
 if(k=='Desktop Background')return[p,sel([['bliss','Bliss (đồi cỏ)'],['azure','Azure'],['night','Night'],['teal','Solid teal']],U.bg,v=>{U.bg=v;theme();us()})];
 if(k=='Screensaver')return[p,sel([[1,'Blank (60 giây)'],[0,'(None)']],U.ss,v=>{U.ss=+v;us();wake()})];
 return k=='Screen Resolution'?[p]:[p,th]}
function disp(tab){WM.open('Display Properties',I.pc,380,300,b=>{b.style.padding='6px';const hd=E('div','tabs'),pg=E('div','pg');b.append(hd,pg);
 const show=k=>{hd.querySelectorAll('u').forEach(u=>u.classList.toggle('on',u.dataset.k==k));pg.replaceChildren(...page(k))};
 TABS.forEach(k=>{const u=E('u','',k);u.dataset.k=k;u.onclick=()=>show(k);hd.append(u)});show(tab||TABS[0])})}

/* ---------- Taskbar: quick launch, tray, clock ---------- */
const tk=$('#task'),ql=E('div');ql.id='ql';tk.insertBefore(ql,$('#tasks'));
function qlr(){ql.style.display=U.ql?'flex':'none';ql.replaceChildren(E('i','grip'));
 U.pin.slice(0,3).forEach(id=>{const a=APP(id);if(!a)return;const b=E('button','',a[2]);b.title=a[1];b.dataset.ap=id;b.onclick=()=>run(id);ql.append(b)});
 const d=E('button','',S('<rect x=3 y=5 width=26 height=18 rx=2 fill="#3b82e8" stroke="#fff"/><rect x=7 y=26 width=18 height=3 fill="#fff"/>'));d.title='Show Desktop';d.onclick=()=>WM.desk();ql.append(d)}
const tray=E('div');tray.id='tray';
tray.innerHTML=`<span title="Âm lượng">${S('<path d="M4 12h5l6-5v18l-6-5H4z" fill="#fff"/><path d="M19 11c3 3 3 7 0 10" stroke="#fff" fill="none" stroke-width=2 />')}</span><span title="Mạng: đã kết nối">${S('<rect x=4 y=8 width=10 height=8 fill="#fff"/><rect x=18 y=16 width=10 height=8 fill="#fff"/><path d="M9 16v6h9" stroke="#fff" fill="none" stroke-width=2 />')}</span><span id=tsk title="Hiện/ẩn Stickman">${S('<circle cx=16 cy=8 r=5 fill="#fff"/><path d="M16 13v10M16 16l-7 6M16 16l7 6M16 23l-5 7M16 23l5 7" stroke="#fff" stroke-width=2 fill="none"/>')}</span>`;
tk.insertBefore(tray,$('#clk'));
tray.querySelector('#tsk').onclick=()=>{U.hs=!U.hs;us();stkEl.forEach(e=>e.style.display=U.hs?'none':'')};
const clk=$('#clk'),tick2=()=>{const n=new Date();clk.textContent=n.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});clk.title=n.toLocaleDateString('vi-VN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})};tick2();setInterval(tick2,1000);
const taskMenu=()=>[['Toolbars',[['Quick Launch',()=>{U.ql=!U.ql;us();qlr()},U.ql?'✓':''],['Address',0,'',1],['Links',0,'',1]]],'-',['Cascade Windows',()=>WM.arrange('c'),'❐'],['Tile Windows Horizontally',()=>WM.arrange('h'),'☰'],['Tile Windows Vertically',()=>WM.arrange('v'),'▥'],['Show Desktop',()=>WM.desk(),'▭'],'-',['Lock the Taskbar',()=>{U.lock=!U.lock;us()},U.lock?'✓':''],['Properties',()=>disp('Appearance'),'ℹ']];

/* ---------- Start menu: two columns, pin/unpin, frequently used ---------- */
const sm=$('#sm'),G=S('<circle cx=16 cy=16 r=9 fill="#cfd8e8" stroke="#456"/><circle cx=16 cy=16 r=3 fill="#456"/>'),MAIL=S('<rect x=3 y=7 width=26 height=18 fill="#fff" stroke="#46a"/><path d="M3 7l13 11L29 7" fill="none" stroke="#46a"/>');
function smBuild(){
 sm.innerHTML=`<div class=sh>${S('<circle cx=16 cy=12 r=7 fill="#f6d9a8" stroke="#a66"/><path d="M4 30c0-9 8-11 12-11s12 2 12 11z" fill="#3b82e8"/>')}<b style="font-size:14px">Administrator</b></div><div class=sc><div class=l></div><div class=r></div></div><div class=sf></div>`;
 const [L,R]=sm.querySelectorAll('.sc>div'),F=sm.querySelector('.sf');
 const add=(c,ic,t,f,id,sub)=>{const b=E('button','',`${ic}<span>${sub?`<b>${t}</b><br><small>${sub}</small>`:t}</span>`);b.onclick=()=>{sm.hidden=true;f()};if(id)b.dataset.ap=id;c.append(b);return b};
 add(L,I.ie,'Internet',()=>run('ie'),0,'Internet Explorer');add(L,MAIL,'E-mail',()=>window.open('mailto:'),0,'Thư điện tử');L.append(E('hr'));
 U.pin.forEach(id=>{const a=APP(id);if(a)add(L,a[2],a[1],()=>run(id),id)});
 const fq=Object.entries(U.use).sort((a,b)=>b[1]-a[1]).map(x=>x[0]).filter(id=>!U.pin.includes(id)&&APP(id)).slice(0,3);
 if(fq.length){L.append(E('hr'));fq.forEach(id=>add(L,APP(id)[2],APP(id)[1],()=>run(id),id))}
 L.append(E('hr'));const ap=add(L,'','<b>All Programs ▸</b>',()=>{});
 ap.onclick=()=>{const b=ap.getBoundingClientRect();menu(A.map(a=>[a[1],()=>{sm.hidden=true;run(a[0])},a[2]]),b.right,b.top,null,b.left)};
 [['My Documents',I.folder,()=>run('pc')],['My Pictures',I.img,()=>run('pc')],['My Computer',I.pc,()=>run('pc')],0,['Control Panel',G,()=>disp()],['Printers and Faxes',I.file,()=>dlg('Printers and Faxes','Không có máy in nào được cài đặt.')],
  ['Help and Support',I.note,()=>run('note',{name:'Help.txt',text:'Chuột phải vào desktop, icon, cửa sổ, taskbar, Paint hoặc stickman để xem menu.\nKéo icon để sắp xếp; Properties > Desktop Background để đổi hình nền.'})],
  ['Search',I.pc,()=>ask('Search','Tìm ứng dụng hoặc tệp:','',q=>{q=q.trim().toLowerCase();const r=[...A.filter(a=>a[1].toLowerCase().includes(q)).map(a=>a[1]),...Object.keys(fs).filter(n=>n.toLowerCase().includes(q))];listWin('Search Results',r,'Không tìm thấy kết quả.')})],
  ['Run...',I.calc,()=>ask('Run','Nhập tên chương trình hoặc địa chỉ web:','',v=>{v=v.trim();const a=A.find(a=>a[0]==v.toLowerCase()||a[1].toLowerCase()==v.toLowerCase());if(a)run(a[0]);else if(v)window.open(/^https?:/.test(v)?v:'https://'+v,'_blank','noopener')})]]
  .forEach(x=>x?add(R,x[1],x[0],x[2]):R.append(E('hr')));
 const lo=E('button','','⎋ Log Off'),off=E('button','','⏻ Turn Off Computer'),ov=$('#off'),t0=ov.textContent;
 lo.onclick=()=>{sm.hidden=true;[...WM.m.values()].forEach(r=>WM.close(r));ov.textContent='Đã đăng xuất. Bấm để đăng nhập lại.';ov.style.display='grid';ov.addEventListener('click',()=>ov.textContent=t0,{once:true})};
 off.onclick=()=>{sm.hidden=true;ov.style.display='grid'};F.append(lo,off)}
$('#st').addEventListener('click',()=>{if(!sm.hidden)smBuild()});
const appMenu=id=>{const a=APP(id),p=U.pin.includes(id);return[['Open',()=>{sm.hidden=true;run(id)},'▶'],[p?'Unpin from Start menu':'Pin to Start menu',()=>{U.pin=p?U.pin.filter(x=>x!=id):[...U.pin,id];us();smBuild();qlr()},'★'],['Pin to Desktop',()=>{U.hide=U.hide.filter(x=>x!=id);icons()},'⌂',!U.hide.includes(id)],'-',['Properties',()=>prop({i:a[2],n:a[1]}),'ℹ']]};

/* ---------- Context menus per target ---------- */
const iconMenu=d=>{const fo=d.id=='pc'||d.id=='bin'||(d.ex&&d.ex.k=='folder'),own=d.id=='pc'||d.id=='bin';
 return[['Open',d.o,'▶'],['Explore',()=>run('pc'),'⌕',!fo],'-',
 ['Rename',()=>ask('Rename','Tên mới:',d.n,v=>{v=v.trim();if(!v)return;if(d.ex){if(d.ex.k=='text'){fs[v]=fs[d.n]||'';delete fs[d.n];sv()}d.ex.n=v}else U.nm[d.id]=v;icons()}),'✎'],
 ['Delete',()=>del(d),'✕',own],
 ['Create Shortcut',()=>{U.ex.push({id:uid(),k:'link',app:d.sys?d.id:'',ref:d.ex?d.id:'',url:d.ex&&d.ex.url||'',n:'Shortcut to '+d.n});icons()},'↗'],
 ['Add to Start Menu',()=>{U.pin.push(d.id);us();smBuild()},'★',!(d.sys&&APP(d.id))||U.pin.includes(d.id)],['Pin to Desktop',0,'⌂',1],'-',['Properties',()=>prop(d),'ℹ']]};
const deskMenu=()=>[['Arrange Icons By',[['Sort By Name',()=>sortBy('n')],['Sort By Type',()=>sortBy('t')],'-',['Auto Arrange',()=>{U.auto=!U.auto;icons()},U.auto?'✓':''],['Align to Grid',()=>{U.grid=!U.grid;if(U.grid)for(const k in U.pos)U.pos[k]=snap(U.pos[k]);icons()},U.grid?'✓':'']],'▦'],
 ['Refresh',()=>icons(),'⟳'],'-',
 ['New',[['Folder',()=>mkEx('folder'),I.folder],['Text Document',()=>mkEx('text'),I.file],['Shortcut',()=>ask('New Shortcut','Địa chỉ web (https://…) hoặc tên ứng dụng:','',v=>{v=v.trim();if(!v)return;const a=A.find(a=>a[0]==v.toLowerCase()||a[1].toLowerCase()==v.toLowerCase());U.ex.push({id:uid(),k:'link',n:a?'Shortcut to '+a[1]:v,app:a?a[0]:'',url:a?'':/^https?:/.test(v)?v:'https://'+v});icons()}),'↗'],'-',['New Stickman',()=>newStk(CX[0],CX[1]),'☺'],['New Drawing',()=>run('paint'),I.paint]],'✚'],'-',
 ['Properties',[['Desktop Background','Desktop Background'],['Screen Resolution','Screen Resolution'],['Appearance','Appearance'],['Themes','Themes'],['Screensaver','Screensaver']].map(([n,k])=>[n,()=>disp(k)]),'ℹ']];
const editMenu=t=>{const X=c=>()=>{t.focus();document.execCommand(c)};return[['Undo',X('undo'),'↶'],'-',['Cut',X('cut'),'✂'],['Copy',X('copy'),'⧉'],['Paste',()=>navigator.clipboard.readText().then(s=>{t.focus();document.execCommand('insertText',false,s)}).catch(()=>{}),'⎘'],'-',['Select All',()=>{t.focus();t.select&&t.select()},'▣']]};
const paintMenu=cv=>{const w=cv.closest('.win'),x=cv.getContext('2d'),ub=[...w.querySelectorAll('button')].find(b=>/Hoàn tác/.test(b.textContent)),R=cv.R=cv.R||[],
 cp=()=>{try{cv.toBlob(b=>navigator.clipboard.write([new ClipboardItem({'image/png':b})]))}catch(e){}};
 return[['Undo',()=>{R.push(x.getImageData(0,0,cv.width,cv.height));ub&&ub.click()},'↶'],['Redo',()=>{const m=R.pop();m&&x.putImageData(m,0,0)},'↷',!R.length],'-',
 ['Cut',()=>{cp();x.fillStyle='#fff';x.fillRect(0,0,cv.width,cv.height)},'✂'],['Copy',cp,'⧉'],
 ['Paste',async()=>{try{for(const i of await navigator.clipboard.read()){const t=i.types.find(t=>t.startsWith('image/'));if(t)x.drawImage(await createImageBitmap(await i.getType(t)),0,0)}}catch(e){}},'⎘'],
 ['Select All',()=>{cv.style.outline='2px dashed #00f';setTimeout(()=>cv.style.outline='',900)},'▣'],'-',
 ['Create Stickman',()=>newStk(CX[0]+30,CX[1]),'☺'],['Edit Stickman',()=>{const o=U.stk.at(-1);ask('Edit Stickman','Màu nét vẽ (vd #e33):',o.c,v=>{if(CSS.supports('color',v)){o.c=v;us();stkEl.get(o.id).querySelector('svg').setAttribute('stroke',v)}})},'✎',!U.stk.length],
 ['Add Animation',()=>{const o=U.stk.at(-1);ask('Add Animation','Chọn: '+ANI.join(', '),'dance',v=>{if(ANI.includes(v)){if(!o.ab.includes(v))o.ab.push(v);us();anim(o,stkEl.get(o.id),v)}})},'★',!U.stk.length],
 ['Export',()=>cv.toBlob(b=>dl(b,'paint.png')),'⇩']]};
document.addEventListener('contextmenu',e=>{
 if(e.defaultPrevented)return;e.preventDefault();const t=e.target;if(t.closest('.cm'))return;CX=[e.clientX,e.clientY];let m;
 const sk=t.closest('.stk'),ic=t.closest('.ic'),ap=t.closest('[data-ap]');
 if(sk)m=stkMenu(U.stk.find(o=>o.id==sk.dataset.id),sk);
 else if(t.closest('.tbn')||t.closest('.win>.tb')){const r=winOf(t);if(r)return WM.sys(r,e.clientX,e.clientY)}
 else if(ap)m=appMenu(ap.dataset.ap);
 else if(t.closest('#sm'))return;
 else if(t.closest('#task'))m=taskMenu();
 else if(ic)m=iconMenu(defs().find(d=>d.id==ic.dataset.id));
 else if(t.tagName=='CANVAS')m=paintMenu(t);
 else if(/^(TEXTAREA|INPUT)$/.test(t.tagName))m=editMenu(t);
 else if(!t.closest('.win')&&t.closest('#desk'))m=deskMenu();
 if(m)menu(m,e.clientX,e.clientY)});

/* ---------- Stickman ---------- */
const ANI=['jump','spin','wave','dance'],SAY=['Xin chào!','Hôm nay bạn muốn vẽ gì?','Mình là stickman sống trên desktop này.','Chuột phải vào mình để xem thêm nhé.'],COL=['#e33','#27d','#2a2','#c3c','#e80'],stkEl=new Map;
const say=(o,e,t)=>{const b=e.querySelector('.bub');b.textContent=t||(o.mem.length&&Math.random()<.5?'Mình nhớ: '+o.mem[Math.random()*o.mem.length|0]:SAY[Math.random()*SAY.length|0]);b.style.display='block';e.classList.add('a-wave');clearTimeout(e.t);e.t=setTimeout(()=>{b.style.display='none';e.classList.remove('a-wave')},3500)};
const anim=(o,e,a)=>{ANI.forEach(k=>e.classList.remove('a-'+k));void e.offsetWidth;e.classList.add('a-'+a);setTimeout(()=>e.classList.remove('a-'+a),2000)};
function stk(o){
 o.x=Math.max(0,Math.min(o.x,innerWidth-60));o.y=Math.max(0,Math.min(o.y,innerHeight-120));
 const e=E('div','stk',`<div class=bub style="display:none"></div><svg viewBox="0 0 56 84" stroke="${esc(o.c)}"><circle cx=28 cy=12 r=9 fill="#fff"/><path d="M28 21v30M28 28L12 42M28 28l16 14M28 51L14 78M28 51l14 27"/></svg><div class=nm>${esc(o.n)}</div>`);
 e.dataset.id=o.id;e.style.left=o.x+'px';e.style.top=o.y+'px';if(U.hs)e.style.display='none';document.body.append(e);stkEl.set(o.id,e);
 e.onpointerdown=ev=>{if(ev.button)return;ev.stopPropagation();const ox=ev.clientX-o.x,oy=ev.clientY-o.y;let mv=0;e.dr=1;
  trk(ev,v=>{if(Math.hypot(v.clientX-ox-o.x,v.clientY-oy-o.y)>4)mv=1;if(mv){o.x=v.clientX-ox;o.y=v.clientY-oy;e.style.left=o.x+'px';e.style.top=o.y+'px'}});
  addEventListener('pointerup',()=>{e.dr=0;if(!mv)say(o,e);us()},{once:true})};
 return e}
const newStk=(x,y)=>{const o={id:uid(),n:'Stickman '+(U.stk.length+1),x:x||200,y:y||200,c:COL[U.stk.length%5],mode:'stay',mem:[],ab:['talk','follow','remember','jump','wave']};U.stk.push(o);us();say(o,stk(o),'Xin chào! Mình là '+o.n+'.')};
const stkMenu=(o,e)=>[['Talk',()=>say(o,e),'“'],['Interact',()=>{say(o,e,'Bạn muốn làm gì cùng mình?');anim(o,e,'jump')},'☺'],
 ['Follow Cursor',()=>{o.mode='follow';us()},o.mode=='follow'?'●':''],['Stay Here',()=>{o.mode='stay';us()},o.mode=='stay'?'●':''],'-',
 ['Remember This',()=>ask('Remember This','Stickman nên nhớ điều gì?','',v=>{if(v.trim()){o.mem.push(v.trim());us();say(o,e,'Mình đã ghi nhớ!')}}),'✎'],
 ['View Memory',()=>listWin(o.n+' - Memory',o.mem,'Chưa có ký ức nào.')],['View Abilities',()=>listWin(o.n+' - Abilities',o.ab)],
 ['Animate',o.ab.filter(a=>ANI.includes(a)).map(a=>[a,()=>anim(o,e,a)]),'★'],'-',
 ['Rename',()=>ask('Rename','Tên mới:',o.n,v=>{if(v.trim()){o.n=v.trim();e.querySelector('.nm').textContent=o.n;us()}}),'✎'],
 ['Duplicate',()=>{const c={...o,id:uid(),n:o.n+' (2)',x:o.x+40,y:o.y+20,mem:[...o.mem],ab:[...o.ab]};U.stk.push(c);us();stk(c)},'⧉'],
 ['Delete',()=>{e.remove();stkEl.delete(o.id);U.stk=U.stk.filter(s=>s!==o);us()},'✕']];
addEventListener('pointermove',e=>M=[e.clientX,e.clientY]);
(function f(){stkEl.forEach((e,id)=>{const o=U.stk.find(s=>s.id==id);if(o&&o.mode=='follow'&&!e.dr){o.x+=(M[0]-30-o.x)*.08;o.y+=(M[1]-90-o.y)*.08;e.style.left=o.x+'px';e.style.top=o.y+'px'}});requestAnimationFrame(f)})();

/* ---------- Screensaver (blank after 60s idle) ---------- */
const ss=E('div');ss.id='ss';document.body.append(ss);let idle;
function wake(){ss.style.display='none';clearTimeout(idle);if(U.ss)idle=setTimeout(()=>ss.style.display='block',6e4)}
['pointermove','keydown','pointerdown'].forEach(k=>addEventListener(k,wake,true));

/* ---------- Boot ---------- */
$$('.win,.tbn').forEach(x=>x.remove());
D().append(E('div'));D().lastChild.id='rb';
addEventListener('resize',()=>{WM.m.forEach(r=>{r.x=Math.max(0,Math.min(r.x,innerWidth-60));r.y=Math.max(0,Math.min(r.y,innerHeight-90));WM.pos(r)});icons()});
theme();icons();smBuild();qlr();U.stk.forEach(o=>stk(o));wake();
run('note',{name:'Chào mừng.txt',text:fs['Chào mừng.txt']||''});
})();
