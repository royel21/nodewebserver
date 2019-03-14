var Promise = require('promise');
var StatefulProcessCommandProxy = require("stateful-process-command-proxy");

var statefulProcessCommandProxy = new StatefulProcessCommandProxy(
    {
      name: "test",
      max: 2,
      min: 2,
      idleTimeoutMS: 1,

      logFunction: function(severity,origin,msg) {
          console.log(severity.toUpperCase() + " " +origin+" "+ msg);
      },

      processCommand: 'cmd',
      processArgs:  ['-s'],
      processRetainMaxCmdHistory : 10,

      processInvalidateOnRegex :
          {
            'any':[{regex:'.*error.*',flags:'ig'}],
            'stdout':[{regex:'.*error.*',flags:'ig'}],
            'stderr':[{regex:'.*error.*',flags:'ig'}]
          },

      processCwd : '/',
      processEnvMap : {"testEnvVar":"value1"},
      processUid : null,
      processGid : null,

      initCommands: [ 'testInitVar=test' ],

      validateFunction: function(processProxy) {
          return processProxy.isValid();
      },

      preDestroyCommands: [ 'echo This ProcessProxy is being destroyed!' ]
    });

// echo the value of our env variable set above in the constructor config
statefulProcessCommandProxy.executeCommand('echo testEnvVar')
  .then(function(cmdResult) {
      console.log("testEnvVar value: Stdout: " + cmdResult.stdout);
  }).catch(function(error) {
      console.log("Error: " + error);
  });

// echo the value of our init command that was configured above
statefulProcessCommandProxy.executeCommand('echo testInitVar')
  .then(function(cmdResult) {
      console.log("testInitVar value: Stdout: " + cmdResult.stdout);
  }).catch(function(error) {
      console.log("Error: " + error);
  });

// test that our invalidation regex above traps and destroys this process instance
statefulProcessCommandProxy.executeCommand('echo "this command has an error and will be '+
                ' destroyed after check-in because it matches our invalidation regex"')
  .then(function(cmdResult) {
      console.log("error test: Stdout: " + cmdResult.stdout);
  }).catch(function(error) {
      console.log("Error: " + error);
  });

// set a var in the shell
statefulProcessCommandProxy.executeCommand('MY_VARIABLE=test1;echo MY_VARIABLE WAS JUST SET')
  .then(function(cmdResult) {
      console.log("Stdout: " + cmdResult.stdout);
  }).catch(function(error) {
      console.log("Error: " + error);
  });

// echo it back
statefulProcessCommandProxy.executeCommand('echo $MY_VARIABLE')
  .then(function(cmdResult) {
      console.log("MY_VARIABLE value: Stdout: " + cmdResult.stdout);
  }).catch(function(error) {
      console.log("Error: " + error);
  });

// shutdown the statefulProcessCommandProxy
// this is important and your destroy hooks will
// be called at this time.
setTimeout(function() {
  statefulProcessCommandProxy.shutdown();
},10000);