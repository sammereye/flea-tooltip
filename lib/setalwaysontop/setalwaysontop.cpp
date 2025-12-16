#include <Windows.h>
#include <chrono>
#include <thread>
#include <iostream>

int main()
{
    int sleepLength = 500;
    bool foundWindows = true;
    HWND pricePopupHWND = FindWindowA(NULL, "Price Popup");
    HWND priceListHWND = FindWindowA(NULL, "Price List");
    do {
        if (sleepLength == 520) {
            foundWindows = false;
            break;
        }

        if (sleepLength != 500) {
            std::cout << sleepLength;
            std::this_thread::sleep_for(std::chrono::milliseconds(sleepLength));
        }

        pricePopupHWND = FindWindowA(NULL, "Price Popup");
        if (!IsWindow(priceListHWND)) {
            priceListHWND = FindWindowA(NULL, "Price  List");
        }

        sleepLength += 1;
    } while (!IsWindow(pricePopupHWND));

    if (foundWindows) {
        SetWindowPos(pricePopupHWND, HWND_TOP, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
        SetWindowPos(pricePopupHWND, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);

        if (IsWindow(priceListHWND)) {
            // 1. Get the screen width
            int screenWidth = GetSystemMetrics(SM_CXSCREEN);
            int screenHeight = GetSystemMetrics(SM_CYSCREEN);

            // 2. Define the fixed dimensions
            const int WINDOW_WIDTH = 450;
            const int WINDOW_HEIGHT = 300;

            // 3. Calculate the new X position for the top-right corner
            // New X = Screen Width - Fixed Window Width
            int newX = screenWidth - WINDOW_WIDTH;
            // New Y is 0 for the top edge
            int newY = screenHeight - WINDOW_HEIGHT - 43;

            // 4. Call SetWindowPos to move, resize, and set Z-order
            SetWindowPos(
                priceListHWND,  // Handle to your window
                HWND_TOP,       // Z-order: Make it the top window
                newX,           // New X position (top-right)
                newY,           // New Y position (top edge)
                WINDOW_WIDTH,   // New Width (450)
                WINDOW_HEIGHT,  // New Height (300)
                0               // Flags: No flags needed (default behavior is to move and resize)
            );
            SetWindowPos(
                priceListHWND,  // Handle to your window
                HWND_TOPMOST,       // Z-order: Make it the top window
                newX,           // New X position (top-right)
                newY,           // New Y position (top edge)
                WINDOW_WIDTH,   // New Width (450)
                WINDOW_HEIGHT,  // New Height (300)
                0               // Flags: No flags needed (default behavior is to move and resize)
            );
        }
    }
    /*
    */

    return 0;
}