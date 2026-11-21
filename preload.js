const { contextBridge, ipcRenderer } = require('electron');
const IN = ['state', 'panel', 'dl', 'focus'];
contextBridge.exposeInMainWorld('api', {
  call: (c, ...a) => ipcRenderer.invoke('b', c, ...a),
  on: (ch, cb) => { if (IN.includes(ch)) ipcRenderer.on(ch, (_, d) => cb(d)); }
});
