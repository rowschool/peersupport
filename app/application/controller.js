import Ember from 'ember';
import Names from "peersupport/static/names";

export default Ember.Controller.extend({
    rtcMultiConnection: Ember.computed(function() {
        return new RTCMultiConnection();
    }),

    messages: [],

    isShiftKeyPressed: false,

    username: Ember.computed({
        get: function() {
            var username = window.localStorage.getItem("username");

            return username;
        },
        set: function(key, value) {
            window.localStorage.setItem("username", value);
            return value;
        }
    }),

    roomname: Ember.computed({
        get: function() {
            var localName = window.localStorage.getItem("roomname");

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

    // getElement(selector) {
    //     return document.querySelector(selector);
    // },
    // getRandomColor() {
    //     var letters = '0123456789ABCDEF'.split('');
    //     var color = '#';
    //     for (var i = 0; i < 6; i++) {
    //         color += letters[Math.round(Math.random() * 15)];
    //     }
    //     return color;
    // },
    addNewMessage(options) {
        var messages = this.get("messages");

        messages.pushObject(options);

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

    init: function() {
        var roomname = Names.generateRoomname(),
            username = Names.generateUsername();

        this.set("roomname", roomname);
        this.set("username", username);
    },

    actions: {
        keyDown: function(event) {
            if (event.keyCode === 16) {
                this.set("isShiftKeyPressed", true);
            }
        },
        continue: function() {
            var rtcMultiConnection = this.get("rtcMultiConnection");
            var username = this.get("username") || "Anon";
            var roomName = this.get("roomname");

            if(!roomName.value || !roomName.value.length) {
                roomName.focus();
                return alert('Your MUST Enter Room Name!');
            }

            main.querySelector('#room-name').onkeyup();

            yourName.disabled = roomName.disabled = this.disabled = true;

            rtcMultiConnection.extra = {
                username: username,
                color: "red",
            };

            console.log('Searching for existing rooms...');

            // var roomid = main.querySelector('#room-name').value;

            rtcMultiConnection.channel = roomName;

            var websocket = new WebSocket(SIGNALING_SERVER);

            websocket.onmessage = function(event) {
                var data = JSON.parse(event.data);
                if (data.isChannelPresent == false) {
                    console.log('No room found. Creating new room...<br /><br />You can share following room-id with your friends: <input type=text value="' + roomname + '">',);

                    rtcMultiConnection.open();
                } else {
                    console.log('Room found. Joining the room...');

                    rtcMultiConnection.join(roomName);
                }
            };

            websocket.onopen = function() {
                websocket.send(JSON.stringify({
                    checkPresence: true,
                    channel: roomName
                }));
            };
        }
    }
});

// Event keycode 13 is "Enter"

// NOTE: Still need to implement.
// var numberOfKeys = 0;
// getElement('.main-input-box textarea').onkeyup = function(e) {
//     numberOfKeys++;
//     if (numberOfKeys > 3) numberOfKeys = 0;
//
//     if (!numberOfKeys) {
//         // 8 is backspace
//         if (e.keyCode === 8) {
//             return rtcMultiConnection.send({
//                 stoppedTyping: true
//             });
//         }
//
//         rtcMultiConnection.send({
//             typing: true
//         });
//     }
//
//     if (isShiftKeyPressed) {
//         if (e.keyCode == 16) {
//             isShiftKeyPressed = false;
//         }
//         return;
//     }
//
//
//     if (e.keyCode != 13) return;
//
//     addNewMessage({
//         header: rtcMultiConnection.extra.username,
//         message: 'Your Message:<br /><br />' + linkify(this.value),
//         userinfo: this.getUserinfo(rtcMultiConnection.blobURLs[rtcMultiConnection.userid], 'images/chat-message.png'),
//         color: rtcMultiConnection.extra.color
//     });
//
//     rtcMultiConnection.send(this.value);
//
//     this.value = '';
//
//     numberOfKeys = 0;
// }
