#include "bindings.h"

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  return Node_Win_UnRar::Init(env, exports);
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init);

//Native Function and variable
std::vector<uint8_t> tempBuff;
std::string error;
int CALLBACK Node_Win_UnRar::CallbackProc(UINT msg, LPARAM UserData, LPARAM P1, LPARAM P2)
{
  switch (msg)
  {
  case UCM_CHANGEVOLUME:
    return -1;
    break;
  case UCM_PROCESSDATA:
    tempBuff.insert(tempBuff.end(), (char *)P1, ((char *)P1) + P2);
    return 1;
    break;
  case UCM_NEEDPASSWORD:
    error = "Password Needed";
    return -1;
    break;
  default:
    return -1;
  }
}

Napi::Buffer<uint8_t> Node_Win_UnRar::ExtractFile(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  if (info.Length() > 1 && !info[0].IsString() && info[1].IsNumber())
  {
    Napi::TypeError::New(env, "String expected").ThrowAsJavaScriptException();
  }
  std::string passwd;
  if (info.Length() == 3)
  {
    passwd = info[0].As<Napi::String>().ToString();
  }

  Napi::String path = info[0].As<Napi::String>();
  int findex = info[1].As<Napi::Number>().Int32Value();

  struct RAROpenArchiveDataEx archive;
  reset_RAROpenArchiveDataEx(&archive);
  std::u16string str1 = path.Utf16Value();
  archive.ArcNameW = (wchar_t *)str1.c_str();
  archive.OpenMode = RAR_TEST;
  archive.Callback = CallbackProc;

  HANDLE handler = RAROpenArchiveEx(&archive);

  if (archive.OpenResult != ERAR_SUCCESS)
  {
    Napi::TypeError::New(env, "File Error").ThrowAsJavaScriptException();
  }

  // Processing entries
  int result = 0;
  int i = 0;
  Napi::Buffer<uint8_t> buff;
  while (result == 0)
  {
    if (i == findex)
    {
      archive.OpenMode = RAR_TEST;
    }
    else
    {
      archive.OpenMode = RAR_SKIP;
    }
    struct RARHeaderDataEx entry;

    RARSetPassword(handler, (char *)passwd.c_str());

    reset_RARHeaderDataEx(&entry);

    result = RARReadHeaderEx(handler, &entry);

    if (result == 0)
    {
      RARProcessFileW(handler, archive.OpenMode, NULL, 0);
    }

    buff = Napi::Buffer<uint8_t>::Copy(env, tempBuff.data(), tempBuff.size());

    if (tempBuff.size() > 0)
    {
      tempBuff.clear();
      break;
    }
    else
      i++;
  }

  // Success
  if (result == ERAR_END_ARCHIVE)
  {
    result = 0;
  }

  RARCloseArchive(handler);

  return buff;
}

/****************************************************************/

Napi::Array Node_Win_UnRar::ListFiles(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  if (!info[0].IsString())
  {
    Napi::TypeError::New(env, "String expected").ThrowAsJavaScriptException();
  }
  Napi::String path = info[0].As<Napi::String>();

  struct RAROpenArchiveDataEx archive;
  reset_RAROpenArchiveDataEx(&archive);
  std::u16string str1 = path.Utf16Value();
  archive.ArcNameW = (wchar_t *)str1.c_str();
  archive.OpenMode = RAR_LIST;
  // Opening archive
  HANDLE handler = RAROpenArchiveEx(&archive);

  Napi::Array objectArray = Napi::Array::New(env);
  int i = 0;

  if (archive.OpenResult != ERAR_SUCCESS)
  {
    objectArray[i++] = Napi::String::New(env, "Error opening archive");
    objectArray[i++] = Napi::String::New(env, archive.ArcName);
    return objectArray;
  }

  // Processing entries
  int result = 0;
  int fIndex = 0;
  while (result == 0)
  {
    struct RARHeaderDataEx entry;
    reset_RARHeaderDataEx(&entry);
    //clear the buffer for next entry
    result = RARReadHeaderEx(handler, &entry);

    if (result == 0)
    {
      if (RARProcessFileW(handler, archive.OpenMode, NULL, 0))
        break;
    }

    if (!(entry.Flags & RAR_DIR) && wcslen(entry.FileNameW) > 2)
    {
      Napi::Object arch = Napi::Object::New(env);
      arch.Set("Name", Napi::String::New(env, (const char16_t *)entry.FileNameW));
      arch.Set("Size", Napi::Number::New(env, entry.UnpSize));
      arch.Set("Index", Napi::Number::New(env, fIndex++));
      wchar_t *pstr = wcsrchr(entry.FileNameW, '.');
      int pos = (int)(pstr - entry.FileNameW + 1);
      arch.Set("Extension", Napi::String::New(env, (const char16_t *)entry.FileNameW + pos));

      objectArray[i++] = arch;
    }
  }

  // Success
  if (result == ERAR_END_ARCHIVE)
  {
    result = 0;
  }

  RARCloseArchive(handler);
  return objectArray;
}

//funtion exporter
Napi::Object Node_Win_UnRar::Init(Napi::Env env, Napi::Object exports)
{
  exports.Set(
      "ListFiles", Napi::Function::New(env, Node_Win_UnRar::ListFiles));
  exports.Set(
      "ExtractFile", Napi::Function::New(env, Node_Win_UnRar::ExtractFile));

  return exports;
}
