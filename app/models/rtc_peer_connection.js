import Ember from "ember";
import IceServersHandler from "peersupport/models/ice-servers-handler";
import getStats from "peersupport/models/getStats";

export default Ember.Object.extend(RTCPeerConnection, {
    id: 1,
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

    ontrack: function (event) {
        var firedOnce = this.get("firedOnce");
        if (firedOnce) {
            return;
        }
        this.set("firedOnce", true);

        var that = this;

        // offererToAnswerer.srcObject = event.streams[0];

        // this.set("offererToAnswerer", event.streams[0]);
        this.set("videoSrc", event.streams[0]);

        if (typeof window.InstallTrigger !== 'undefined') {
            getStats(that, event.streams[0].getTracks()[0], function(result) {
                that.previewGetStatsResult(that, result);
            }, 1000);
        }
        else {
            getStats(that, function(result) {
                that.previewGetStatsResult(that, result);
            }, 1000);
        }
    },

    init: function() {
        var that = this;
        var video_stream = this.get("video_stream");

        video_stream.getTracks().forEach(function(track) {
            that.addTrack(track, video_stream);
        });
    },

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
    })
});
