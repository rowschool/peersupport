import Ember from "ember";
import RtcPeerConnection from "peersuport/models/rtc_peer_connection";

export default Ember.Route.extend({
    setupController: function(controller, model) {
        var offerer = new RtcPeerConnection({
            id: 1,
            iceTransportPolicy: "all"
        });

        var answerer = new RtcPeerConnection({
            id: 1,
            iceTransportPolicy: "all"
        });

        controller.set("offerer", offerer);
        controller.set("answerer", answerer);
    }
});
