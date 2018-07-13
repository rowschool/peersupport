// var offerer = new RTCPeerConnection(iceServers);

import Ember from "ember";

export default Ember.Object.extend(RTCPeerConnection, {
    iceServers: null
});
