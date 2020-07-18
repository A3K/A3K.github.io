"use strict";

function getCameras() {
  var _this = this;

  return new Promise(function (resolve, reject) {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices && navigator.mediaDevices.getUserMedia) {
      _this._log("navigator.mediaDevices used");

      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
      }).then(function (stream) {
        // hacky approach to close any active stream if they are
        // active.
        stream.oninactive = function (_) {
          return _this._log("All streams closed");
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

          _this._log("".concat(results.length, " results found"));

          closeActiveStreams(stream);
          resolve(results);
        })["catch"](function (err) {
          reject("".concat(err.name, " : ").concat(err.message));
        });
      })["catch"](function (err) {
        reject("".concat(err.name, " : ").concat(err.message));
      });
    } else if (MediaStreamTrack && MediaStreamTrack.getSources) {
      _this._log("MediaStreamTrack.getSources used");

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

        _this._log("".concat(results.length, " results found"));

        resolve(results);
      };

      MediaStreamTrack.getSources(callback);
    } else {
      _this._log("unable to query supported devices.");

      reject("unable to query supported devices.");
    }
  });
}

function myLog(obj) {
  document.getElementById("log").innerHTML += obj;
  console.log(obj);
}

getCameras().then(function (devices) {
  myLog(devices);
})["catch"](function (reason) {
  myLog(reason);
});
console.log("Core.js");