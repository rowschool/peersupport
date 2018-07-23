import WebrtcService from '../services/webrtc';

export default {
  name: 'setupWebrtcService',
  initialize: function (app) {
    app.register('service:webrtc', WebrtcService, {singleton: true, initialize: true});
  }
};
