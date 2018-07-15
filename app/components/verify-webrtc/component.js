// source: https://github.com/muaz-khan/getStats

import Ember from "ember";
import IceServersHandler from "peersupport/models/ice-servers-handler";
import getStats from "peersupport/models/getStats";
import preferSelectedCodec from "peersupport/models/prefer-selected-codec";

export default Ember.Component.extend({
    classNames: ["text-center"],

    offerer: null,
    answerer: null,
    offererToAnswerer: null,
    answererToOfferer: null,

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

    iceServers: Ember.computed("iceTransportPolicy", function() {
        var iceTransportPolicy = this.get("iceTransportPolicy");

        return {
            iceServers: IceServersHandler.getIceServers(),
            iceTransportPolicy: iceTransportPolicy,
            rtcpMuxPolicy: 'require',
            bundlePolicy: 'max-bundle'
        };
    }),
    mediaConstraints: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    },

    STOP_GETSTATS: false,
    CAMERA_STREAM: null,
    init: function() {
        this._super();
        var that = this;

        this.getUserMedia(function (video_stream) {
            that.set("CAMERA_STREAM", video_stream);
            that.offererPeer(video_stream);
        });
    },
    getUserMedia: function(successCallback) {
        function errorCallback(e) {
            alert(JSON.stringify(e, null, '\t'));
        }

        var mediaConstraints = { video: true, audio: true };

        navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
    },

    /* offerer */
    offererPeer: function(video_stream) {
        var iceServers = this.get("iceServers");
        var mediaConstraints = this.get("mediaConstraints");
        var offerer = new RTCPeerConnection(iceServers);
        var codec = this.get("codec");
        offerer.id = 1;
        var that = this;

        video_stream.getTracks().forEach(function(track) {
            offerer.addTrack(track, video_stream);
        });

        var firedOnce = false;
        offerer.ontrack = function (event) {
            if(firedOnce) return;
            firedOnce = true;

            // offererToAnswerer.srcObject = event.streams[0];
            that.set("offererToAnswerer", event.streams[0]);

            if (typeof window.InstallTrigger !== 'undefined') {
                getStats(offerer, event.streams[0].getTracks()[0], function(result) {
                    that.previewGetStatsResult(offerer, result);
                }, 1000);
            }
            else {
                getStats(offerer, function(result) {
                    that.previewGetStatsResult(offerer, result);
                }, 1000);
            }
        };

        offerer.onicecandidate = function (event) {
            if (!event || !event.candidate) return;
            that.addIceCandidate(answerer, event.candidate);
        };

        offerer.createOffer(mediaConstraints).then(function (offer) {
            offer.sdp = preferSelectedCodec(offer.sdp, codec);
            offerer.setLocalDescription(offer).then(function() {
                that.answererPeer(offer, video_stream);
            }, function() {});
        }, function() {});
    },
    /* answerer */
    answererPeer: function(offer, video_stream) {
        var iceServers = this.get("iceServers");
        var mediaConstraints = this.get("mediaConstraints");
        var answerer = new RTCPeerConnection(iceServers);
        var codec = this.get("codec");
        answerer.id = 2;
        var that = this;

        video_stream.getTracks().forEach(function(track) {
            answerer.addTrack(track, video_stream);
        });

        var firedOnce = false;
        answerer.ontrack = function (event) {
            if(firedOnce) return;
            firedOnce = true;

            // answererToOfferer.srcObject = event.streams[0];
            that.set("answererToOfferer", event.streams[0]);

            if (typeof window.InstallTrigger !== 'undefined') {
                getStats(answerer, event.streams[0].getTracks()[0], function(result) {
                    that.previewGetStatsResult(answerer, result);
                }, 1000);
            }
            else {
                getStats(answerer, function(result) {
                    that.previewGetStatsResult(answerer, result);
                }, 1000);
            }
        };

        answerer.onicecandidate = function (event) {
            if (!event || !event.candidate) return;
            that.addIceCandidate(offerer, event.candidate);
        };

        answerer.setRemoteDescription(offer);
        answerer.createAnswer(mediaConstraints).then(function (answer) {
            answer.sdp = preferSelectedCodec(answer.sdp, codec);
            answerer.setLocalDescription(answer).then(function() {
                offerer.setRemoteDescription(answer);
            }, function() {});
        }, function() {});
    },

    previewGetStatsResult: function(peer, result) {
        var STOP_GETSTATS = this.get("STOP_GETSTATS");
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
    },
    addIceCandidate: function(peer, candidate) {
        var iceTransportLimitation = this.get("iceTransportLimitation");

        if(iceTransportLimitation === 'tcp') {
            if(candidate.candidate.toLowerCase().indexOf('tcp') === -1) {
                return; // ignore UDP
            }
        }

        peer.addIceCandidate(candidate);
    },

    actions: {
        iceTransportPolicyChanged: function(value) {
            this.set("iceTransportPolicy", value);
            // TODO: set model values when this action is triggered
        },
        iceTransportLimitationChanged: function(value) {
            this.set("iceTransportLimitation", value);
        },
        codecChanged: function(value) {
            this.set("codec", value);
        }
    },

    // offerer, answerer
    // statsResult1: null,
    // statsResult2: null,
    // localTransport1: Ember.computed("statsResult1.connectionType.local.transport", function() {
    //     return this.get("statsResult1.connectionType.local.transport").join(", ");
    // }),
    // localTransport2: Ember.computed("statsResult2.connectionType.local.transport", function() {
    //     return this.get("statsResult2.connectionType.local.transport").join(", ");
    // }),
    // remoteTransport1: Ember.computed("statsResult1.connectionType.remote.transport", function() {
    //     return this.get("statsResult1.connectionType.remote.transport").join(", ");
    // }),
    // remoteTransport2: Ember.computed("statsResult2.connectionType.remote.transport", function() {
    //     return this.get("statsResult2.connectionType.remote.transport").join(", ");
    // }),
    // codecsSend1: Ember.computed("statsResult1", function() {
    //     var result = this.get("statsResult1");
    //     return result.audio.send.codecs.concat(result.video.send.codecs).join(", ");
    // }),
    // codecsSend2: Ember.computed("statsResult2", function() {
    //     var result = this.get("statsResult2");
    //     return result.audio.send.codecs.concat(result.video.send.codecs).join(", ");
    // }),
    // codecsRecv1: Ember.computed("statsResult1", function() {
    //     var result = this.get("statsResult1");
    //     return result.audio.recv.codecs.concat(result.video.recv.codecs).join(", ");
    // }),
    // codecsRecv2: Ember.computed("statsResult2", function() {
    //     var result = this.get("statsResult2");
    //     return result.audio.recv.codecs.concat(result.video.recv.codecs).join(", ");
    // }),
    // externalIPAddressLocal1: Ember.computed("statsResult1", function() {
    //     var result = this.get("statsResult1");
    //     return result.connectionType.local.ipAddress.join(", ");
    // }),
    // externalIPAddressLocal2: Ember.computed("statsResult2", function() {
    //     var result = this.get("statsResult2");
    //     return result.connectionType.local.ipAddress.join(", ");
    // }),
    // externalIPAddressRemote1: Ember.computed("statsResult1", function() {
    //     var result = this.get("statsResult1");
    //     return result.connectionType.remote.ipAddress.join(", ");
    // }),
    // externalIPAddressRemote2: Ember.computed("statsResult2", function() {
    //     var result = this.get("statsResult2");
    //     return result.connectionType.remote.ipAddress.join(", ");
    // }),
    // totalDataForSenders1: Ember.computed("statsResult1", function() {
    //     var result = this.get("statsResult1");
    //     return result.audio.bytesSent + result.video.bytesSent;
    // }),
    // totalDataForSenders2: Ember.computed("statsResult2", function() {
    //     var result = this.get("statsResult2");
    //     return result.audio.bytesSent + result.video.bytesSent;
    // }),
    // totalDataForReceivers1: Ember.computed("statsResult1", function() {
    //     var result = this.get("statsResult1");
    //     return result.audio.bytesReceived + result.video.bytesReceived;
    // }),
    // totalDataForReceivers2: Ember.computed("statsResult2", function() {
    //     var result = this.get("statsResult2");
    //     return result.audio.bytesReceived + result.video.bytesReceived;
    // })
});
