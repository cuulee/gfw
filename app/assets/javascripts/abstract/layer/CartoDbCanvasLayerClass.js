define([
  'moment',
  'abstract/layer/CanvasLayerClass', 'helpers/canvasCartoCSSHelper', 'map/services/CartoDbLayerService',
  'text!map/queries/default_cartodb_canvas.sql.hbs'
], function(
  moment,
  CanvasLayerClass, canvasCartoCSSHelper, CartoDbLayerService,
  SQL
)  {

  'use strict';

  var CartoDbCanvasLayerClass = CanvasLayerClass.extend({
    init: function(layer, options, map) {
      options = options || {};

      this.currentDate = options.currentDate ||
        [moment(layer.mindate || undefined), moment()];

      this._super(layer, options, map);
    },

    _getLayer: function() {
      var deferred = new $.Deferred();

      var configService = new CartoDbLayerService(
        this._getSQL(), this._getCartoCSS());

      var context = this;
      configService.fetchLayerConfig().then(function(config) {
        context.options.urlTemplate = 'https://' + config.cdn_url.https + '/wri-01/api/v1/map/' + config.layergroupid + '{/z}{/x}{/y}.png32';
        deferred.resolve(context);
      });

      return deferred.promise();
    },

    _getCartoCSS: function() {
      var startDate = moment('2015-01-01'),
          endDate = moment();

      return canvasCartoCSSHelper.generateDaily('date', startDate, endDate);
    },

    _getSQL: function() {
      var template = Handlebars.compile(SQL),
          sql = template({currentDate: this.options.currentDate});

      return sql;
    },

    filterCanvasImgdata: function() {
      throw('filterCanvasImgdata must be implemented');
    }

  });

  return CartoDbCanvasLayerClass;

});
