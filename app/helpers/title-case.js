import Ember from 'ember';

export function titleCase(params, namedArgs) {
    if (!params[0] || !params[0].replace) {
        return params[0];
    }

    var maxLen = namedArgs.maxLength,
        elipse = namedArgs.elipse || '...',
        outputString = params[0] || '';

    if (maxLen) {
        outputString = outputString.replace(/^\s+|\s+$/g, "");
        outputString = outputString.replace(/(<([^>]+)>)/ig," ");
        outputString = Ember.$.trim(outputString);
        if(outputString.length > maxLen + 3) {
            outputString = Ember.$.trim(params[0].substring(0, maxLen)) + elipse;
        }
    }

    outputString = outputString.replace(/([^A-Z\s])([A-Z]+)/g, "$1 $2")
        .replace(/(\S)([A-Z][a-z])/g, "$1 $2")
        .replace(/_/g, ' ')
        .replace(/^./g, function(str) {
            return str.toUpperCase();
        })
        .replace(/(\s+.)/g, function(str) {
            return str.toUpperCase();
        });

    return outputString;
}

export default Ember.Helper.helper(titleCase);
