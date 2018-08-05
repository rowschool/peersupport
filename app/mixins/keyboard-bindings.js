import Ember from "ember";

export default Ember.Mixin.create({
  activeKeyboardModifiers:[],

  _modifiersStatic: {
    16: "shift",
    17: "ctrl",
    18: "alt",
    91: "host"
  },

  innerKeyDownCallback: function(event){
    var callback = this.get("keydownBindings");
    if(this._modifiersStatic.hasOwnProperty(event.keyCode)){
      this.activeKeyboardModifiers.push(this._modifiersStatic[event.keyCode]);
    }

    if(typeof callback === "function"){
      callback.bind(this)(event);
    }
  },

  innerKeyUpCallback: function (event) {
    var callback = this.get("keyupBindings");

    if(this._modifiersStatic.hasOwnProperty(event.keyCode)){
      var index = this.activeKeyboardModifiers.indexOf(this._modifiersStatic[event.keyCode]);
      if(index>-1){
        this.activeKeyboardModifiers.splice(index,1);
      }
    }

    if(typeof callback === "function"){
      callback.bind(this)(event);
    }
  },

  bind: function () {
    Ember.run.schedule('afterRender', this, function () {
      var body = document.getElementsByTagName("body")[0],
          hasEvents = body.onkeyup && body.onkeydown;

      if(hasEvents){
        console.warn("Overriding existing keybindings. Do not use multiple components utilizing the keyboard-bindings mixin on the same page.");
      }

      body.onkeydown = this.innerKeyDownCallback.bind(this);
      body.onkeyup = this.innerKeyUpCallback.bind(this);
    });
  }.on("init"),

  unbind: function(){
    var body = document.getElementsByTagName("body")[0];
    body.onkeydown = null;
    body.onkeyup = null;
  }.on("willDestroyElement")
});
