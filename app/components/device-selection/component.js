// import LoggerMixin from 'web-directory/mixins/logger'
import Ember from 'ember';
import layout from './template';

const {computed, Component, inject, run} = Ember;

export default Component.extend(/* LoggerMixin, */{
  layout: layout,
  classNameBindings: [':device-selection'],

  selectedCamera: Ember.computed("webrtc.cameraList.firstObject", {
      get: function() {
          // console.log("selectedCamera", this.get("webrtc.cameraList.firstObject"));
          return this.get("webrtc.cameraList.firstObject");
      },
      set: function(key, value) {
          // console.trace("value", value);
          return value;
          // debugger;
      }
  }),
  selectedMicrophone: null,
  selectedResolution: null,
  selectedOutputDevice: null,
  selectedFilter: null,

  audio: true,
  video: true,
  troubleshoot: true,
  outputDevice: true,
  resolution: true,

  webrtc: inject.service(),

  audioCallCapable: computed.reads('webrtc.audioCallCapable'),
  videoCallCapable: computed.reads('webrtc.videoCallCapable'),

  // TODO: remove this when we can get an event from intl about translations being loaded
  init () {
    this._super(...arguments);

    this.get('webrtc').enumerateDevices();
    this.get('webrtc').enumerateResolutions();
  },

  willDestroyElement () {
    this._super(...arguments);

    if (this.get('video')) {
      this.set('advancedOptions', null);
    }
  },

  selectedCameraId: computed.reads('selectedCamera.deviceId'),
  selectedResolutionId: computed.reads('selectedResolution.presetId'),
  selectedMicrophoneId: computed.reads('selectedMicrophone.deviceId'),
  selectedOutputDeviceId: computed.reads('selectedOutputDevice.deviceId'),

  showTroubleshoot: computed('troubleshoot', function () {
    return this.get('troubleshoot') && typeof this.attrs.openTroubleshoot === 'function';
  }),

  showResolutionPicker: computed('webrtc.resolutionList.length', 'webrtc.cameraList.length', 'video', 'resolution', function () {
    const webrtc = this.get('webrtc');
    return webrtc.get('resolutionList.length') && webrtc.get('cameraList.length') && this.get('video') && this.get('resolution');
  }),

  showOutputDevicePicker: computed('outputDevice', 'audio', function () {
    return this.get('outputDevice') && this.get('audio');
  }),

  actions: {
    openTroubleshoot () {
      if (typeof this.attrs.openTroubleshoot === 'function') {
        this.attrs.openTroubleshoot();
      }
    },

    changeCamera (id) {
      if (this.get('selectedCamera.deviceId') !== id) {
          this.set('selectedCamera', this.get('webrtc.cameraList').findBy('deviceId', id));
      }
    },

    changeMicrophone (id) {
      if (this.get('selectedMicrophone.deviceId') !== id) {
        this.set('selectedMicrophone', this.get('webrtc.microphoneList').findBy('deviceId', id));
      }
    },

    changeOutputDevice (id) {
      if (this.get('selectedOutputDevice.deviceId') !== id) {
        this.set('selectedOutputDevice', this.get('webrtc.outputDeviceList').findBy('deviceId', id));
      }
    },

    changeResolution (id) {
      if (this.get('selectedResolution.presetId') !== id) {
        this.set('selectedResolution', this.get('webrtc.resolutionList').findBy('presetId', id));
      }
    },

    changeFilter (filter) {
      this.set('selectedFilter', filter);
    }
  }
});
