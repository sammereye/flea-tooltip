import { screen, app, BrowserWindow } from "electron";
import { spawn } from "child_process";
import TooltipWindow from "./TooltipWindow";
import Items from "./Items";
import IpcConstants from "./IpcConstants";
import path from "path";
import { isDev } from "../utils";
import koffi from "koffi";
import log from "electron-log";

export default class OCRProcess {
  constructor(items: Items, priceListWindow: BrowserWindow) {
    this.priceListWindow = priceListWindow;
    this.items = items;
  }

  public tooltipWindow: TooltipWindow | null;
  protected priceListWindow: BrowserWindow;
  protected items: Items;
  protected user32: koffi.IKoffiLib;
  protected Point: koffi.IKoffiCType;

  getMousePos(): { x: number; y: number } | null {
    const GetCursorPos = this.user32.func(
      "int __stdcall GetCursorPos(_Out_ POINT *pos)"
    );

    // Get and show cursor position
    const pos = {};
    try {
      if (!GetCursorPos(pos)) throw new Error("Failed to get cursor position");
      return pos as { x: number; y: number };
    } catch (error) {
      console.error("Error getting cursor position:", error);
      return null;
    }
  }

  initialize(): void {
    this.user32 = koffi.load("user32.dll");
    this.Point = koffi.struct("POINT", {
      x: "long",
      y: "long",
    });

    const onNewData = this.onNewData;
    isDev()
      ? console.log("Initializing OCR process")
      : log.info("Initializing OCR process");
    // const ocrProcess = ;
    const ocrProcess = isDev()
      ? spawn(path.join(app.getAppPath(), "/lib/ocr/ocr_cpp.exe"))
      : spawn(path.join(process.resourcesPath, "/ocr/ocr_cpp.exe"));

    ocrProcess.stdout.setEncoding("utf-8");
    ocrProcess.stdout.on("data", this.onNewData.bind(this));

    ocrProcess.stderr.setEncoding("utf-8");
    ocrProcess.stderr.on("data", function (data) {
      isDev() ? console.log("stderr: " + data) : log.error("stderr: " + data);
    });

    ocrProcess.on("close", function (code) {
      isDev()
        ? console.log("closing code: " + code)
        : log.info("closing code: " + code);
    });

    isDev()
      ? console.log("Successfully initialized OCR process")
      : log.info("Successfully initialized OCR process");
    return;
  }

  onNewData(data: any): void {
    const text = new String(data);
    const incomingData = text.toString().trim();
    if (incomingData === "MOUSEMOVE") {
      if (this.tooltipWindow) {
        this.tooltipWindow.webContents.send(IpcConstants.NewTooltipItem, null);
        setTimeout(() => {
          this.tooltipWindow.setBounds({ width: 0, height: 0, x: 0, y: 0 });
        }, 30);
      }
    } else if (incomingData === "RESOLUTIONERROR") {
      throw new Error("INVALID RESOLUTION FOR SCANNING");
    } else if (incomingData.includes("||")) {
      // eslint-disable-next-line no-control-regex
      const incomingDataCleanedUp = incomingData.replace(/[^\x00-\x7F]/g, "");
      let itemName = incomingDataCleanedUp.split("||")[0];
      const coords = incomingDataCleanedUp.split("||")[1];
      const x = parseInt(coords.split(",")[0]);
      const y = parseInt(coords.split(",")[1]);

      if (itemName.includes("WD-40 (1")) {
        itemName = "WD-40 (100ml)";
      } else if (itemName.includes("WD-40 (4")) {
        itemName = "WD-40 (400ml)";
      }

      if (itemName.toLowerCase().includes("kektape")) {
        itemName = "kektape";
      }

      if (itemName.toLowerCase().includes("pc cpi")) {
        itemName = "pc cpu";
      }

      const allowedLowerScoreItems = [
        "magnet",
        "arena",
        "cult",
        "poste",
        "kektape",
        "military",
        "matche",
        "sewing",
      ];

      const item = this.items.search(
        itemName,
        allowedLowerScoreItems.filter((i) => itemName.toLowerCase().includes(i))
          .length > 0
          ? 12
          : 50
      );
      if (item) {
        const mousePos = this.getMousePos();
        const electronMousePos = screen.getCursorScreenPoint();

        if (
          mousePos.x < 2560 / 2 + 10 &&
          mousePos.y < 1440 / 2 + 10 &&
          mousePos.x > 2560 / 2 - 10 &&
          mousePos.y > 1440 / 2 - 10
        ) {
          return;
        }

        if (mousePos.x === x && mousePos.y === y) {
          if (
            !incomingData.includes("||MENU") &&
            this.priceListWindow.isVisible()
          ) {
            this.priceListWindow.webContents.send(
              IpcConstants.NewTooltipItem,
              item
            );
          }

          if (this.tooltipWindow) {
            this.tooltipWindow.webContents.send(
              IpcConstants.NewTooltipItem,
              item
            );

            setTimeout(() => {
              this.tooltipWindow.setPosition(
                electronMousePos.x + 13,
                electronMousePos.y + 13
              );
              setTimeout(() => {
                this.tooltipWindow.setBounds({ width: 500, height: 500 });
              }, 10);
            }, 5);
          }
        }
      }
    }
  }
}
