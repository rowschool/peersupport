import Ember from "ember";

export default Ember.Controller.extend({
    messages: [],

    isShiftKeyPressed: false,

    roomname: Ember.computed({
        get: function() {
            var localName = window.localSotrage.getItem("roomname");

            if (localName) {
                return localName;
            }

            var roomname = (Math.random() * 1000).toString().replace('.', '');
            window.localStorage.setItem("roomname", roomname);
            return roomname;
        },
        set: function(key, value) {
            window.localStorage.setItem("roomname", value);
            return value;
        }
    }),

    getElement(selector) {
        return document.querySelector(selector);
    },
    getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.round(Math.random() * 15)];
        }
        return color;
    },
    addNewMessage(args) {
        var messages = this.get("messages");

        messages.pushObject(args);

        this.set("messages", messages);
    },
    getUserinfo(blobURL, imageURL) {
        return blobURL ? '<video src="' + blobURL + '" autoplay controls></video>' : '<img src="' + imageURL + '">';
    },
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
        },
        continue: function() {
            var yourName = this.parentNode.querySelector('#your-name');
            var roomName = this.parentNode.querySelector('#room-name');

            if(!roomName.value || !roomName.value.length) {
                roomName.focus();
                return alert('Your MUST Enter Room Name!');
            }

            main.querySelector('#room-name').onkeyup();

            yourName.disabled = roomName.disabled = this.disabled = true;

            var username = yourName.value || 'Anonymous';

            rtcMultiConnection.extra = {
                username: username,
                color: getRandomColor()
            };

            addNewMessage({
                header: username,
                message: 'Searching for existing rooms...',
                userinfo: '<img src="images/action-needed.png">'
            });

            var roomid = main.querySelector('#room-name').value;
            rtcMultiConnection.channel = roomid;

            var websocket = new WebSocket(SIGNALING_SERVER);
            websocket.onmessage = function(event) {
                var data = JSON.parse(event.data);
                if (data.isChannelPresent == false) {
                    addNewMessage({
                        header: username,
                        message: 'No room found. Creating new room...<br /><br />You can share following room-id with your friends: <input type=text value="' + roomid + '">',
                        userinfo: '<img src="images/action-needed.png">'
                    });

                    rtcMultiConnection.open();
                } else {
                    addNewMessage({
                        header: username,
                        message: 'Room found. Joining the room...',
                        userinfo: '<img src="images/action-needed.png">'
                    });
                    rtcMultiConnection.join(roomid);
                }
            };
            websocket.onopen = function() {
                websocket.send(JSON.stringify({
                    checkPresence: true,
                    channel: roomid
                }));
            };
        }
    }
});

// Event keycode 13 is "Enter"

getElement('.main-input-box textarea').onkeydown = function(e) {
    if (e.keyCode == 16) {
        isShiftKeyPressed = true;
    }
};

var numberOfKeys = 0;
getElement('.main-input-box textarea').onkeyup = function(e) {
    numberOfKeys++;
    if (numberOfKeys > 3) numberOfKeys = 0;

    if (!numberOfKeys) {
        if (e.keyCode == 8) {
            return rtcMultiConnection.send({
                stoppedTyping: true
            });
        }

        rtcMultiConnection.send({
            typing: true
        });
    }

    if (isShiftKeyPressed) {
        if (e.keyCode == 16) {
            isShiftKeyPressed = false;
        }
        return;
    }


    if (e.keyCode != 13) return;

    addNewMessage({
        header: rtcMultiConnection.extra.username,
        message: 'Your Message:<br /><br />' + linkify(this.value),
        userinfo: getUserinfo(rtcMultiConnection.blobURLs[rtcMultiConnection.userid], 'images/chat-message.png'),
        color: rtcMultiConnection.extra.color
    });

    rtcMultiConnection.send(this.value);

    this.value = '';
}
