import Ember from 'ember';

export function bytesToSize(params) {
    var bytes = params[0],
        k = 1000,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    if (bytes <= 0) {
        return '0 Bytes';
    }
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);

    if(!sizes[i]) {
        return '0 Bytes';
    }

    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

export default Ember.Helper.helper(bytesToSize);
