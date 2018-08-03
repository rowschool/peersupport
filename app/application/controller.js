import Ember from 'ember';

export default Ember.Controller.extend({
    rtcMultiConnection: Ember.computed(function() {
        return new RTCMultiConnection();
    })
});
