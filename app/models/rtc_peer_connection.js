import Ember from "ember";
import IceServersHandler from "peersupport/models/ice-servers-handler";
import getStats from "peersupport/models/getStats";

// TODO: Instantiate peer object within this class...
var RtcPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;

export default Ember.Object.extend({
    id: 1,
    peer: null,
    iceTransportPolicy: "all",
    firedOnce: false,

    iceServers: Ember.computed("iceTransportPolicy", function() {
        var iceTransportPolicy = this.get("iceTransportPolicy");

        return {
            iceServers: IceServersHandler.getIceServers(),
            iceTransportPolicy: iceTransportPolicy,
            rtcpMuxPolicy: 'require',
            bundlePolicy: 'max-bundle'
        };
    }),

    videoSrc: null,

    previewGetStatsResult: function(peer, result) {
        if (result.ended === true) {
            result.nomore();
        }

        window.getStatsResult = result;
    },

    ontrack: function (event) {
        var peer = this.get("peer");
        var firedOnce = this.get("firedOnce");
        if (firedOnce) {
            return;
        }
        this.set("firedOnce", true);

        var that = this;

        peer.set("videoSrc", event.streams[0]);

        if (typeof window.InstallTrigger !== 'undefined') {
            getStats(peer, event.streams[0].getTracks()[0], function(result) {
                that.set("statsResult", result);
            }, 1000);
        }
        else {
            getStats(peer, function(result) {
                that.set("statsResult", result);
            }, 1000);
        }
    },

    init: function() {
        var peer = new RtcPeerConnection();
        var video_stream = peer.get("video_stream");

        video_stream.getTracks().forEach(function(track) {
            peer.addTrack(track, video_stream);
        });
    },

    remoteCandidateType: Ember.computed("result.connectionType.remote.candidateType", function() {
        var remoteCandidateType = this.get("result.connectionType.remote.candidateType");

        return remoteCandidateType.includes("relayed") ? "STUN" : "TURN";
    }),
    localCandidateType: Ember.computed("result.connectionType.local.candidateType", function() {
        var localCandidateType = this.get("result.connectionType.local.candidateType");

        return localCandidateType.includes("relayed") ? "STUN" : "TURN";
    }),
    localTransport: Ember.computed("statsResult.connectionType.local.transport", function() {
        return this.get("statsResult.connectionType.local.transport").join(", ");
    }),
    remoteTransport: Ember.computed("statsResult.connectionType.remote.transport", function() {
        return this.get("statsResult.connectionType.remote.transport").join(", ");
    }),
    codecsSend: Ember.computed("statsResult", function() {
        var result = this.get("statsResult");
        return result.audio.send.codecs.concat(result.video.send.codecs).join(", ");
    }),
    codecsRecv: Ember.computed("statsResult", function() {
        var result = this.get("statsResult");
        return result.audio.recv.codecs.concat(result.video.recv.codecs).join(", ");
    }),
    externalIPAddressLocal: Ember.computed("statsResult", function() {
        var result = this.get("statsResult");
        return result.connectionType.local.ipAddress.join(", ");
    }),
    externalIPAddressRemote: Ember.computed("statsResult", function() {
        var result = this.get("statsResult");
        return result.connectionType.remote.ipAddress.join(", ");
    }),
    totalDataForSenders: Ember.computed("statsResult", function() {
        var result = this.get("statsResult");
        return result.audio.bytesSent + result.video.bytesSent;
    }),
    totalDataForReceivers: Ember.computed("statsResult", function() {
        var result = this.get("statsResult");
        return result.audio.bytesReceived + result.video.bytesReceived;
    })
});
