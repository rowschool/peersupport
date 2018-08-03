import Ember from 'ember';

export default Ember.Route.extend({
    webrtc: Ember.inject.service(),
    beforeModel () {
        Ember.run.next(this, function () {
            window.navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
            }).then((stream) => {
                stream.getTracks().forEach((t) => t.stop());
                this.get('webrtc').enumerateDevices();
            });
        });
    }
});

// import Ember from "ember";
// import RtcPeerConnection from "peersupport/models/verify/rtc_peer_connection";
//
// export default Ember.Route.extend({
//     setupController: function(controller, model) {
//         var offerer = new RtcPeerConnection({
//             id: 1
//         }),
//         answerer = new RtcPeerConnection({
//             id: 2
//         });
//
//         // var offerer, answerer;
//
//         controller.set("offerer", offerer);
//         controller.set("answerer", answerer);
//     }
// });
