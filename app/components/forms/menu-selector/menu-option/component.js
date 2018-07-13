import Ember from "ember";

export default Ember.Component.extend({
    classNames: ["menu-selector-option"],

    option: null,
    selectedValue: null,
    titleCase: false,

    click: function () {
        this.sendAction("selectedValueChanged", this.get("option.value"));
        return false;
    }
});
