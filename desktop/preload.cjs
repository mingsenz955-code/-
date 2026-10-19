const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('ranch',Object.freeze({load:()=>ipcRenderer.invoke('save:load'),save:s=>ipcRenderer.invoke('save:write',s),export:s=>ipcRenderer.invoke('save:export',s),import:()=>ipcRenderer.invoke('save:import'),version:()=>ipcRenderer.invoke('app:version'),feedback:()=>ipcRenderer.invoke('app:feedback')}));
