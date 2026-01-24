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

// Configurable border colors (can be overridden via command line arguments)
static short borderColorRed = 82;
static short borderColorGreen = 89;
static short borderColorBlue = 90;

static bool pixelIsBorderColor(short& red, short& green, short& blue) {
    if (red == borderColorRed && green == borderColorGreen && blue == borderColorBlue) {
        return true;
    }

    return false;
}

static void LoopThroughPixels(LONG *endOffsetX, LONG *endOffsetY) {
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
    LONG xRange = 40L;
    LONG yRange = 40L;
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

	    ReleaseDC(NULL, dc);
    }
}

int main(int argc, char* argv[])
{
    // Parse optional command line arguments for border colors: red green blue
    if (argc >= 4) {
        try {
            borderColorRed = static_cast<short>(std::stoi(argv[1]));
            borderColorGreen = static_cast<short>(std::stoi(argv[2]));
            borderColorBlue = static_cast<short>(std::stoi(argv[3]));
        }
        catch (const std::exception& e) {
            std::cerr << "Error parsing color arguments. Using default values." << std::endl;
        }
    }

    LONG endOffsetX = 0L;
    LONG endOffsetY = 0L;
    std::string userInput = "";

    std::cout << "HOVER OVER ITEM WITH ONE ROW" << std::endl;
    fflush(stdout);
    do {
        std::getline(std::cin, userInput);
		if (userInput == "EXIT") {
            return 0;
        }
    } while (userInput != "NEXT");
    userInput = "";

    LoopThroughPixels(&endOffsetX, &endOffsetY);

    std::cout << "RESULT||" << endOffsetX << "||" << endOffsetY << std::endl;
    std::this_thread::sleep_for(std::chrono::seconds(1));
    return 0;
}