import Ember from "ember";

export default Ember.Component.extend({
    // TODO: Make query params contain the channel name.

    classNames: ["chat-window"],

    rtcMultiConnection: null,
    isShiftKeyPressed: false,

    numberOfUsers: 1,

    isWebcamDisabled: true,
    isMicDisabled: true,
    isScreenSharingDisabled: true,
    isFileSharingDisabled: true,

    numberOfKeys: 0,
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
            var numberOfKeys = this.get("numberOfKeys") + 1;
            var newMessageValue = this.get("newMessageValue")

            if (this.get("numberOfKeys") > 3) {
                this.set("numberOfKeys", 0);
            }

            if (!numberOfKeys) {
                if (event.keyCode === 8) {
                    rtcMultiConnection.send({
                        stoppedTyping: true
                    });

                    rtcMultiConnection.send({
                        typing: true
                    });
                }
            }

            if (isShiftKeyPressed) {
                if (event.keyCode === 16) {
                    this.set("isShiftKeyPressed", false); // send action too?
                }
            }

            this.set("numberOfKeys", numberOfKeys);

            // event keycode 13 is "Enter"
            if (event.keyCode !== 13) {
                return;
            } else {
                // debugger;
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
                this.set("numberOfKeys", 0);

                // element.scrollTop = element.scrollHeight;
                // debugger;
                // Ember.$.(".chat-window-messages")


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
        toggleDisplaySettings: function() {
            this.toggleProperty("isDisplayingSettings");
        },
        closeSettingsPanel: function() {
            this.set("isDisplayingSettings", false);
        }
    }
});
