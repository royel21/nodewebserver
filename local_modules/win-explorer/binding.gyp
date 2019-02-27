{
    "targets": [{
        "target_name": "win_explorer",
        "cflags!": [ "-fno-exceptions" ],
        "cflags_cc!": [ "-fno-exceptions" ],
        "sources": [
            "src/bindings.cpp"
        ],
      "conditions":[
      	["OS=='linux'", {
      	  "sources": [ "native-rt_linux.cc" ]
      	  }],
      	["OS=='mac'", {
      	  "sources": [ "native-rt_mac.cc" ]
      	}],
        ["OS=='win'", {
      	  "sources": [ "native-rt_win.cc" ]
      	}]
      ],
        'include_dirs': [
            "<!@(node -p \"require('node-addon-api').include\")"
        ],
        'dependencies': [
            "<!(node -p \"require('node-addon-api').gyp\")"
        ],
        "defines": [
        "NAPI_DISABLE_CPP_EXCEPTIONS" ]
    }]
}