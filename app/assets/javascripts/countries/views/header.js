gfw.ui.model.CountryHeaderStatus = cdb.core.Model.extend({});

gfw.ui.model.layersOptions = Backbone.Model.extend({

  initialize: function(options) {
    options = options || {};

    var layers = {
      'forest2000': {
        url: 'http://earthengine.google.org/static/hansen_2013/tree_alpha/%z/%x/%y.png',
        dataMaxZoom: 12,
        tileSize: [256, 256],
        _filterCanvasImage: function(imageData, w, h) {
          var components = 4,
              pixelPos;

          for(var i = 0 ; i < w; ++i) {
            for(var j = 0; j < h; ++j) {
              var pixelPos = (j * w + i) * components,
                  intensity = imageData[pixelPos + 3];

              imageData[pixelPos] = 0;
              imageData[pixelPos + 1] = intensity * 0.7;
              imageData[pixelPos + 2] = 0;
              imageData[pixelPos+ 3] = intensity * 0.7;
            }
          }
        }
      }
    };

    var self = this,
        layer = layers[options.layer];

    if (layer) {
      _.each(layer, function(row, i) {
        self.set(i, row);
      })
    }
  },


});

gfw.ui.view.leafletCanvasLayer = Backbone.View.extend({

  initialize: function(options) {
    var self = this;
    options = options || {layerName: ''};

    this.layerOptions = new gfw.ui.model.layersOptions({layer: options.layerName});
    _.extend(this, this.layerOptions.toJSON());

    this.layer = L.tileLayer.canvas();

    this.layer.drawTile = function(canvas, tilePoint, zoom) {
      var xhr = new XMLHttpRequest(),
          ctx = canvas.getContext('2d');

      var x = tilePoint.x,
          y = tilePoint.y,
          z = zoom,
          mz = self.dataMaxZoom;

      if (zoom > mz) {
        x = Math.floor(x / (Math.pow(2, zoom - mz)));
        y = Math.floor(y / (Math.pow(2, zoom - mz)));
        z = mz;
      } else {
        y = (y > Math.pow(2, z) ? y % Math.pow(2,z) : y);
        if (x >= Math.pow(2, z)) {
          x = x % Math.pow(2, z);
        } else if (x < 0) {
          x = Math.pow(2,z) - Math.abs(x);
        }
      }
      
      var url = self.url.replace('%z', z).replace('%x', x).replace('%y', y);

      xhr.onload = function () {
        var url = URL.createObjectURL(this.response),
            image = new Image();

        image.onload = function () {
          image.crossOrigin = '';

          canvas.image = image;
          canvas.coord = {x: tilePoint.x, y: tilePoint.y};
          canvas.coord.z = zoom;

          self._drawImageCanvas(canvas);

          URL.revokeObjectURL(url);
        };

        image.src = url;
      };

      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.send();
    }
  },

  _filterCanvasImage: function(imageData, w, h) {
    var components = 4,
        pixelPos;

    for(var i = 0 ; i < w; ++i) {
      for(var j = 0; j < h; ++j) {
        var pixelPos = (j * w + i) * components,
            intensity = imageData[pixelPos + 3];

        imageData[pixelPos] = 0;
        imageData[pixelPos + 1] = intensity * 0.7;
        imageData[pixelPos + 2] = 255;
        imageData[pixelPos+ 3] = intensity * 0.7;
      }
    }
  },

  _drawImageCanvas: function(canvas) {
    var ctx = canvas.getContext('2d'),
        coord = canvas.coord;

    if (canvas.coord) {
      var zsteps = coord.z - this.dataMaxZoom;

      if (zsteps > 0) {
        ctx['imageSmoothingEnabled'] = false;
        ctx['mozImageSmoothingEnabled'] = false;
        ctx['webkitImageSmoothingEnabled'] = false;

        var srcX = 256 / Math.pow(2, zsteps) * (coord.x % Math.pow(2, zsteps)),
            srcY = 256 / Math.pow(2, zsteps) * (coord.y % Math.pow(2, zsteps)),
            srcW = 256 / Math.pow(2, zsteps),
            srcH = 256 / Math.pow(2, zsteps);
        ctx.drawImage(canvas.image, srcX, srcY, srcW, srcH, 0, 0, 256, 256);
      
      } else {
        try {
          ctx.drawImage(canvas.image, 0, 0);
        } catch(err) { }
      }

      var I = ctx.getImageData(0, 0, canvas.width, canvas.height);
      this._filterCanvasImage(I.data, canvas.width, canvas.height);
      ctx.putImageData(I, 0, 0);
    }
  },

  getLayer: function() {
    return this.layer;
  }

});

gfw.ui.view.CountryHeader = cdb.core.View.extend({

  el: $('.country-header'),

  events: {
    'change #areaSelector': '_onSelectArea',
    'click .selector-remove': '_navigateCountry'
  },

  initialize: function(options) {
    _.extend(this, options);
    var self = this;

    // Cache
    this.$areaSelector = this.$('#areaSelector');
    this.$selectorRemove =  this.$('.selector-remove');
    this.$map = this.$('.map');

    var Router = Backbone.Router.extend({
      routes: {
        'country/:id': 'loadCountry',
        'country/:id/': 'loadCountry',
        'country/:id/:areaId': 'loadArea',
        'country/:id/:areaId/': 'loadArea'
      },

      initialize: function() {
        self._drawLossAndGain();
      },

      loadArea: function(countryId, areaId) {
        var area = self.country.get('areas').where({ id_1: Number(areaId) })[0];
        self.area = area;
        if (!self.map) {
          self._setAreaSelector();
          self._initMap(function() {
            self._displayArea(area);
          });
        } else {
          self._displayArea(area);
        }
      },

      loadCountry: function(countryId) {
        if (!self.map) {
          self._setAreaSelector();
          self._initMap(function() {
            self._displayCountry();
          });
        } else {
          self._displayCountry();
        }
      }

    });

    this.country.fetch({
      success: function() {
        self.router = new Router();
        Backbone.history.start({pushState: true});
      }
    });
  },

  _setAreaSelector: function() {
    var self = this;

    _.each(this.country.get('areas').models, function(area) {
      if (self.area == area) {
        self.$areaSelector.append('<option value="' + area.get('name_1') + '" selected>' + area.get('name_1') + '</option>')
      } else {
        self.$areaSelector.append('<option value="' + area.get('name_1') + '">' + area.get('name_1') + '</option>')
      }
    });
  },

  _onSelectArea: function() {
    var self = this,
        areaName = this.$areaSelector.val(),
        area = this.country.get('areas').where({ name_1: areaName })[0];

    if (area) {
      this.router.navigate('country/' + this.country.get('iso') + '/' + String(area.get('id_1')), {trigger: true});
    } else {
      this._navigateCountry();
    }
  },

  _navigateCountry: function() {
    this.router.navigate('country/' + this.country.get('iso'), {trigger: true});
  },

  _initMap: function(callback) {
    var self = this,
        sql = new cartodb.SQL({ user: 'wri-01' });

    sql.execute("SELECT bounds FROM country_mask WHERE code = '" + this.country.get('iso')  + "'")
      .done(function(data) {
        var geojson = L.geoJson(JSON.parse(data.rows[0].bounds)),
            bounds = geojson.getBounds();
        
        self.country.set('bounds', bounds);
        self._renderMap(callback);
      });
  },

  _renderMap: function(callback) {
    var self = this;

    // Map & layers
    this.cartodbLayer = {};
    this.forestLayer = {};
    this.map = {};

    this.map = new L.Map('countryMap', {
      center: [0, 0],
      zoom: 3,
      zoomControl: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      attributionControl: false,
      zoomAnimation: false,
      fadeAnimation: false,
    });

    this.forestLayer = new gfw.ui.view.leafletCanvasLayer({
      layerName: 'forest2000'
    }).getLayer().addTo(this.map);

    // Set country layer
    cartodb.createLayer(this.map, {
      user_name: 'wri-01',
      type: 'cartodb',
      cartodb_logo: false,
      sublayers: [{
        sql: "SELECT * FROM country_mask"
      }, {
        sql: "SELECT * FROM gadm_1_all"
      }]
    })
    .addTo(this.map)
    .done(function(layer) {
      self.cartodbLayer = layer;
      self.cartodbLayer.on('loading' , function() {
        self.$map.removeClass('loaded');
        self.forestLayer.setOpacity(0);
      });

      self.cartodbLayer.on('load' , function() {
        self.$map.addClass('loaded');
        self.forestLayer.setOpacity(1);
      });
  
      self.cartodbLayer.on('tileload' , function() {
        // _.each(self.map._layers, function(layer) {
        //   console.log(layer._tilesToLoad);
        // });
      });

      callback();
    });
  },

  _displayCountry: function() {
    this.$selectorRemove.hide();
    this.$areaSelector.val('');
    this.map.fitBounds(this.country.get('bounds'));
    this.cartodbLayer.getSubLayer(1).hide();
    this.cartodbLayer.getSubLayer(0)
      .set({
        cartocss: "\
          #country_mask {\
            polygon-fill: #373442;\
            polygon-opacity: 1;\
            line-color: #373442;\
            line-width: 1;\
            line-opacity: 1;\
          }\
          #country_mask[code='" + this.country.get('iso') + "'] {\
            polygon-opacity: 0;\
            line-color: #73707D;\
            line-width: 1;\
            line-opacity: 1;\
          }"
      });
  },

  _displayArea: function(area) {
    this.$selectorRemove.show();
    this.map.fitBounds(area.get('bounds'), {reset: true});
    this.cartodbLayer.getSubLayer(1)
      .set({
        cartocss: "\
          #gadm_1_all {\
            polygon-fill: #373442;\
            polygon-opacity: 1;\
            line-color: #373442;\
            line-width: 1;\
            line-opacity: 1;\
            [cartodb_id=" + area.get('cartodb_id') + "]{\
              polygon-opacity: 0;\
            }\
            ::active[cartodb_id=" + area.get('cartodb_id') + "] {\
              polygon-opacity: 0;\
              line-color: #73707D;\
              line-width: 1;\
              line-opacity: 1;\
            }\
          }"
      })
      .show();

    this.cartodbLayer.getSubLayer(0)
      .set({
        cartocss: "\
          #country_mask {\
            polygon-fill: #373442;\
            polygon-opacity: 1;\
            line-color: #373442;\
            line-width: 1;\
            line-opacity: 1;\
          }\
          #country_mask[code='" + this.country.get('iso') + "'] {\
            polygon-opacity: 0;\
            line-color: #373442;\
            line-width: 1;\
            line-opacity: 1;\
          }"
      });
  },

  _drawLossAndGain: function() {
    var sql = "SELECT year, loss_gt_0 loss FROM umd WHERE iso='" + this.country.get('iso') + "' ORDER BY year ASC",
        that = this;

    var $graph = this.$('.loss-gain-graph'),
        $comingSoon = $graph.find('.coming-soon'),
        $amount = $graph.find('.graph-amount'),
        $date = $graph.find('.graph-date');

    var width     = 200,
        height    = 90,
        h         = 90, // maxHeight
        radius    = width / 2;

    var graph = d3.select('.loss-gain-graph .graph')
      .append('svg:svg')
      .attr('width', width)
      .attr('height', height);

    d3.json('https://wri-01.cartodb.com/api/v2/sql?q=' + sql, function(json) {
      if (json) {
        $graph.removeClass('ghost');
        var data = json.rows;
      } else {
        $comingSoon.show();
        return;
      }

      var data_ = [];

      _.each(data, function(val, key) {
        if (val.year >= 2001) {
          data_.push({
            'year': val.year,
            'value': val.loss//eval('val.' + options.dataset)
          });
        }
      });

      $amount.html('<span>' + formatNumber(parseInt(data_[data_.length - 1].value, 10)) + '</span>');
      $date.html('Hectares lost in ' + data_[data_.length - 1].year);

      var marginLeft = 5,
          marginTop = 0;

      var y_scale = d3.scale.linear()
        .domain([0, d3.max(data_, function(d) { return parseFloat(d.value); })])
        .range([height, marginTop * 2]);

      var barWidth = 16;

      var bar = graph.selectAll('g')
        .data(data_)
        .enter()
        .append('g')
        .attr('transform', function(d, i) { return 'translate(' + (marginLeft + i * barWidth) + ',' + -marginTop + ')'; });

      bar.append('svg:rect')
        .attr('class', 'bar')
        .attr('y', function(d) { return y_scale(d.value); })
        .attr('height', function(d) { return height - y_scale(d.value); })
        .attr('width', barWidth - 2)
        .style('fill', function(d, i) {
          if (i === 11) {
            return '#9FBA2B';
          } else {
            return '#524F5C';
          }
        })
        .on('mouseover', function(d) {
          d3.selectAll('.bar').style('fill', '#524F5C');
          d3.select(this).style('fill', '#9FBA2B');

          $amount.html('<span>' + formatNumber(parseInt(d.value, 10)) + '</span>');
          $date.html('Hectares lost in ' + d.year);
        });

      // Draw gain line
      var sql = 'SELECT y2001_y2012 as gain, (SELECT SUM(';

      for(var y = 2001; y < 2012; y++) {
        sql += 'y'+y+' + ';
      }

      sql += ['y2012) FROM countries_loss',
              "WHERE iso = '" + that.country.get('iso') + "') as loss",
              'FROM countries_gain',
              "WHERE iso = '" + that.country.get('iso') + "'"].join(' ');

      d3.json('https://wri-01.cartodb.com/api/v2/sql?q=' + encodeURIComponent(sql), function(json) {
        var gainAverage = json.rows[0].gain / 12;

        var tooltip = d3.select('.loss-gain-graph')
          .append('div')
          .attr('class', 'gain-tooltip')
          .style('visibility', 'hidden')
          .text(formatNumber(parseInt(gainAverage), 10));

        tooltip
          .append('span')
          .text('Average Ha of gain/year');

        var gainLine = graph.append('svg:rect')
          .attr('class', 'gain-line')
          .attr('x', 0)
          .attr('y', Math.abs(y_scale(gainAverage)))
          .attr('height', 1)
          .attr('width', width)
          .style('stroke', 'transparent')
          .style("stroke-width", "5")
          .style('fill', '#ccc');

        gainLine
          .on('mousemove', function() {
            d3.select('.gain-line')
              .style('height', 2)
              .style('fill', 'white');

            tooltip
              .style('visibility', 'visible')
              .style("top", Math.abs(y_scale(gainAverage)) + "px")
              .style("left", (d3.mouse(this)[0] - 58) + "px");
          })
          .on('mouseout', function() {
            d3.select('.gain-line')
              .style('height', 1)
              .style('fill', '#ccc');

            tooltip.style('visibility', 'hidden');
          })
      });

    });
  }

});