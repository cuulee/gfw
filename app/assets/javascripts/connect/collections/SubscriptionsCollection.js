define([
  'backbone',
  'moment',
  'connect/models/SubscriptionModel'
], function(Backbone, moment, SubscriptionModel) {

  'use strict';

  var SubscriptionsCollection = Backbone.Collection.extend({
    model: SubscriptionModel,

    url: window.gfw.config.GFW_API_HOST_NEW_API + '/subscriptions',

    comparator: function(subscription) {
      return -moment(subscription.get('created')).unix()
    },

    sync: function(method, model, options) {
      options || (options = {});

      if (!options.crossDomain) {
        options.crossDomain = true;
      }

      if (!options.xhrFields) {
        options.xhrFields = {withCredentials:true};
      }

      return Backbone.sync.call(this, method, model, options);
    },

    parse: function(response) {
      return response.data;
    }

  });

  return Subscriptions;

});
