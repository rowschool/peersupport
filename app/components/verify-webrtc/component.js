// source: https://github.com/muaz-khan/getStats

import Ember from "ember";
import IceServersHandler from "peersupport/models/ice_servers_handler";

export default Ember.Component.extend({
    classNames: ["text-center"],

    iceTransportPolicy: "all",
    iceTransportPolicyOptions: [{
        label: "STUN+TURN",
        value: "all",
    }, {
        label: "TURN Only",
        value: "relay"
    }],

    iceTransportLimitation: "all",
    iceTransportLimitationOptions: [{
        label: "UDP+TCP",
        value: "all"
    }, {
        label: "TCP Only",
        value: "tcp"
    }],

    codec: "vp8",
    codecOptions: [{
        label: "VP8",
        value: "vp8"
    }, {
        label: "VP9",
        value: "vp9"
    }, {
        label: "H264",
        value: "h264"
    }],

    actions: {
        iceTransportPolicyChanged: function(value) {
            this.set("iceTransportPolicy", value);
        },
        iceTransportLimitationChanged: function(value) {
            this.set("iceTransportLimitation", value);
        },
        codecChanged: function(value) {
            this.set("codec", value);
        }
    },

    init: function() {
        this._super();

        // TODO: This function is in get_stats.js
        // Refactor it as it goes through each key in its prototyped obj.
        this.getStatsLooper();
    },

    // TODO: Figure out how to call this function properly.
    addIceCandidate: function(peer, candidate) {
        var iceTransportLimitation = this.get("iceTransportLimitation");

        if(iceTransportLimitation === 'tcp') {
            if(candidate.candidate.toLowerCase().indexOf('tcp') === -1) {
                return; // ignore UDP
            }
        }

        peer.addIceCandidate(candidate);
    },

    iceServers: Ember.computed("iceTransportPolicy", function() {
        return {
            iceServers: IceServersHandler.getIceServers(),
            iceTransportPolicy: this.get("iceTransportPolicy"),
            rtcpMuxPolicy: 'require',
            bundlePolicy: 'max-bundle'
        };
    }),

    // var offerer, answerer;

    // NOTE: These two items are already stored in the template.
    // var offererToAnswerer = document.getElementById('peer1-to-peer2');
    // var answererToOfferer = document.getElementById('peer2-to-peer1');

    mediaConstraints: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    },

    /* offerer */
    offererPeer: function(video_stream) {
        var iceServers = this.get("iceServers");
        var offerer = new RTCPeerConnection(iceServers);
        offerer.id = 1;

        video_stream.getTracks().forEach(function(track) {
            offerer.addTrack(track, video_stream);
        });

        var firedOnce = false;
        offerer.ontrack = function (event) {
            if(firedOnce) return;
            firedOnce = true;

            this.set("offererToAnswerer", event.streams[0]);

            if (typeof window.InstallTrigger !== 'undefined') {
                // NOTE: getStats is defined by get_stats_parser
                getStats(offerer, event.streams[0].getTracks()[0], function(result) {
                    previewGetStatsResult(offerer, result);
                }, 1000);
            }
            else {
                // NOTE: getStats is defined by get_stats_parser
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
            offer.sdp = preferSelectedCodec(offer.sdp);
            offerer.setLocalDescription(offer).then(function() {
                answererPeer(offer, video_stream);
            }, function() {});
        }, function() {});
    },

    /* answerer */
    answererPeer: function(offer, video_stream) {
        answerer = new RTCPeerConnection(iceServers);
        answerer.id = 2;

        video_stream.getTracks().forEach(function(track) {
            answerer.addTrack(track, video_stream);
        });

        var firedOnce = false;
        answerer.ontrack = function (event) {
            if(firedOnce) return;
            firedOnce = true;

            this.set("answererToOfferer", event.streams[0]);

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
            answer.sdp = preferSelectedCodec(answer.sdp);
            answerer.setLocalDescription(answer).then(function() {
                offerer.setRemoteDescription(answer);
            }, function() {});
        }, function() {});
    },

    video_constraints: {
        mandatory: {},
        optional: []
    },

    getUserMedia: function(successCallback) {
        function errorCallback(e) {
            alert(JSON.stringify(e, null, '\t'));
        }

        var mediaConstraints = { video: true, audio: true };

        navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
    },

    CAMERA_STREAM: null,
    getUserMedia(function (video_stream) {
        this.set("CAMERA_STREAM", video_stream);
        CAMERA_STREAM = video_stream;
        offererPeer(video_stream);

        document.getElementById('btn-stop').disabled = false;
    });
    stopGetStats: function() {
        var CAMERA_STREAM = this.get("CAMERA_STREAM");

        this.set("isGettingStats", true);

        if (CAMERA_STREAM && CAMERA_STREAM.active) {
            var tracks = CAMERA_STREAM.getTracks();

            tracks.forEach((track) {
                track.stop();
            });
        }
    },
    isGettingStats: false,
    STOP_GETSTATS: Ember.computed.not("isGettingStats"),

    previewGetStatsResult: function(peer, result) {
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

        if(result.connectionType.local.candidateType.indexOf('relayed') !== -1) {
            result.connectionType.local.candidateType = 'TURN';
        }
        else {
            result.connectionType.local.candidateType = 'STUN';
        }

        if (result.ended === true) {
            result.nomore();
        }

        this.set(`statsResult{peer.id}`, result);
        // window.getStatsResult = result;
    },
    statsResult1: null,
    statsResult2: null,
    localTransport1: Ember.computed("statsResult1.connectionType.local.transport", function() {
        return this.get("statsResult1.connectionType.local.transport").join(", ");
    }),
    localTransport2: Ember.computed("statsResult2.connectionType.local.transport", function() {
        return this.get("statsResult2.connectionType.local.transport").join(", ");
    }),
    remoteTransport1: Ember.computed("statsResult1.connectionType.remote.transport", function() {
        return this.get("statsResult1.connectionType.remote.transport").join(", ");
    }),
    remoteTransport2: Ember.computed("statsResult2.connectionType.remote.transport", function() {
        return this.get("statsResult2.connectionType.remote.transport").join(", ");
    }),
    codecsSend1: Ember.computed("statsResult1", function() {
        var result = this.get("statsResult1");
        return result.audio.send.codecs.concat(result.video.send.codecs).join(", ");
    }),
    codecsSend2: Ember.computed("statsResult2", function() {
        var result = this.get("statsResult2");
        return result.audio.send.codecs.concat(result.video.send.codecs).join(", ");
    }),
    codecsRecv1: Ember.computed("statsResult1", function() {
        var result = this.get("statsResult1");
        return result.audio.recv.codecs.concat(result.video.recv.codecs).join(", ");
    }),
    codecsRecv2: Ember.computed("statsResult2", function() {
        var result = this.get("statsResult2");
        return result.audio.recv.codecs.concat(result.video.recv.codecs).join(", ");
    }),
    externalIPAddressLocal1: Ember.computed("statsResult1", function() {
        var result = this.get("statsResult1");
        return result.connectionType.local.ipAddress.join(", ");
    }),
    externalIPAddressLocal2: Ember.computed("statsResult2", function() {
        var result = this.get("statsResult2");
        return result.connectionType.local.ipAddress.join(", ");
    }),
    externalIPAddressRemote1: Ember.computed("statsResult1", function() {
        var result = this.get("statsResult1");
        return result.connectionType.remote.ipAddress.join(", ");
    }),
    externalIPAddressRemote2: Ember.computed("statsResult2", function() {
        var result = this.get("statsResult2");
        return result.connectionType.remote.ipAddress.join(", ");
    }),
    totalDataForSenders1: Ember.computed("statsResult1", function() {
        var result = this.get("statsResult1");
        return result.audio.bytesSent + result.video.bytesSent;
    }),
    totalDataForSenders2: Ember.computed("statsResult2", function() {
        var result = this.get("statsResult2");
        return result.audio.bytesSent + result.video.bytesSent;
    }),
    totalDataForReceivers1: Ember.computed("statsResult1", function() {
        var result = this.get("statsResult1");
        return result.audio.bytesReceived + result.video.bytesReceived;
    }),
    totalDataForReceivers2: Ember.computed("statsResult2", function() {
        var result = this.get("statsResult2");
        return result.audio.bytesReceived + result.video.bytesReceived;
    }),

    preferSelectedCodec: function(sdp) {
        var info = splitLines(sdp);

        if(codec.value === 'vp8' && info.vp8LineNumber === info.videoCodecNumbers[0]) {
            return sdp;
        }

        if(codec.value === 'vp9' && info.vp9LineNumber === info.videoCodecNumbers[0]) {
            return sdp;
        }

        if(codec.value === 'h264' && info.h264LineNumber === info.videoCodecNumbers[0]) {
            return sdp;
        }

        sdp = preferCodec(sdp, codec.value, info);

        return sdp;
    },

    preferCodec: function(sdp, codec, info) {
        var preferCodecNumber = '';

        if(codec === 'vp8') {
            if(!info.vp8LineNumber) {
                return sdp;
            }
            preferCodecNumber = info.vp8LineNumber;
        }

        if(codec === 'vp9') {
            if(!info.vp9LineNumber) {
                return sdp;
            }
            preferCodecNumber = info.vp9LineNumber;
        }

        if(codec === 'h264') {
            if(!info.h264LineNumber) {
                return sdp;
            }

            preferCodecNumber = info.h264LineNumber;
        }

        var newLine = info.videoCodecNumbersOriginal.split('SAVPF')[0] + 'SAVPF ';

        var newOrder = [preferCodecNumber];
        info.videoCodecNumbers.forEach(function(codecNumber) {
            if(codecNumber === preferCodecNumber) return;
            newOrder.push(codecNumber);
        });

        newLine += newOrder.join(' ');

        sdp = sdp.replace(info.videoCodecNumbersOriginal, newLine);
        return sdp;
    },

    splitLines: function(sdp) {
        var info = {};
        sdp.split('\n').forEach(function(line) {
            if (line.indexOf('m=video') === 0) {
                info.videoCodecNumbers = [];
                line.split('SAVPF')[1].split(' ').forEach(function(codecNumber) {
                    codecNumber = codecNumber.trim();
                    if(!codecNumber || !codecNumber.length) return;
                    info.videoCodecNumbers.push(codecNumber);
                    info.videoCodecNumbersOriginal = line;
                });
            }

            if (line.indexOf('VP8/90000') !== -1 && !info.vp8LineNumber) {
                info.vp8LineNumber = line.replace('a=rtpmap:', '').split(' ')[0];
            }

            if (line.indexOf('VP9/90000') !== -1 && !info.vp9LineNumber) {
                info.vp9LineNumber = line.replace('a=rtpmap:', '').split(' ')[0];
            }

            if (line.indexOf('H264/90000') !== -1 && !info.h264LineNumber) {
                info.h264LineNumber = line.replace('a=rtpmap:', '').split(' ')[0];
            }
        });

        return info;
    },
});
