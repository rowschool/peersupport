import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
    this.route("chat");
    this.route("verify", function() {});
    this.route('catch-all', { path: '*:' });
});

export default Router;
