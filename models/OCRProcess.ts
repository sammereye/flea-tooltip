import { screen, app } from 'electron';
import { spawn } from 'child_process';
import TooltipWindow from './TooltipWindow';
import Items from './Items';
import IpcConstants from './IpcConstants';
import path from 'path';
import { isDev } from '../utils';

export default class OCRProcess {
  constructor(items: Items, tooltipWindow: TooltipWindow) {
    this.tooltipWindow = tooltipWindow;
    this.items = items;
  }

  private tooltipWindow: TooltipWindow;
  private items: Items;

  initialize(): void {
    console.log("Initializing OCR process")
    // const ocrProcess = ;
    const ocrProcess = isDev() ? spawn(path.join(app.getAppPath(), "/lib/ocr/ocr_cpp.exe")) : spawn(path.join(process.resourcesPath, "/ocr/ocr_cpp.exe"));
    const tooltipWindow = this.tooltipWindow;
    const items = this.items;

    ocrProcess.stdout.setEncoding('utf-8');
    ocrProcess.stdout.on('data', function(data) {
      const text = new String(data);
      const incomingData = text.toString().trim();
      if (incomingData === 'MOUSEMOVE') {
        tooltipWindow.webContents.send(IpcConstants.NewTooltipItem, null);
        setTimeout(() => {
          tooltipWindow.setBounds({width: 0, height: 0, x: 0, y: 0});
        }, 30)
      } else if (incomingData === 'RESOLUTIONERROR') {
        throw new Error("INVALID RESOLUTION FOR SCANNING");
      } else if (incomingData.includes('||')) {
        // eslint-disable-next-line no-control-regex
        const incomingDataCleanedUp = incomingData.replace(/[^\x00-\x7F]/g, "");
        const itemName = incomingDataCleanedUp.split("||")[0];
        const coords = incomingDataCleanedUp.split("||")[1];
        const x = parseInt(coords.split(',')[0]);
        const y = parseInt(coords.split(',')[1]);
        const item = items.search(itemName, 50);
        if (item) {
          const mousePos = screen.getCursorScreenPoint();
          if (mousePos.x === x && mousePos.y === y) {
            tooltipWindow.webContents.send(IpcConstants.NewTooltipItem, item);
            setTimeout(() => {
              tooltipWindow.setPosition(mousePos.x + 13, mousePos.y + 13);
              tooltipWindow.setBounds({width: 250, height: 150});
            }, 10)
          }
        }
      }
    });
    
    ocrProcess.stderr.setEncoding('utf-8');
    ocrProcess.stderr.on('data', function(data) {
      console.log('stderr: ' + data);
    });
    
    ocrProcess.on('close', function(code) {
      console.log('closing code: ' + code);
    });

    console.log("Successfully initialized OCR process")
  }
}