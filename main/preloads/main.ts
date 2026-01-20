import { contextBridge, ipcRenderer } from "electron";
import IpcConstants from "../../models/IpcConstants";
import { UserConfig } from "../../models/UserConfig";

declare global {
  interface Window {
    electron: {
      receive: (channel: string, listener: any) => void;
      enableTooltips: () => void;
      getUserConfig: () => Promise<UserConfig>;
      setUserConfig: (config: UserConfig) => Promise<boolean>;
      toggleTooltips: (enabled: boolean) => Promise<boolean>;
      toggleFrameless: (enabled: boolean) => Promise<boolean>;
      toggleAlwaysOnTop: (enabled: boolean) => Promise<boolean>;
      getAllItems: () => Promise<any[]>;
      validateApiKey: (apiKey: string) => Promise<boolean>;
      refetchItems: () => Promise<boolean>;
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
  getUserConfig: () => {
    return ipcRenderer.invoke(IpcConstants.GetUserConfig);
  },
  setUserConfig: (config: UserConfig) => {
    return ipcRenderer.invoke(IpcConstants.SetUserConfig, config);
  },
  toggleTooltips: (enabled: boolean) => {
    return ipcRenderer.invoke(IpcConstants.ToggleTooltips, enabled);
  },
  toggleFrameless: (enabled: boolean) => {
    return ipcRenderer.invoke(IpcConstants.ToggleFrameless, enabled);
  },
  toggleAlwaysOnTop: (enabled: boolean) => {
    return ipcRenderer.invoke(IpcConstants.ToggleAlwaysOnTop, enabled);
  },
  getAllItems: () => {
    return ipcRenderer.invoke(IpcConstants.GetAllItems);
  },
  validateApiKey: (apiKey: string) => {
    return ipcRenderer.invoke(IpcConstants.ValidateApiKey, apiKey);
  },
  refetchItems: () => {
    return ipcRenderer.invoke(IpcConstants.RefetchItems);
  },
});
