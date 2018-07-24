import Ember from 'ember';
import DeviceEnumerationMixin from 'peersupport/mixins/device-enumeration';
import Translations from "peersupport/models/translations/en-us";

export default Ember.Service.extend(DeviceEnumerationMixin, {
  intl: Ember.inject.service(),

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
  }
});
