import Ember from "ember";

export default Ember.Route.extend({
    setupController: function(controller, model) {
        var websocket = new WebSocket(SIGNALING_SERVER);

        websocket.onmessage = function(event) {
            var data = JSON.parse(event.data);
            if (data.isChannelPresent == false) {
                console.log("No room found.");
                console.log("Creating new room...");
                console.log("You can share following channel name with your friends:", roomname);

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

        controller.set("server", websocket);
    }
});
