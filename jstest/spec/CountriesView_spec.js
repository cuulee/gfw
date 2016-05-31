define([
  'underscore', 'backbone', 'moment', 'jquery',
  'map/views/tabs/CountriesView',
], function(_, Backbone, moment, $, LayersCountryView) {

  describe('LayersCountryView', function() {

    describe('.toggleSelected', function() {

      describe('given a list of country layers', function() {

        describe('a layer without wrappers', function() {

          describe('if the layer is selected', function() {
            var $el = $('<div><li data-layer="miguel"><span class="onoffswitch"></span></li></div>');

            var countryLayers = [{
                slug: 'miguel',
                wrappers: false,
                title_color: 'hats'
            }];

            var layers = {
              miguel: {}
            };

            var context = {
              model: new (Backbone.Model.extend({}))({countryLayers: countryLayers}),
              $el: $el
            };

            it('applies a selected class to the matching DOM element', function() {
              LayersCountryView.prototype._toggleSelected.call(context, layers);
              expect($el.find('li').hasClass('selected')).toBe(true);
              expect($el.find('span').hasClass('checked')).toBe(true);
            });

            it('applies a background colour to the toggle buttons', function() {
              LayersCountryView.prototype._toggleSelected.call(context, layers);
              expect($el.find('span').css('background')).toBe('hats');
            }
          });

        });

      });

    });

  });

});
