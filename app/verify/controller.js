import Ember from 'ember';

export default Ember.Controller.extend({
  webrtc: Ember.inject.service(),
  actions: {
    openTroubleshoot () {
      alert('troubleshooting!'); // eslint-disable-line
    }
  }
});

// import Ember from "ember";
//
// export default Ember.Controller.extend({
//     offerer: null,
//     answerer: null,
// });
