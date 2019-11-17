#include <vector>
#include <string>
#include <dirent.h>
#include <sys/stat.h>
#include <iostream>

struct file{
    std::string name;
    std::string ex;
    long 
}

void ListFiles(std::string filepath)
{
  std::vector<std::string> files;

  struct dirent *d_file;
  int i = 0;
  DIR *d_dir = opendir(str2.c_str());
  if(d_dir != NULL){

    while((d_file = readdir(d_dir))){

      if (d_file->d_name[0] == '.') continue;
      if (strcmp(d_file->d_name, "..")) continue;

      //Napi::Object file = Napi::Object::New(env);
      //file.Set("FileName", Napi::String::New(env, d_file->d_name));

      bool isDir = d_file->d_type == DT_DIR;
      //file.Set("isDirectory", Napi::Boolean::New(env, isDir));
      //file.Set("isHidden", Napi::Boolean::New(env, false));

      //file.Set("LastModified", Napi::String::New(env, ""));

      if (!isDir)
      {
        std::string str = std::string(d_file->d_name);
        
        
        int pos = (int)str.find_last_of(".")+1;

        file.Set("extension", Napi::String::New(env, (const char16_t *)d_file->d_name + pos));
        std::string basePath = str2 + std::string(d_file->d_name);

        struct stat statbuf;
        stat(basePath.c_str(), &statbuf);

        //file.Set("Size", Napi::Number::New(env,  (intmax_t) statbuf.st_size));
      }
      else
      {
        //file.Set("extension", Napi::String::New(env, "none"));

      }

    }
  }

  return objectArray;
}