define([
 'backbone', 'moment', 'underscore'
], function(Backbone, moment, _) {

  'use strict';

  var MediaModel = Backbone.Model.extend({

    defaults: {
      order: 0
    }

  });

  return MediaModel;

});
