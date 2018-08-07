import Ember from "ember";

export default Ember.Component.extend({
    // TODO: Make query params contain the channel name.
    // Detect as if going through submit action if URL with query param is passed in
    // Force username if not previously existing

    classNames: ["chat-window"],

    rtcMultiConnection: null,
    roomname: "",

    numberOfUsers: 1,

    isWebcamDisabled: true,
    isMicDisabled: true,
    isScreenSharingDisabled: true,
    isFileSharingDisabled: true,

    newMessageValue: null,
    messages: [],

    // getUserinfo: function(blobURL, imageURL) {
    //     return blobURL ? `<video src=${blobURL} autoplay controls></video>` : `<img src="${imageURL}">`;
    // },

    actions: {
        scrollMessages: function(event) {
            Ember.$(".chat-window-messages").scrollTop(Ember.$(".chat-window-messages").height());
        },
        sendMessage: function(event) {
            var rtcMultiConnection = this.get("rtcMultiConnection");
            var isShiftKeyPressed = this.get("isShiftKeyPressed");
            var newMessageValue = this.get("newMessageValue")

            if (event.keyCode === 8) {
                rtcMultiConnection.send({
                    stoppedTyping: true
                });
            }

            if (this.get("newMessageValue.length") > 3) {
                rtcMultiConnection.send({
                    typing: true
                });
            }

            // event keycode 13 is "Enter"
            if (event.keyCode === 13) {
                debugger;
                var newMessage = {
                    header: rtcMultiConnection.extra.username,
                    message: window.linkify(newMessageValue),
                    // userinfo: this.getUserinfo(rtcMultiConnection.blobURLs[rtcMultiConnection.userid], "images/chat-message.png")
                }

                var messages = this.get("messages");
                messages.pushObject(newMessage);
                this.set("messages", messages);

                rtcMultiConnection.send(newMessageValue);

                this.set("newMessageValue", "");
            }
        },

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
        selectUsersList: function() {
            var rtcMultiConnection = this.get("rtcMultiConnection");
            // TODO: Fetch all user webcams and shared screens.
            // Then fix getUserinfo method in this controller.
            // debugger;
        },
        toggleDisplaySettings: function() {
            this.toggleProperty("isDisplayingSettings");
        },
        closeSettingsPanel: function() {
            this.set("isDisplayingSettings", false);
        }
    }
});
