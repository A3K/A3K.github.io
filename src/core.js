function getCameras() {
    return new Promise((resolve, reject) => {
        if (navigator.mediaDevices
            && navigator.mediaDevices.enumerateDevices
            && navigator.mediaDevices.getUserMedia) {
            this._log("navigator.mediaDevices used");
            navigator.mediaDevices.getUserMedia(
                { audio: false, video: true })
                .then(stream => {
                    // hacky approach to close any active stream if they are
                    // active.
                    stream.oninactive
                        = _ => this._log("All streams closed");
                    const closeActiveStreams = stream => {
                        const tracks = stream.getVideoTracks();
                        for (var i = 0; i < tracks.length; i++) {
                            const track = tracks[i];
                            track.enabled = false;
                            track.stop();
                            stream.removeTrack(track);
                        }
                    }

                    navigator.mediaDevices.enumerateDevices()
                        .then(devices => {
                            const results = [];
                            for (var i = 0; i < devices.length; i++) {
                                const device = devices[i];
                                if (device.kind == "videoinput") {
                                    results.push({
                                        id: device.deviceId,
                                        label: device.label
                                    });
                                }
                            }
                            this._log(`${results.length} results found`);
                            closeActiveStreams(stream);
                            resolve(results);
                        })
                        .catch(err => {
                            reject(`${err.name} : ${err.message}`);
                        });
                })
                .catch(err => {
                    reject(`${err.name} : ${err.message}`);
                })
        } else if (MediaStreamTrack && MediaStreamTrack.getSources) {
            this._log("MediaStreamTrack.getSources used");
            const callback = sourceInfos => {
                const results = [];
                for (var i = 0; i !== sourceInfos.length; ++i) {
                    const sourceInfo = sourceInfos[i];
                    if (sourceInfo.kind === 'video') {
                        results.push({
                            id: sourceInfo.id,
                            label: sourceInfo.label
                        });
                    }
                }
                this._log(`${results.length} results found`);
                resolve(results);
            }
            MediaStreamTrack.getSources(callback);
        } else {
            this._log("unable to query supported devices.");
            reject("unable to query supported devices.");
        }
    });
}

function myLog(obj){
    document.getElementById("log").innerHTML += obj;
    console.log(obj);
}

getCameras().then(devices => {
    myLog(devices);
}).catch(reason =>{
    myLog(reason)
})

console.log("Core.js");

