import Ember from 'ember';

export default Ember.Route.extend({
    model: function(params) {
        return params.roomname;
    },
    setupController: function(controller, roomname) {
        if (roomname) {
            controller.set("roomname", roomname);
        }
    }
});

// TODO: RTCMultiConnection needs to return the video
// component value to the chat window for each individual user.
