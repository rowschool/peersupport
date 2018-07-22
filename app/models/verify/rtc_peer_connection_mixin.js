import Ember from "ember";

var RtcPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;

export default new RtcPeerConnection();
