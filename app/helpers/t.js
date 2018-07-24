import Ember from "ember";
import Translations from "peersupport/models/translations/en-us";

export function t(params) {
    var translations = Translations;
    var splitKey = params[0].split(".");

    while (splitKey.length) {
        if (typeof translations !== "object") {
            return undefined;
        }

        translations = translations[splitKey.shift()];
    }

    return translations;
}

export default Ember.Helper.helper(t);
