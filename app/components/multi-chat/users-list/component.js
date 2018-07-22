import Ember from "ember";

export default Ember.Component.extend({
    isUsersContainerVisible: false,
    numberOfUsers: 1,

    isWebcamDisabled: true,
    isMicDisabled: true,
    isScreenSharingDisabled: true,
    isFileSharingDisabled: true,

    fireClickEvent: function(element) {
        var evt = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });

        element.dispatchEvent(evt);
    },

    actions: {
        selectUsersList: function() {
            this.toggleProperty("isUsersContainerVisible");
            this.set("isUsersContainerVisible", true);
        },
        toggleWebcam: function() {
            this.set("isWebcamDisabled", false);
            // var session = { audio: true, video: true };
            //
            // rtcMultiConnection.captureUserMedia(function(stream) {
            //     var streamid = rtcMultiConnection.token();
            //     rtcMultiConnection.customStreams[streamid] = stream;
            //
            //     rtcMultiConnection.sendMessage({
            //         hasCamera: true,
            //         streamid: streamid,
            //         session: session
            //     });
            // }, session);
        },
        toggleMic: function() {
            this.set("isMicDisabled", false);
            // var session = { audio: true };
            //
            // rtcMultiConnection.captureUserMedia(function(stream) {
            //     var streamid = rtcMultiConnection.token();
            //     rtcMultiConnection.customStreams[streamid] = stream;
            //
            //     rtcMultiConnection.sendMessage({
            //         hasMic: true,
            //         streamid: streamid,
            //         session: session
            //     });
            // }, session);
        },
        toggleScreenSharing: function() {
            this.set("isScreenSharingDisabled", false);
            // var session = { screen: true };
            //
            // rtcMultiConnection.captureUserMedia(function(stream) {
            //     var streamid = rtcMultiConnection.token();
            //     rtcMultiConnection.customStreams[streamid] = stream;
            //
            //     rtcMultiConnection.sendMessage({
            //         hasScreen: true,
            //         streamid: streamid,
            //         session: session
            //     });
            // }, session);
        },
        toggleFileSharing: function() {
            // var file = document.createElement('input');
            // file.type = 'file';
            //
            // file.onchange = function() {
            //     rtcMultiConnection.send(this.files[0]);
            // };
            //
            // this.fireClickEvent(file);
        }
    }
});
