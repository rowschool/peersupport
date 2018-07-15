import preferSelectedCodec from "peersupport/models/prefer-selected-codec";

// NOTE: These are the select dropdowns.
// var iceTransportPolicy = document.getElementById('select-iceTransportPolicy');
// var iceTransportLimitation = document.getElementById('select-iceTransportLimitation');
// var codec = document.getElementById('select-codec');

function addIceCandidate(peer, candidate) {
    if(iceTransportLimitation.value === 'tcp') {
        if(candidate.candidate.toLowerCase().indexOf('tcp') === -1) {
            return; // ignore UDP
        }
    }

    peer.addIceCandidate(candidate);
}

var offerer, answerer;
var offererToAnswerer = document.getElementById('peer1-to-peer2');
var answererToOfferer = document.getElementById('peer2-to-peer1');

var iceServers = {
    iceServers: IceServersHandler.getIceServers(),
    iceTransportPolicy: iceTransportPolicy.value,
    rtcpMuxPolicy: 'require',
    bundlePolicy: 'max-bundle'
};

var mediaConstraints = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
};

/* offerer */
function offererPeer(video_stream) {
    offerer = new RTCPeerConnection(iceServers);
    offerer.id = 1;

    video_stream.getTracks().forEach(function(track) {
        offerer.addTrack(track, video_stream);
    });

    var firedOnce = false;
    offerer.ontrack = function (event) {
        if(firedOnce) return;
        firedOnce = true;

        offererToAnswerer.srcObject = event.streams[0];

        if (typeof window.InstallTrigger !== 'undefined') {
            getStats(offerer, event.streams[0].getTracks()[0], function(result) {
                previewGetStatsResult(offerer, result);
            }, 1000);
        }
        else {
            getStats(offerer, function(result) {
                previewGetStatsResult(offerer, result);
            }, 1000);
        }
    };

    offerer.onicecandidate = function (event) {
        if (!event || !event.candidate) return;
        addIceCandidate(answerer, event.candidate);
    };

    offerer.createOffer(mediaConstraints).then(function (offer) {
        offer.sdp = preferSelectedCodec(offer.sdp, codec);
        offerer.setLocalDescription(offer).then(function() {
            answererPeer(offer, video_stream);
        }, function() {});
    }, function() {});
};
/* answerer */

function answererPeer(offer, video_stream) {
    answerer = new RTCPeerConnection(iceServers);
    answerer.id = 2;

    video_stream.getTracks().forEach(function(track) {
        answerer.addTrack(track, video_stream);
    });

    var firedOnce = false;
    answerer.ontrack = function (event) {
        if(firedOnce) return;
        firedOnce = true;

        answererToOfferer.srcObject = event.streams[0];

        if (typeof window.InstallTrigger !== 'undefined') {
            getStats(answerer, event.streams[0].getTracks()[0], function(result) {
                previewGetStatsResult(answerer, result);
            }, 1000);
        }
        else {
            getStats(answerer, function(result) {
                previewGetStatsResult(answerer, result);
            }, 1000);
        }
    };

    answerer.onicecandidate = function (event) {
        if (!event || !event.candidate) return;
        addIceCandidate(offerer, event.candidate);
    };

    answerer.setRemoteDescription(offer);
    answerer.createAnswer(mediaConstraints).then(function (answer) {
        answer.sdp = preferSelectedCodec(answer.sdp, codec);
        answerer.setLocalDescription(answer).then(function() {
            offerer.setRemoteDescription(answer);
        }, function() {});
    }, function() {});
}
var video_constraints = {
    mandatory: {},
    optional: []
};

function getUserMedia(successCallback) {
    function errorCallback(e) {
        alert(JSON.stringify(e, null, '\t'));
    }

    var mediaConstraints = { video: true, audio: true };

    navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
}
var CAMERA_STREAM;
getUserMedia(function (video_stream) {
    CAMERA_STREAM = video_stream;
    offererPeer(video_stream);

    document.getElementById('btn-stop').disabled = false;
})
var STOP_GETSTATS = false;
document.getElementById('btn-stop').onclick = function() {
    this.disabled = true;
    STOP_GETSTATS = true;

    if(CAMERA_STREAM && CAMERA_STREAM.active === true) {
        CAMERA_STREAM.getTracks().forEach(function(track) {
            track.stop();
        });
    }
}

function previewGetStatsResult(peer, result) {
        if(STOP_GETSTATS) {
            result.nomore();
            return;
        }

        if(result.connectionType.remote.candidateType.indexOf('relayed') !== -1) {
            result.connectionType.remote.candidateType = 'TURN';
        }
        else {
            result.connectionType.remote.candidateType = 'STUN';
        }

        document.getElementById('peer' + peer.id + '-remoteIceType').innerHTML = result.connectionType.remote.candidateType;
        document.getElementById('peer' + peer.id + '-externalIPAddressRemote').innerHTML = result.connectionType.remote.ipAddress.join(', ');
        document.getElementById('peer' + peer.id + '-remoteTransport').innerHTML = result.connectionType.remote.transport.join(', ');

        if(result.connectionType.local.candidateType.indexOf('relayed') !== -1) {
            result.connectionType.local.candidateType = 'TURN';
        }
        else {
            result.connectionType.local.candidateType = 'STUN';
        }
        document.getElementById('peer' + peer.id + '-localIceType').innerHTML = result.connectionType.local.candidateType;
        document.getElementById('peer' + peer.id + '-externalIPAddressLocal').innerHTML = result.connectionType.local.ipAddress.join(', ');
        document.getElementById('peer' + peer.id + '-localTransport').innerHTML = result.connectionType.local.transport.join(', ');

        document.getElementById('peer' + peer.id + '-encryptedAs').innerHTML = result.encryption;

        document.getElementById('peer' + peer.id + '-videoResolutionsForSenders').innerHTML = result.resolutions.send.width + 'x' + result.resolutions.send.height;
        document.getElementById('peer' + peer.id + '-videoResolutionsForReceivers').innerHTML = result.resolutions.recv.width + 'x' + result.resolutions.recv.height;

        document.getElementById('peer' + peer.id + '-totalDataForSenders').innerHTML = bytesToSize(result.audio.bytesSent + result.video.bytesSent);
        document.getElementById('peer' + peer.id + '-totalDataForReceivers').innerHTML = bytesToSize(result.audio.bytesReceived + result.video.bytesReceived);

        document.getElementById('peer' + peer.id + '-codecsSend').innerHTML = result.audio.send.codecs.concat(result.video.send.codecs).join(', ');
        document.getElementById('peer' + peer.id + '-codecsRecv').innerHTML = result.audio.recv.codecs.concat(result.video.recv.codecs).join(', ');

        document.getElementById('peer' + peer.id + '-bandwidthSpeed').innerHTML = bytesToSize(result.bandwidth.speed);

        if (result.ended === true) {
            result.nomore();
        }

        window.getStatsResult = result;
}

// function bytesToSize(bytes) {
//     var k = 1000;
//     var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
//     if (bytes <= 0) {
//         return '0 Bytes';
//     }
//     var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
//
//     if(!sizes[i]) {
//         return '0 Bytes';
//     }
//
//     return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
// }
