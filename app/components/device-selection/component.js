// import LoggerMixin from 'web-directory/mixins/logger'
import Ember from 'ember';
import layout from './template';

const {computed, Component, inject, run} = Ember;

export default Component.extend(/* LoggerMixin, */{
  classNames: ["ps-device-selection"],
  layout: layout,

  selectedCamera: null,
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

  willDestroyElement () {
    this._super(...arguments);

    if (this.get('video')) {
      this.set('advancedOptions', null);
    }
  },

  selectedCameraId: computed.alias('selectedCamera.deviceId'),
  selectedResolutionId: computed.alias('selectedResolution.presetId'),
  selectedMicrophoneId: computed.alias('selectedMicrophone.deviceId'),
  selectedOutputDeviceId: computed.alias('selectedOutputDevice.deviceId'),

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
