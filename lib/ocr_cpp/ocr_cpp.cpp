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

using namespace std;
using json = nlohmann::json;

class Image
{
private:
	vector<uint8_t> Pixels;
	uint32_t width, height;
	uint16_t BitsPerPixel;

	void Flip(void* In, void* Out, int width, int height, unsigned int Bpp);

public:
	explicit Image(HDC DC, int X, int Y, int Width, int Height);

	inline uint16_t GetBitsPerPixel() { return this->BitsPerPixel; }
	inline uint16_t GetBytesPerPixel() { return this->BitsPerPixel / 8; }
	inline uint16_t GetBytesPerScanLine() { return (this->BitsPerPixel / 8) * this->width; }
	inline int GetWidth() const { return this->width; }
	inline int GetHeight() const { return this->height; }
	inline const uint8_t* GetPixels() { return this->Pixels.data(); }
};

void Image::Flip(void* In, void* Out, int width, int height, unsigned int Bpp)
{
	unsigned long Chunk = (Bpp > 24 ? width * 4 : width * 3 + width % 4);
	unsigned char* Destination = static_cast<unsigned char*>(Out);
	unsigned char* Source = static_cast<unsigned char*>(In) + Chunk * (height - 1);

	while (Source != In)
	{
		memcpy(Destination, Source, Chunk);
		Destination += Chunk;
		Source -= Chunk;
	}
}

Image::Image(HDC DC, int X, int Y, int Width, int Height) : Pixels(), width(Width), height(Height), BitsPerPixel(32)
{
	BITMAP Bmp = { 0 };
	HBITMAP hBmp = reinterpret_cast<HBITMAP>(GetCurrentObject(DC, OBJ_BITMAP));

	if (GetObject(hBmp, sizeof(BITMAP), &Bmp) == 0)
		throw runtime_error("BITMAP DC NOT FOUND.");

	RECT area = { X, Y, X + Width, Y + Height };
	HWND Window = WindowFromDC(DC);
	GetClientRect(Window, &area);

	HDC MemDC = GetDC(nullptr);
	HDC SDC = CreateCompatibleDC(MemDC);
	HBITMAP hSBmp = CreateCompatibleBitmap(MemDC, width, height);
	DeleteObject(SelectObject(SDC, hSBmp));

	BitBlt(SDC, 0, 0, width, height, DC, X, Y, SRCCOPY);
	unsigned int data_size = ((width * BitsPerPixel + 31) / 32) * 4 * height;
	vector<uint8_t> Data(data_size);
	this->Pixels.resize(data_size);

	BITMAPINFO Info = { sizeof(BITMAPINFOHEADER), static_cast<long>(width), static_cast<long>(height), 1, BitsPerPixel, BI_RGB, data_size, 0, 0, 0, 0 };
	GetDIBits(SDC, hSBmp, 0, height, &Data[0], &Info, DIB_RGB_COLORS);
	this->Flip(&Data[0], &Pixels[0], width, height, BitsPerPixel);

	DeleteDC(SDC);
	DeleteObject(hSBmp);
	ReleaseDC(nullptr, MemDC);
}

static bool pixelIsBorderColor(short& red, short& green, short& blue) {
	if (red == 82 && green == 89 && blue == 90) {
		return true;
	}
	/*else if (red == 0 && green == 0 && blue == 0) {
		return true;
	}
	else if (red == 11 && green == 12 && blue == 12) {
		return true;
	}*/
	/*else if (red == 97 && green == 99 && blue == 96) {
		return true;
	}
	else if (red == 83 && green == 90 && blue == 91) {
		return true;
	}*/

	return false;
}

static bool pixelIsValid(short startingX, short startingY, short& red, short& green, short& blue, short offsetX = 0, short offsetY = 0) {
	HDC dc = NULL;
	COLORREF color = 0;
	POINT p;
	LONG x = 0L;
	LONG y = 0L;

	dc = GetDC(NULL);
	x = startingX + offsetX;
	y = startingY + offsetY;
	color = GetPixel(dc, x, y);
	red = GetRValue(color);
	green = GetGValue(color);
	blue = GetBValue(color);
	ReleaseDC(NULL, dc);

	//cout << "Color at" << x << "," << y << " is " << red << ", " << green << ", " << blue << endl;

	return pixelIsBorderColor(red, green, blue);
}

static void getBottomRightBorderPoint(short startingX, short startingY, short& red, short& green, short& blue, short& offsetX, short checkRange) {
	offsetX += checkRange;

	while (pixelIsValid(startingX, startingY, red, blue, green, offsetX)) {
		offsetX += checkRange;
	}

	offsetX -= checkRange;
}

static void getTopLeftBorderPoint(short startingX, short startingY, short& red, short& green, short& blue, short& offsetY, short checkRange) {
	offsetY += checkRange;

	while (pixelIsValid(startingX, startingY, red, blue, green, 0, offsetY)) {
		offsetY += checkRange;
	}

	offsetY -= checkRange;
}

static std::string scanForText(tesseract::TessBaseAPI& tess, int x1, int y1, int width, int height) {
	std::string result;

	HWND desktop = GetDesktopWindow();
	HDC dc = GetDC(desktop);
	if (!dc) {
		return result;
	}

	// Capture the image
	Image img(dc, x1, y1, width, height);
	ReleaseDC(desktop, dc);

	tess.SetImage(img.GetPixels(), img.GetWidth(), img.GetHeight(),
		img.GetBytesPerPixel(), img.GetBytesPerScanLine());

	char* utf8 = tess.GetUTF8Text();
	if (utf8) {
		result.assign(utf8);
	}

	return result;
}

static void rtrim(std::string& s) {
	// Define the characters to trim (common whitespaces)
	const std::string whitespaces = " \t\n\r\f\v";

	// Find the position of the last non-whitespace character
	size_t last_non_space = s.find_last_not_of(whitespaces);

	// If a non-whitespace character is found, resize the string to end just after it
	if (last_non_space != std::string::npos) {
		s.erase(last_non_space + 1);
	}
	else {
		// If the string contains only whitespace (or is empty), clear it
		s.clear();
	}
}

int main()
{
	short CURSOR_TOOLTIP_OFFSET_X{};
	short CURSOR_TOOLTIP_OFFSET_Y{};

	WCHAR exe_path[MAX_PATH];
	GetModuleFileNameW(NULL, exe_path, MAX_PATH);

	// 2. Extract the directory path
	std::wstring ws_exe_path(exe_path);
	std::wstring exe_dir = ws_exe_path.substr(0, ws_exe_path.find_last_of(L"\\/"));

	std::ifstream file(exe_dir + L"\\scanningConfig.json");

	// Check if the file opened successfully
	if (!file.is_open()) {
		cout << "IGNORE||NO CONFIG FILE FOUND" << endl;
		CURSOR_TOOLTIP_OFFSET_X = 14;
		CURSOR_TOOLTIP_OFFSET_Y = -14;
		//return 0;
	}
	else
	{
		cout << "IGNORE||CONFIG FILE FOUND" << endl;
		// Parse the JSON data directly from the input stream
		json data = json::parse(file);

		// Close the file (optional, as the ifstream destructor does this automatically)
		file.close();

		CURSOR_TOOLTIP_OFFSET_X = data["offsetX"];
		CURSOR_TOOLTIP_OFFSET_Y = data["offsetY"];
	}

	tesseract::TessBaseAPI tess;
	if (tess.Init(NULL, "eng") != 0) {
		// Init failed
		tess.End();
		exit(1);
	}

	string scanText{};
	short checkRange = 50;
	short red = 0;
	short green = 0;
	short blue = 0;
	POINT mousePos{};
	POINT lastValidMousePos{};
	POINT bottomLeftBorderPoint{};
	LONG width = 0;
	LONG height = 0;
	short offsetX = 0;
	short offsetY = 0;
	POINT bottomRightBorderPoint{};
	POINT topLeftBorderPoint{};
	//bool mouseIsStationary = false;
	short mouseStationaryCount = 0;
	bool foundTooltip = false;
	bool borderIsVisible = false;
	bool showedMouseMoved = false;

	short horizontalCheckpoints[3] = { 50, 15, 5 };
	short verticalCheckpoints[3] = { -15, -5, -2 };
	while (true) {
		if (GetCursorPos(&mousePos)) {
			if (lastValidMousePos.x == mousePos.x && lastValidMousePos.y == mousePos.y) {
				mouseStationaryCount++;
			}
			else
			{
				if (showedMouseMoved == false) {
					cout << "MOUSEMOVE" << endl;
					fflush(stdout);
					showedMouseMoved = true;
				}
				mouseStationaryCount = 0;
				foundTooltip = false;
			}

			bottomLeftBorderPoint.x = mousePos.x + CURSOR_TOOLTIP_OFFSET_X;
			bottomLeftBorderPoint.y = mousePos.y + CURSOR_TOOLTIP_OFFSET_Y;

			if (!foundTooltip && mouseStationaryCount > 2) {
				if (pixelIsValid(bottomLeftBorderPoint.x, bottomLeftBorderPoint.y, red, green, blue)) {
					borderIsVisible = true;
				}
				// Check the pixel to the top right of the config one
				else if (pixelIsValid(bottomLeftBorderPoint.x + 1, bottomLeftBorderPoint.y - 1, red, green, blue)) {
					bottomLeftBorderPoint.x++;
					bottomLeftBorderPoint.y--;
					borderIsVisible = true;
				}
				// Check the pixel to the bottom left of the config one
				else if (pixelIsValid(bottomLeftBorderPoint.x - 1, bottomLeftBorderPoint.y + 1, red, green, blue)) {
					bottomLeftBorderPoint.x--;
					bottomLeftBorderPoint.y++;
					borderIsVisible = true;
				}

				if (borderIsVisible) {
					borderIsVisible = false;
					offsetX = 0;
					offsetY = 0;
					//cout << bottomLeftBorderPoint.x << ',' << bottomLeftBorderPoint.y << endl;

					foundTooltip = true;
					for (short i = 0; i < std::size(horizontalCheckpoints); i++) {
						checkRange = horizontalCheckpoints[i];
						getBottomRightBorderPoint(bottomLeftBorderPoint.x, bottomLeftBorderPoint.y, red, green, blue, offsetX, checkRange);
					}

					bottomRightBorderPoint.x = bottomLeftBorderPoint.x + offsetX;
					bottomRightBorderPoint.y = bottomLeftBorderPoint.y;

					for (short i = 0; i < std::size(verticalCheckpoints); i++) {
						checkRange = verticalCheckpoints[i];
						getTopLeftBorderPoint(bottomLeftBorderPoint.x, bottomLeftBorderPoint.y, red, green, blue, offsetY, checkRange);
					}

					topLeftBorderPoint.x = bottomLeftBorderPoint.x;
					topLeftBorderPoint.y = bottomLeftBorderPoint.y + offsetY;

					//cout << topLeftBorderPoint.x << ',' << topLeftBorderPoint.y << "|" << bottomRightBorderPoint.x << ',' << bottomRightBorderPoint.y << endl;

					width = bottomRightBorderPoint.x - bottomLeftBorderPoint.x;
					height = bottomLeftBorderPoint.y - topLeftBorderPoint.y;
					//cout << "Width: " << width << ", Height: " << height << ", Offset X: " << offsetX << ", Offset Y: " << offsetY << endl;

					if (width > 10 && height > 10) {
						scanText = scanForText(tess, topLeftBorderPoint.x + 1, topLeftBorderPoint.y + 1, width, height);
						scanText = regex_replace(scanText, regex("\r\n"), " ");
						scanText = regex_replace(scanText, regex("\n"), " ");
						scanText = regex_replace(scanText, regex("@"), "0");
						if (scanText.length() > 3) {
							rtrim(scanText);
							cout << scanText << "||" << mousePos.x << "," << mousePos.y << endl;
							fflush(stdout);
							showedMouseMoved = false;
						}
					}
				}
			}

			lastValidMousePos = mousePos;
		}

		std::this_thread::sleep_for(std::chrono::milliseconds(25));
	}

	tess.End();
	return 0;
}