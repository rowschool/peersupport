// source: https://github.com/muaz-khan/getStats

import Ember from "ember";
import IceServersHandler from "peersupport/models/ice-servers-handler";
import preferSelectedCodec from "peersupport/models/prefer-selected-codec";

export default Ember.Component.extend({
    classNames: ["text-center"],

    offerer: null,
    answerer: null,
    statsResult1: Ember.computed.alias("offerer"),
    statsResult2: Ember.computed.alias("answerer"),

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
        var mediaConstraints = this.get("mediaConstraints");
        var codec = this.get("codec");
        var that = this;

        var offerer = this.get("offerer"),
            answerer = this.get("answerer");

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
        var mediaConstraints = this.get("mediaConstraints");
        var codec = this.get("codec");
        var that = this;

        var offerer = this.get("offerer"),
            answerer = this.get("answerer");

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
    }
});
