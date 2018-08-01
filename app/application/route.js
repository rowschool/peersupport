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
