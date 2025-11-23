import { BrowserWindow } from "electron";

declare const TOOLTIP_WINDOW_WEBPACK_ENTRY: string;
declare const TOOLTIP_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export default class TooltipWindow extends BrowserWindow {
  constructor() {
    super({
      frame: false,
      transparent: true,
      width: 500,
      height: 50,
      backgroundColor: "#00000000",
      // skipTaskbar: true,
      resizable: false,
      webPreferences: {
        preload: TOOLTIP_WINDOW_PRELOAD_WEBPACK_ENTRY,
      },
    });

    this.loadURL(TOOLTIP_WINDOW_WEBPACK_ENTRY);
    // this.webContents.openDevTools();

    // this.setMenu(null);
  }
}
