{
    "targets": [{
        "target_name": "rcunrar",
        "cflags!": [ "-fno-exceptions","-std=c++11" ],
        "cflags_cc!": [ "-fno-exceptions","cflags" ],
        "sources": [
            "src/bindings.cpp"
        ],
        'include_dirs': [
            "<!@(node -p \"require('node-addon-api').include\")"
        ],
        'dependencies': [
            "<!(node -p \"require('node-addon-api').gyp\")",
            "./librar/unrar.gyp:unrar"
        ],
        "defines": [
        "_FILE_OFFSET_BITS=64",
        "_LARGEFILE_SOURCE",
        "RARDLL",
        'NAPI_DISABLE_CPP_EXCEPTIONS' ]
    }]
}