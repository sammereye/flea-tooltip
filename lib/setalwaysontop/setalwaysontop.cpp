#include <Windows.h>
#include <chrono>
#include <thread>
#include <iostream>

int main()
{
    /*
    HWND window = GetTopWindow(GetDesktopWindow());

    do
    {
        //Not visible? skip
        if (!IsWindowVisible(window))
            continue;

        //Get the title of the window
        char titleString[64];
        GetWindowTextA(window, titleString, 64);

        //Print it out
        printf("%s\r\n", titleString, 64);
    } while (window = GetWindow(window, GW_HWNDNEXT));
    */

    int sleepLength = 500;
    bool foundWindows = true;
    HWND pricePopupHWND = FindWindowA(NULL, "Price Popup");
    while (!IsWindow(pricePopupHWND)) {
        std::cout << sleepLength;
        std::this_thread::sleep_for(std::chrono::milliseconds(sleepLength));
        sleepLength += 1;

        if (sleepLength == 510) {
            foundWindows = false;
            break;
        }

        pricePopupHWND = FindWindowA(NULL, "Price Popup");
    }

    if (foundWindows) {
        SetWindowPos(pricePopupHWND, HWND_TOP, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
        SetWindowPos(pricePopupHWND, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
    }
    /*
    */

    return 0;
}