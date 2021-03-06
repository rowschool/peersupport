import Ember from "ember";
import Names from "peersupport/static/names";

export default Ember.Controller.extend({
    rtcMultiConnection: null,
    messages: [],

    server: Ember.computed("rtcMultiConnection", "roomname", "roomname.length", function() {
        var rtcMultiConnection = this.get("rtcMultiConnection");
        var websocket = new WebSocket(SIGNALING_SERVER);
        var roomName = this.get("roomname");

        console.log("websocket", websocket);

        websocket.onmessage = function(event) {
            console.log("onmessage", event);
            var data = JSON.parse(event.data);
            if (data.isChannelPresent == false) {
                console.log("No room found.");
                console.log("Creating new room...");
                console.log("You can share following channel name with your friends:", roomName);

                rtcMultiConnection.open();
            } else {
                console.log("Room found. Joining the room...");

                rtcMultiConnection.join(roomName);
            }
        };

        websocket.onopen = function() {
            websocket.send(JSON.stringify({
                checkPresence: true,
                channel: roomName
            }));
        };

        return websocket;
    }),

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

    canDisplayChat: Ember.computed("username", "roomname", "server", function() {
        return !Ember.isEmpty(this.get("server")) && this.get("username") && this.get("roomname")
         && this.get("server").channel;
    }),
    activeServerHasNoUser: Ember.computed("username", "roomname", "server", function() {
        return !Ember.isEmpty(this.get("server")) && !this.get("username");
    }),

    roomname: Ember.computed("rtcMultiConnection", "rtcMultiConnection.channel", {
        get: function() {
            var localName = window.localStorage.getItem("roomname");

            if (localName) {
                return localName;
            }

            var rtcMultiConnection = this.get("rtcMultiConnection"),
                roomname = rtcMultiConnection.channel;
            window.localStorage.setItem("roomname", roomname);
            return roomname;
        },
        set: function(key, value) {
            window.localStorage.setItem("roomname", value);
            return value;
        }
    }),
    fieldsAreEmpty: Ember.computed("username", "username.length", "roomname", "roomname.length", function() {
        var username = this.get("username"),
            roomname = this.get("roomname");

        return !username || (username && username.length === 0) ||
                !roomname || (roomname && roomname.length === 0);
    }),

    addNewMessage(options) {
        var messages = this.get("messages");

        messages.pushObject(options);

        this.set("messages", messages);
    },

    isUsersContainerVisible: false,
    numberOfUsers: 1,

    isWebcamDisabled: true,
    isMicDisabled: true,
    isScreenSharingDisabled: true,
    isFileSharingDisabled: true,

    init: function() {
        var roomname = Names.generateRoomname(),
            username = Names.generateUsername(),
            rtcMultiConnection = new RTCMultiConnection(roomname);

        this.set("roomname", roomname);
        this.set("username", username);
        this.set("rtcMultiConnection", rtcMultiConnection);
    },

    actions: {
        continue: function() {
            var rtcMultiConnection = this.get("rtcMultiConnection");
            var username = this.get("username") || "Anon";
            var roomName = this.get("roomname");

            rtcMultiConnection.extra = {
                username: username,
                color: "red",
            };

            console.log("Searching for existing rooms...");

            Ember.set(rtcMultiConnection, "channel", roomName);

            // this.set("server", websocket);
            this.set("roomname", roomName);
        }
    }
});
