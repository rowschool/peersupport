import Ember from "ember";
import Translations from "peersupport/models/translations/en-us";

export function t(params) {
    var translations = Translations;
    return translations[Object.keys(translations)[0]][params[0].split(".")[1]];
}

export default Ember.Helper.helper(t);
