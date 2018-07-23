import Ember from "ember";

const tHelper = Ember.Helper.extend({
  compute: (params) => params[0]
});

export function t(params) {
    return params[0];
}

export default Ember.Helper.helper(t);
