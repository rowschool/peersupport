import Ember from 'ember';

export function booleanToWord(params, hash) {
    var booleanValue = params[0],
        yesValue = hash && hash.yesValue || "Yes",
        noValue = hash && hash.noValue || "No";

    return booleanValue ? yesValue : noValue;
}

export default Ember.Helper.helper(booleanToWord);
