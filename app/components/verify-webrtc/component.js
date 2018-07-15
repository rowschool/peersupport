// source: https://github.com/muaz-khan/getStats

import Ember from "ember";

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
