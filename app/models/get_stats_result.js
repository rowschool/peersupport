import Ember from "ember";
// import RtcPeerConnection from "peersupport/models/rtc_peer_connection";



var systemNetworkType = ((navigator.connection || {}).type || 'unknown').toString().toLowerCase();
var noMore = function() {
    return true;
};

var getStatsResult = {
    encryption: 'sha-256',
    audio: {
        send: {
            tracks: [],
            codecs: [],
            availableBandwidth: 0,
            streams: 0
        },
        recv: {
            tracks: [],
            codecs: [],
            availableBandwidth: 0,
            streams: 0
        },
        bytesSent: 0,
        bytesReceived: 0
    },
    video: {
        send: {
            tracks: [],
            codecs: [],
            availableBandwidth: 0,
            streams: 0
        },
        recv: {
            tracks: [],
            codecs: [],
            availableBandwidth: 0,
            streams: 0
        },
        bytesSent: 0,
        bytesReceived: 0
    },
    bandwidth: {
        systemBandwidth: 0,
        sentPerSecond: 0,
        encodedPerSecond: 0,
        helper: {
            audioBytesSent: 0,
            videoBytestSent: 0
        },
        speed: 0
    },
    results: {},
    connectionType: {
        systemNetworkType: systemNetworkType,
        systemIpAddress: '192.168.1.2',
        local: {
            candidateType: [],
            transport: [],
            ipAddress: [],
            networkType: []
        },
        remote: {
            candidateType: [],
            transport: [],
            ipAddress: [],
            networkType: []
        }
    },
    resolutions: {
        send: {
            width: 0,
            height: 0
        },
        recv: {
            width: 0,
            height: 0
        }
    },
    internal: {
        audio: {
            send: {},
            recv: {}
        },
        video: {
            send: {},
            recv: {}
        },
        candidates: {}
    },
    nomore: noMore
};
