import Ember from "ember";
import Languages from "peersupport/static/languages";

export default Ember.Component.extend({
    rtcMultiConnection: null,

    isDisplayingSettings: false,
    languageOptions: Languages,
    devices: null,
    audioDeviceOptions: Ember.computed.alias("devices.audioDevices"),
    videoDeviceOptions: Ember.computed.alias("devices.videoDevices"),

    selectedAudioDevice: null,
    selectedVideoDevice: null,

    autoTranslateText: true,
    selectedLanguage: "en",
    audioBandwidth: 50,
    videoBandwidth: 256,
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true,
    IceRestart: false,
    videoWidth: 640,
    videoHeight: 360,
    preferSctp: true,
    chunkSize: 15000,
    chunkInterval: 100,
    skipRTCMultiConnectionLogs: false,
    maxParticipantsAllowed: 256,
    preferStun: true,
    preferTurn: true,
    preferHost: true,
    dataChannelDict: {
        ordered: true
    },
    fakePeerConnection: false,

    didInsertElement: function() {
        var d = {
            audioDevices: [],
            videoDevices: []
        };

        rtcMultiConnection.getDevices(function(devices) {
            for (var device in devices) {
                device = devices[device];

                var item = {
                    value: device.id,
                    label: device.label || device.id
                };

                if (device.kind === "audio") {
                    d.audioDevices.push(item);
                } else {
                    d.videoDevices.push(item);
                }
            }
        });

        this.set("devices", d);
    },

    actions: {
        toggleDisplaySettings: function() {
            this.toggleProperty("isDisplayingSettings");
        },
        selectedLanguageChanged: function(value) {
            this.set("selectedLanguage", value);
        },
        selectedAudioDeviceChanged: function(value) {
            this.set("selectedAudioDevice", value);
        },
        selectedVideoDeviceChanged: function(value) {
            this.set("selectedVideoDevice", value);
        },
        saveSettings: function() {
            var rtcMultiConnection = this.get("rtcMultiConnection");

            if (this.get("autoTranslateText")) {
                rtcMultiConnection.autoTranslateText = true;
                rtcMultiConnection.language = this.get("selectedLanguage");
            } else {
                rtcMultiConnection.autoTranslateText = false;
            }

            rtcMultiConnection.bandwidth.audio = this.get("audioBandwidth");
            rtcMultiConnection.bandwidth.video = this.get("videoBandwidth");

            rtcMultiConnection.sdpConstraints.mandatory = {
                OfferToReceiveAudio: this.get("OfferToReceiveAudio"),
                OfferToReceiveVideo: this.get("OfferToReceiveVideo"),
                IceRestart: this.get("IceRestart"),
            };


            var videWidth = this.get("videoWidth");
            var videHeight = this.get("videoHeight");
            rtcMultiConnection.mediaConstraints.mandatory = {
                minWidth: videWidth,
                maxWidth: videWidth,
                minHeight: videHeight,
                maxHeight: videHeight
            };

            rtcMultiConnection.preferSCTP = this.get("preferSctp");
            rtcMultiConnection.chunkSize = this.get("chunkSize");
            rtcMultiConnection.chunkInterval = this.get("chunkInterval");

            window.skipRTCMultiConnectionLogs = this.get("skipRTCMultiConnectionLogs");
            // rtcMultiConnection.selectDevices(getElement('#audio-devices').value, getElement('#video-devices').value);

            rtcMultiConnection.maxParticipantsAllowed = this.get("maxParticipantsAllowed");
            rtcMultiConnection.candidates = {
                relay: this.get("preferStun"),
                reflexive: this.get("preferTurn"),
                host: this.get("preferHost")
            };

            rtcMultiConnection.dataChannelDict = eval(this.get("dataChannelDict"));

            if (this.get("fakePeerConnection")) {
                // http://www.rtcmulticonnection.org/docs/fakeDataChannels/
                rtcMultiConnection.fakeDataChannels = true;
                rtcMultiConnection.session = {};
            }

            this.set("isDisplayingSettings", false);
            this.sendAction("saveSettings")
        }
    }
});
