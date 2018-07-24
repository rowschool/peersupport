import Ember from "ember";

export default Ember.Component.extend({
    classNameBindings: [":menu-selector", "fillWidth:full-width"],

    options: null,
    selectedValue: null,
    valueField: "value",

    menuOpen: false,
    titleCase: false,
    fillWidth:false,

    // Options can be in a few formats for easier use in diferent situations:
    // Comma separated (good for defining in templates):
    //     "sample1,sample2,sample3"
    // Array of strings (preferred form):
    //     ["sample1","sample2","sample3"]
    // Array of objects (when the value and display string need to be different):
    //     [{title: "sample1", value:"val1"},{title: "sample2", value:"val2"}]
    innerOptions: Ember.computed("options", "options.[]", "valueField", function () {
        var options = (this.get("options") || []),
            valueField = this.get("valueField");
        if (typeof(options) === "string") {
            options = options.split(",");
        }
        return options.map(function(option) {
            if (typeof(option) === "string") {
                return {title: option, value: option};
            } else if (Ember.isArray(option)) {

            } else if (typeof(option) === "object") {
                var optTitle = Ember.get(option, "title"),
                    optLabel = Ember.get(option, "label"),
                    optValue = Ember.get(option, valueField);

                return {
                    title: optTitle || optLabel || optValue,
                    value: Ember.isEmpty(optValue) ? optTitle : optValue,
                    description: option.description
                };
            }
        }).filter(function(option) { return option && !Ember.isEmpty(option.value); });
    }),

    selectedOption: Ember.computed("innerOptions", "innerOptions.[]", "selectedValue", "valueField", function () {
        var selectedValue = this.get("selectedValue"),
            options = this.get("innerOptions") || [],
            selectedOption = this.get("innerOptions").findBy(this.get("valueField"), selectedValue);
        // debugger;
        console.log("selectedValue", selectedValue)
        console.log("options", options);
        console.log("selectedOption", selectedOption);
        if (Ember.isEmpty(selectedOption) && options && options.length) {
            console.log("isEmpty", selectedOption);
            selectedOption = options[0];
            if (selectedOption) {
                Ember.run.scheduleOnce("afterRender", this, () => {
                    this.send("selectedValueChanged", selectedOption && selectedOption.value);
                });
            }
        }
        return selectedOption;
    }),

    actions: {
        openMenu: function() {
            this.toggleProperty("editorOpen");
        },
        closeMenu: function () {
            this.set("editorOpen", false);
        },
        selectedValueChanged: function(selection) {
            // console.trace("selectedValueChanged", selection);
            this.sendAction("changed", selection);
            this.set("editorOpen", false);
        }
    }
});
