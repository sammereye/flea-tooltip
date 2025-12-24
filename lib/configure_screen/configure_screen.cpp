#include <iostream>
#include <vector>
#include <stdexcept>
#include <fstream>
#include <memory>
#include <cstring>
#include <tesseract/baseapi.h>
#include <leptonica/allheaders.h>
#include <chrono>
#include <windows.h>
#include <thread>
#include <stdio.h>
#include <algorithm>
#include <regex>
#include <string>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

static bool pixelIsBorderColor(short& red, short& green, short& blue) {
    if (red == 82 && green == 89 && blue == 90) {
        return true;
    }
    else if (red == 0 && green == 0 && blue == 0) {
        return true;
    }
    else if (red == 11 && green == 12 && blue == 12) {
        return true;
    }
    else if (red == 97 && green == 99 && blue == 96) {
        return true;
    }
    else if (red == 83 && green == 90 && blue == 91) {
        return true;
    }

    return false;
}

static void LoopThroughPixels(LONG *endOffsetX, LONG *endOffsetY, LONG *boxHeight) {
    HDC dc = NULL;
    COLORREF color = 0;
    POINT p;
    LONG x = 0L;
    LONG xRel = 0L;
    LONG y = 0L;
    LONG yRel = 0L;
    short red = 0;
    short green = 0;
    short blue = 0;
    LONG xRange = 20L;
    LONG yRange = 20L;
    LONG xOffsetStarting = 8L;
    LONG yOffsetStarting = -8L;
    POINT lowestPoint{};
    short lowestPointRed = 0;
    short lowestPointGreen = 0;
    short lowestPointBlue = 0;

    if (GetCursorPos(&p)) {
        dc = GetDC(NULL);
        std::cout << "Searching from (" << p.x << "," << (p.y - yRange - yOffsetStarting) << ") to (" << (p.x + xRange + xOffsetStarting) << "," << (p.y) << ")" << std::endl;
        for (y = 0L; y > -1*yRange; y--) {
            for (x = 0L; x < xRange; x++) {
                xRel = x + p.x + xOffsetStarting;
                yRel = y + p.y + yOffsetStarting;
                color = GetPixel(dc, xRel, yRel);
                red = GetRValue(color);
                green = GetGValue(color);
                blue = GetBValue(color);
                if (pixelIsBorderColor(red, green, blue)) {
                    if (lowestPoint.x == 0 || lowestPoint.y == 0 || yRel > lowestPoint.y || (xRel < lowestPoint.x && yRel == lowestPoint.y)) {
                        lowestPoint.x = xRel;
                        lowestPoint.y = yRel;
                        *endOffsetX = x + xOffsetStarting;
                        *endOffsetY = y + yOffsetStarting;
                        lowestPointRed = red;
                        lowestPointGreen = green;
                        lowestPointBlue = blue;
                    }
                }
            }
        }

        if (lowestPoint.x != 0 && lowestPoint.y != 0) {
            //std::cout << "BORDER_COLOR at (" << lowestPoint.x << ", " << lowestPoint.y << "): " << (int)lowestPointRed << ", " << (int)lowestPointGreen << ", " << (int)lowestPointBlue << std::endl;
            y = -1;
            xRel = lowestPoint.x;

            while (true) {
                yRel = y + lowestPoint.y;

                color = GetPixel(dc, xRel, yRel);
                red = GetRValue(color);
                green = GetGValue(color);
                blue = GetBValue(color);
                if (!pixelIsBorderColor(red, green, blue)) {
                    *boxHeight = y * -1;
                    break;
                }

                y--;
            }
            //std::cout << "LOWEST BORDER COLOR at (" << lowestPoint.x << ", " << lowestPoint.y << "): " << (int)red << ", " << (int)green << ", " << (int)blue << std::endl;
        }
        else
        {
            std::cout << "NOTFOUND" << std::endl;
        }

	    ReleaseDC(NULL, dc);
    }
}

int main()
{
    LONG endOffsetX = 0L;
    LONG endOffsetY = 0L;
    LONG singleRowHeight = 0L;
    LONG doubleRowHeight = 0L;

    std::cout << "HOVER OVER ITEM WITH ONE ROW" << std::endl;
    std::this_thread::sleep_for(std::chrono::seconds(10));

    LoopThroughPixels(&endOffsetX, &endOffsetY, &singleRowHeight);

    if (endOffsetX != 0 && endOffsetY != 0) {
        std::cout << "Offset X: " << endOffsetX << ", Offset Y: " << endOffsetY << ", Single Row Height: " << singleRowHeight << std::endl;
        
        std::cout << "HOVER OVER ITEM WITH TWO ROWS NOW" << std::endl;
        std::this_thread::sleep_for(std::chrono::seconds(12));
        LoopThroughPixels(&endOffsetX, &endOffsetY, &doubleRowHeight);
        std::cout << "Offset X: " << endOffsetX << ", Offset Y: " << endOffsetY << ", Double Row Height: " << doubleRowHeight << std::endl;
        
        json jsonOutput = {
          {"singleRowHeight", -1*singleRowHeight},
          {"doubleRowHeight", -1*doubleRowHeight},
          {"offsetX", endOffsetX},
          {"offsetY", endOffsetY},
        };

        std::ofstream o("config.json");
        o << std::setw(4) << jsonOutput << std::endl;
    }

    return 0;
}