#include <napi.h>
#include "rar.hpp"
#include <iostream>
#include <io.h>
#include <wchar.h> 
#include <locale>

#define RAR_LIST     0
#define RAR_TEST     1
#define RAR_EXTRACT  2
#define RAR_DIR      0x20
namespace Node_Win_UnRar
{

static void reset_RAROpenArchiveDataEx(struct RAROpenArchiveDataEx *s)
{
  memset(s, 0, sizeof(struct RAROpenArchiveDataEx));
}

static void reset_RARHeaderDataEx(struct RARHeaderDataEx *s)
{
  memset(s, 0, sizeof(struct RARHeaderDataEx));
}

int CALLBACK CallbackProc(UINT msg, LPARAM UserData, LPARAM P1, LPARAM P2);

Napi::Array ListFiles(const Napi::CallbackInfo &info);

Napi::Buffer<uint8_t> ExtractFile(const Napi::CallbackInfo &info);

Napi::Object Init(Napi::Env env, Napi::Object exports);
} // namespace Unrar_Mod