import Ember from "ember";
import IceServersHandler from "peersupport/models/ice-servers-handler";

export default Ember.Object.extend(RTCPeerConnection, {
    id: 1,
    iceTransportPolicy: "all",

    iceServers: Ember.computed("iceTransportPolicy", function() {
        var iceTransportPolicy = this.get("iceTransportPolicy");

        return {
            iceServers: IceServersHandler.getIceServers(),
            iceTransportPolicy: iceTransportPolicy,
            rtcpMuxPolicy: 'require',
            bundlePolicy: 'max-bundle'
        };
    }),
});
