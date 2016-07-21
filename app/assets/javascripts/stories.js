/**
 * Application entry point.
 */
require([
  'jquery',
  'underscore',
  'Class',
  'backbone',
  'mps',
  'jqueryujs',
  'jqueryui',
  'jquery_migrate',
  'jquery_fileupload',
  'geojson',
  'handlebars',
  '_string',
], function($, _, Class, Backbone, mps, jqueryujs, jqueryui, jquery_migrate, jquery_fileupload, geojson, Handlebars) {
  'use strict';

  var StoriesPage = Class.extend({

    $el: $('body'),

    init: function() {
      this._initViews();
    },

    /**
     * Initialize Landing Views.
     */
    _initViews: function() {
      //shared
      new HeaderView();
      new FooterView();
      new InterestingView();
      new SourceWindowView();
      new SourceMobileFriendlyView();
      new NotificationsView();

      new StoriesListView();
      new StoriesNewView();
      new StoriesLatestView();
      new CarrouselStoriesView();

    }
  });

  new StoriesPage();

});
