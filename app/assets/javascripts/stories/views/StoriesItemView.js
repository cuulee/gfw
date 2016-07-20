define([
  'backbone', 'handlebars', 'underscore',
  'stories/helpers/StoryHelper',
  'text!stories/templates/story_item.handlebars'
], function(
  Backbone, Handlebars, _,
  StoryHelper,
  tpl
) {

  var StoriesItemView = Backbone.View.extend({

    tagName: 'li',
    className: 'm-list-story',

    template: Handlebars.compile(tpl),

    initialize: function(options) {
      this.story = options.story;
      this.render();
    },

    render: function() {
      var story = StoryHelper.decorateWithIconUrl(
        this.story.toJSON());
      this.$el.html(this.template({
        story: story,
      }));

      return this;
    }

  });

  return StoriesItemView;

});
