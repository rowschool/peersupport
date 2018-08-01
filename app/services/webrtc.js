// Services are singletons

import Ember from 'ember';
import DeviceEnumerationMixin from 'peersupport/mixins/device-enumeration';
import Translations from "peersupport/models/translations/en-us";

export default Ember.Service.extend(DeviceEnumerationMixin, {
    canListDevices: true,

    cameraList: Ember.A(),
    microphoneList: Ember.A(),
    outputDeviceList: Ember.A(),
    resolutionList: Ember.A(),

    lookup (key, hash) {
        var translations = Translations;
        var splitKey = key.split(".");

        while (splitKey.length) {
            if (typeof translations !== "object") {
                return undefined;
            }

            translations = translations[splitKey.shift()];
        }

        return translations;
    },

    init () {
      this._super(...arguments);
      window.webrtcService = this;

      // add RTCPeerConnection instance on init of this service
      // that pushes a connection object to the global window object
      // and you can access that service, every time it's instantiated,
      // from the window object and manipulate it

      // but how can we store that information safely?
      // Solve this problem by creating a namespace unique to your application.
      // The easiest approach is to create a global object with a unique name, with your variables
      // as properties of that object:
      // window.peersupport
      // has the properties
      // peers: []
      // which is in the webrtc service object
      // ... there is also window.localStorage and .sessionStorage

      // Another approach is to use .data() to attach variables to a relevant DOM element.
      // This is not practical in all cases, but it's a good way to get variables that can be accessed
      // globally without leaving them in the global namespace.
      // Create a video tag or whatever with "rtc-peer-connection-#" as a class
    }
});
