import Ember from "ember";

export default Ember.Component.extend({
    // TODO: Make query params contain the channel name.

    classNames: ["chat-window"],

    rtcMultiConnection: null,

    numberOfUsers: 1,

    isWebcamDisabled: true,
    isMicDisabled: true,
    isScreenSharingDisabled: true,
    isFileSharingDisabled: true,

    actions: {
        toggleWebcam: function() {
            var rtcMultiConnection = this.get("rtcMultiConnection");

            this.set("isWebcamDisabled", false);
            var session = { audio: true, video: true };

            rtcMultiConnection.captureUserMedia(function(stream) {
                var streamid = rtcMultiConnection.token();
                rtcMultiConnection.customStreams[streamid] = stream;

                rtcMultiConnection.sendMessage({
                    hasCamera: true,
                    streamid: streamid,
                    session: session
                });
            }, session);
        },
        toggleMic: function() {
            var rtcMultiConnection = this.get("rtcMultiConnection");

            this.set("isMicDisabled", false);
            var session = { audio: true };

            rtcMultiConnection.captureUserMedia(function(stream) {
                var streamid = rtcMultiConnection.token();
                rtcMultiConnection.customStreams[streamid] = stream;

                rtcMultiConnection.sendMessage({
                    hasMic: true,
                    streamid: streamid,
                    session: session
                });
            }, session);
        },
        toggleScreenSharing: function() {
            this.set("isScreenSharingDisabled", false);
            var rtcMultiConnection = this.get("rtcMultiConnection");
            var session = { screen: true };

            rtcMultiConnection.captureUserMedia(function(stream) {
                var streamid = rtcMultiConnection.token();
                rtcMultiConnection.customStreams[streamid] = stream;

                rtcMultiConnection.sendMessage({
                    hasScreen: true,
                    streamid: streamid,
                    session: session
                });
            }, session);
        },
        toggleFileSharing: function() {
            var rtcMultiConnection = this.get("rtcMultiConnection");
            var file = document.createElement('input');
            file.type = 'file';

            file.onchange = function() {
                rtcMultiConnection.send(this.files[0]);
            };

            this.fireClickEvent(file);
        },
        toggleDisplaySettings: function() {
            this.toggleProperty("isDisplayingSettings");
        },
        closeSettingsPanel: function() {
            this.set("isDisplayingSettings", false);
        }
    }
});
