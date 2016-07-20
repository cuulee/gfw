define([
  'backbone', 'handlebars',
  'stories/collections/StoriesCollection',
  'stories/helpers/StoryHelper',
  'text!stories/templates/more_stories.handlebars'
], function(
  Backbone, Handlebars,
  StoriesCollection,
  StoryHelper,
  tpl
) {

  'use strict';

  var getRandomStories = function(arr) {
    var n = 3,
        result = new Array(n),
        len = arr.length,
        taken = new Array(len);

    if (n > len) { return arr; }

    while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len;
    }

    return result;
  };

  var MoreStoriesView = Backbone.View.extend({

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.stories = new StoriesCollection([], {perPage: 5});
      this.listenTo(this.stories, 'sync', this.render);
      this.stories.fetch();

      this.render();
    },

    render: function() {
      var stories = getRandomStories(this.stories.toJSON());
      stories = stories.map(function(story) {
        return StoryHelper.decorateWithIconUrl(story);
      });

      this.$el.html(this.template({stories: stories}));

      return this;
    }

  });

  return MoreStoriesView;

});
