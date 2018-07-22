import Ember from "ember";

export default Ember.Component.extend({
    isUsersContainerVisible: false,
    numberOfUsers: 1,

    actions: {
        selectUsersList: function() {
            this.toggleProperty("isUsersContainerVisible");
            this.set("isUsersContainerVisible", true);
        }
    }
});
