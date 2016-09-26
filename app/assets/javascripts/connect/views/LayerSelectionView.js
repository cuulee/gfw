/**
 * The CountrySelectionView view.
 *
 * @return CountrySelectionView view (extends Backbone.View)
 */
define([
  'underscore',
  'handlebars',
  'mps',
  'map/services/LayerSpecService',
  'map/services/CountryService',
  'text!connect/templates/countrySelection.handlebars',
  'text!connect/templates/layerSelection.handlebars',
], function(_, Handlebars, mps, LayerSpecService, CountryService, countryTpl, layerTpl) {

  'use strict';

  var CountrySelectionView = Backbone.View.extend({
    model: new (Backbone.Model.extend({
      country: null,
      layers: null,
    })),

    el: '#layer-selection',

    templateCountries: Handlebars.compile(countryTpl),
    templateLayers: Handlebars.compile(layerTpl),

    events: {
      'change .js-select-country' : 'onChangeCountry',
      'change .js-select-layer' : 'onChangeLayer',
    },

    initialize: function(map) {
      if (!this.$el.length) {
        return;
      }

      this.map = map;
      this.cache();
      this.listeners();

      // Load global layers
      LayerSpecService._getAllLayers(
        // Filter
        function(layer){
          return !layer.iso && !!layer.analyzable;
        }.bind(this),

        // Success
        function(layers){
          this.layers = _.groupBy(_.sortBy(layers, 'title'), 'category_name');
          this.renderLayers();
        }.bind(this),

        // Error
        function(error){
          console.log(error);
        }.bind(this)
      );

      // Load countries
      CountryService.get()
        .then(function(results) {
          this.countries = results.countries;
          this.renderCountries();
          this.renderCountryLayers();
        }.bind(this))

        .error(function(error) {
          console.log(error);
        }.bind(this))
    },

    listeners: function() {
      this.listenTo(this.model, 'change:country', this.changeCountry.bind(this));
      this.listenTo(this.model, 'change:layers', this.changeLayers.bind(this));
    },

    cache: function() {
      this.$layersField = this.$el.find('#layers-field');
      this.$layersCountryField = this.$el.find('#layers-country-field');
      this.$countryField = this.$el.find('#country-field');
    },


    /**
     * CHANGE EVENTS
    */
    changeCountry: function() {
      var country = this.model.get('country');

      LayerSpecService._getAllLayers(
        // Filter
        function(layer){
          return layer.iso == country && !!layer.analyzable;
        }.bind(this),

        // Success
        function(layers){
          this.countryLayers = _.groupBy(_.sortBy(layers, 'title'), 'category_name');
          this.renderCountryLayers();
        }.bind(this),

        // Error
        function(error){
          console.log(error);
        }.bind(this)
      );

    },

    changeLayers: function() {
      var layers = this.model.get('layers');
      var where = [{ slug: layers[0] }];

      LayerSpecService._removeAllLayers();

      LayerSpecService.toggle(where,
        function(layerSpec) {
          mps.publish('LayerNav/change', [layerSpec]);
          mps.publish('Place/update', [{go: false}]);
        }.bind(this));
    },


    /**
     * RENDERS
    */
    renderCountries: function() {
      // Filter to show only the countries that have layers
      LayerSpecService._getAllLayers(
        // Filter
        function(layer){
          return !!layer.iso && !!layer.analyzable;
        }.bind(this),

        // Success
        function(layers){
          var isos = _.uniq(_.pluck(layers, 'iso'));

          this.$countryField.html(this.templateCountries({
            name: 'Country layers',
            placeholder: 'Select a country',
            countries: _.filter(this.countries, function(country) {
              return (isos.indexOf(country.iso) != -1)
            })
          }));
          this.renderChosen();

        }.bind(this),

        // Error
        function(error){
          console.log(error);
        }.bind(this)
      );
    },

    renderLayers: function() {
      this.$layersField.html(this.templateLayers({
        name: 'Global layers',
        placeholder: 'Select a global layer',
        layers: this.layers,
        hint: 'After selecting a layer, please choose one shape of the map by clicking it (Please, send me this text. Miguel)'
      }));
      this.renderChosen();
    },

    renderCountryLayers: function() {
      this.$layersCountryField.html(this.templateLayers({
        name: '',
        placeholder: 'Select a country layer',
        layers: (!_.isEmpty(this.countryLayers)) ? this.countryLayers : null,
        hint: ''
      }));
      this.renderChosen();
    },

    renderChosen: function() {
      _.each(this.$el.find('select'), function(select){
        var $select = $(select);
        if (! !!$select.data('chosen')) {
          $select.chosen({
            width: '100%',
            disable_search: true,
            inherit_select_classes: true,
            no_results_text: "Oops, nothing found!"
          });
        }
      });
    },

    /**
     * UI EVENTS
     * - onChangeCountry
     * - onChangeLayer
    */
    onChangeCountry: function(e) {
      e && e.preventDefault();
      var country = $(e.currentTarget).val();
      this.model.set({
        country: country,
      });
    },

    onChangeLayer: function(e) {
      e && e.preventDefault();
      var layers = [$(e.currentTarget).val()];
      this.model.set({
        layers: _.clone(layers)
      });
    }
  });

  return CountrySelectionView;

});