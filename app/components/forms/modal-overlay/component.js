import Ember from "ember";
import KeyboardBindings from "peersupport/mixins/keyboard-bindings";

export default Ember.Component.extend(KeyboardBindings, {
    classNames: ["modal-overlay-root"],

    keydownBindings: function(event) {
        switch (event.keyCode) {
            case (27): // Escape
                event.preventDefault();
                this.sendAction("close");
                break;
        }
    },

    actions: {
        close: function() {
            this.sendAction("close");
        }
    }
});
