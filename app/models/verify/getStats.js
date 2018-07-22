var getStats = function(mediaStreamTrack, callback, interval) {
    // if (typeof MediaStreamTrack === 'undefined') {
    //     MediaStreamTrack = {}; // todo?
    // }

    var peer = mediaStreamTrack;

    if (arguments[0] instanceof RTCPeerConnection) {
        peer = arguments[0];

        if (!!navigator.mozGetUserMedia) {
            mediaStreamTrack = arguments[1];
            callback = arguments[2];
            interval = arguments[3];
        }

        if (!(mediaStreamTrack instanceof MediaStreamTrack) && !!navigator.mozGetUserMedia) {
            throw '2nd argument is not instance of MediaStreamTrack.';
        }
    } else if (!(mediaStreamTrack instanceof MediaStreamTrack) && !!navigator.mozGetUserMedia) {
        throw '1st argument is not instance of MediaStreamTrack.';
    }
    // var nomore = false;

    function getStatsLooper() {
        getStatsWrapper(
        // function(results) {
            // results.forEach(function(result) {
            //     Object.keys(getStatsParser).forEach(function(key) {
            //         if (typeof getStatsParser[key] === 'function') {
            //             getStatsParser[key](result);
            //         }
            //     });
            //
            //     if (result.type !== 'local-candidate' && result.type !== 'remote-candidate' && result.type !== 'candidate-pair') {
            //         console.error('result', result);
            //     }
            // });

            // try {
            //     // failed|closed
            //     if (peer.iceConnectionState.search(/failed/gi) !== -1) {
            //         nomore = true;
            //     }
            // } catch (e) {
            //     nomore = true;
            // }

            // if (nomore === true) {
            //     if (getStatsResult.datachannel) {
            //         getStatsResult.datachannel.state = 'close';
            //     }
            //     getStatsResult.ended = true;
            // }

            // allow users to access native results
            // getStatsResult.results = results;
            //
            // if (getStatsResult.audio && getStatsResult.video) {
            //     getStatsResult.bandwidth.speed = (getStatsResult.audio.bytesSent - getStatsResult.bandwidth.helper.audioBytesSent) + (getStatsResult.video.bytesSent - getStatsResult.bandwidth.helper.videoBytesSent);
            //     getStatsResult.bandwidth.helper.audioBytesSent = getStatsResult.audio.bytesSent;
            //     getStatsResult.bandwidth.helper.videoBytesSent = getStatsResult.video.bytesSent;
            // }

            // callback(getStatsResult);
            // NOTE: The callback is to set statsResult in the model.


            // second argument checks to see, if target-user is still connected.
            // NOTE: If the stop button hasn't been pressed, this same method runs again.
            // if (!nomore) {
            //     typeof interval != undefined && interval && setTimeout(getStatsLooper, interval || 1000);
            // }
        // }
      );
    }
    // a wrapper around getStats which hides the differences (where possible)
    // following code-snippet is taken from somewhere on the github

    // NOTE: getStatsLooper calls getStatsWrapper with itself as a callback function.
    function getStatsWrapper(cb) {
        // if !peer or peer.signalingState == 'closed' then return;

        if (typeof window.InstallTrigger !== 'undefined') {
            peer.getStats(
                mediaStreamTrack,
                function(res) {
                    var items = [];
                    res.forEach(function(r) {
                        items.push(r);
                    });

                    cb(items);
                },
                cb
            );
        } else {
            peer.getStats(function(res) {
                var items = [];
                res.result().forEach(function(res) {
                    var item = {};
                    res.names().forEach(function(name) {
                        item[name] = res.stat(name);
                    });
                    item.id = res.id;
                    item.type = res.type;
                    item.timestamp = res.timestamp;
                    items.push(item);
                });
                cb(items);
            });
        }
    }

    getStatsLooper();
};

export default getStats;
