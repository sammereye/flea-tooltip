import { spawn } from 'child_process';
import { app } from 'electron';
import path from 'path';
import { isDev } from '../utils'

export default class AlwaysOnTopProcess {
  initialize(): void {
    console.log("Initializing always on top process");
    
    const alwaysOnTopProcess =  isDev() ? spawn(path.join(app.getAppPath(), "/lib/ocr/setalwaysontop.exe")) : spawn(path.join(process.resourcesPath, "/ocr/setalwaysontop.exe"));

    alwaysOnTopProcess.on('close', function(code) {
      if (code == 0) {
        console.log("Succesfully put as top most window");
      } else {
        console.log("Failed to put as top most window");
      }
    });
  }
}