require([
  'backbone',
  'stories/handlebarsHelpers',
  'views/HeaderView', 
  'views/FooterView',
  'stories/routers/StoriesRouter'
], function(
  Backbone,
  handlebarsHelpers,
  HeaderView, FooterView,
  StoriesRouter
) {

  'use strict';

  var StoriesPage = Class.extend({

    $el: $('body'),

    init: function() {
      var router = new StoriesRouter();
      handlebarsHelpers.register();
      this._initApp();
    },

    /**
     * Initialize the map by starting the history.
     */
    _initApp: function() {
      if (!Backbone.History.started) {
        Backbone.history.start({pushState: true});
      }
    },

  });

  new StoriesPage();
});
