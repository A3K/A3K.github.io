"use strict";

function getCameras() {
  return new Promise(function (resolve, reject) {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices && navigator.mediaDevices.getUserMedia) {
      myLog("navigator.mediaDevices used");
      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
      }).then(function (stream) {
        // hacky approach to close any active stream if they are
        // active.
        stream.oninactive = function (_) {
          return myLog("All streams closed");
        };

        var closeActiveStreams = function closeActiveStreams(stream) {
          var tracks = stream.getVideoTracks();

          for (var i = 0; i < tracks.length; i++) {
            var track = tracks[i];
            track.enabled = false;
            track.stop();
            stream.removeTrack(track);
          }
        };

        navigator.mediaDevices.enumerateDevices().then(function (devices) {
          var results = [];

          for (var i = 0; i < devices.length; i++) {
            var device = devices[i];

            if (device.kind == "videoinput") {
              results.push({
                id: device.deviceId,
                label: device.label
              });
            }
          }

          myLog("".concat(results.length, " results found"));
          closeActiveStreams(stream);
          resolve(results);
        })["catch"](function (err) {
          reject("".concat(err.name, " : ").concat(err.message));
        });
      })["catch"](function (err) {
        reject("".concat(err.name, " : ").concat(err.message));
      });
    } else if (MediaStreamTrack && MediaStreamTrack.getSources) {
      myLog("MediaStreamTrack.getSources used");

      var callback = function callback(sourceInfos) {
        var results = [];

        for (var i = 0; i !== sourceInfos.length; ++i) {
          var sourceInfo = sourceInfos[i];

          if (sourceInfo.kind === 'video') {
            results.push({
              id: sourceInfo.id,
              label: sourceInfo.label
            });
          }
        }

        myLog("".concat(results.length, " results found"));
        resolve(results);
      };

      MediaStreamTrack.getSources(callback);
    } else {
      myLog("unable to query supported devices.");
      reject("unable to query supported devices.");
    }
  });
}

function myLog(obj) {
  document.getElementById("log").innerHTML += JSON.stringify(obj, null, '\t') + "\n";
  console.log(obj);
}

getCameras().then(function (devices) {
  myLog(devices);
})["catch"](function (reason) {
  myLog(reason);
});
console.log("Core.js");