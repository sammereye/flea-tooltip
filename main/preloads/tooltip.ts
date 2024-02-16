import { contextBridge, ipcRenderer } from "electron";

declare global {
  interface Window {
    electron:  {
      receive: () => void,
    }
  }
}

contextBridge.exposeInMainWorld('electron', {
  receive: (channel: string, listener: any) => {
    ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
})
