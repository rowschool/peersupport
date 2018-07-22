import Ember from "ember";
import IceServersHandler from "peersupport/models/ice-servers-handler";
import getStats from "peersupport/models/getStats";
import RtcPeerConnectionMixin from "peersupport/models/rtc_peer_connection_mixin";

export default Ember.Object.extend(RtcPeerConnectionMixin, {
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

    // previewGetStatsResult: function(peer, result) {
    //     if (result.ended === true) {
    //         result.nomore();
    //     }
    //
    //     window.getStatsResult = result;
    // },

    // ontrack: function (event) {
    //     var peer = this.get("peer");
    //     var firedOnce = this.get("firedOnce");
    //     if (firedOnce) {
    //         return;
    //     }
    //     this.set("firedOnce", true);
    //
    //     var that = this;
    //
    //     peer.set("videoSrc", event.streams[0]);
    //
    //     if (typeof window.InstallTrigger !== 'undefined') {
    //         getStats(peer, event.streams[0].getTracks()[0], function(result) {
    //             that.set("statsResult", result);
    //         }, 1000);
    //     }
    //     else {
    //         getStats(peer, function(result) {
    //             that.set("statsResult", result);
    //         }, 1000);
    //     }
    // },

    init: function() {
        var peer = RtcPeerConnectionMixin;
        peer.id = this.get("id");
        peer.iceServers = this.get("iceServers");
        // debugger;
        // var peer = new RtcPeerConnectionMixin({
        //     id: this.get("id"),
        //     iceServers: this.get("iceServers")
        // });
        debugger;
        var that = this;
        // var video_stream = peer.get("video_stream");
        // var video_stream = peer.video_stream;
        // video_stream.getTracks().forEach(function(track) {
        //     peer.addTrack(track, video_stream);
        // });
    },

    remoteCandidateType: Ember.computed("statsResult.connectionType.remote.candidateType", function() {
        var remoteCandidateType = this.get("statsResult.connectionType.remote.candidateType") || "";

        return remoteCandidateType.includes("relayed") ? "STUN" : "TURN";
    }),
    localCandidateType: Ember.computed("statsResult.connectionType.local.candidateType", function() {
        var localCandidateType = this.get("statsResult.connectionType.local.candidateType") || "";

        return localCandidateType.includes("relayed") ? "STUN" : "TURN";
    }),
    localTransport: Ember.computed("statsResult.connectionType.local.transport", function() {
        return this.get("statsResult.connectionType.local.transport").join(", ") || "";
    }),
    remoteTransport: Ember.computed("statsResult.connectionType.remote.transport", function() {
        return this.get("statsResult.connectionType.remote.transport").join(", ") || "";
    }),
    codecsSend: Ember.computed("statsResult", function() {
        var result = this.get("statsResult") || {};
        return result.audio.send.codecs.concat(result.video.send.codecs).join(", ");
    }),
    codecsRecv: Ember.computed("statsResult", function() {
        var result = this.get("statsResult") || {};
        return result.audio.recv.codecs.concat(result.video.recv.codecs).join(", ");
    }),
    externalIPAddressLocal: Ember.computed("statsResult", function() {
        var result = this.get("statsResult") || {};
        return result.connectionType.local.ipAddress.join(", ");
    }),
    externalIPAddressRemote: Ember.computed("statsResult", function() {
        var result = this.get("statsResult") || {};
        return result.connectionType.remote.ipAddress.join(", ");
    }),
    totalDataForSenders: Ember.computed("statsResult", function() {
        var result = this.get("statsResult") || {};
        return result.audio.bytesSent + result.video.bytesSent;
    }),
    totalDataForReceivers: Ember.computed("statsResult", function() {
        var result = this.get("statsResult") || {};
        return result.audio.bytesReceived + result.video.bytesReceived;
    })
});
