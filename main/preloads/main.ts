import { contextBridge, ipcRenderer } from "electron";
import IpcConstants from "../../models/IpcConstants";

declare global {
  interface Window {
    electronAPI: {
      receive: () => void;
      enableTooltips: () => void;
    };
  }
}

contextBridge.exposeInMainWorld("electron", {
  receive: (channel: string, listener: any) => {
    ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  enableTooltips: () => {
    ipcRenderer.send(IpcConstants.EnableTooltips);
  },
});
