/**
 * The RaisgLayer layer module.
 *
 * @return RaisgLayer class (extends WMSLayerClass)
 */
define([
  'uri',
  'abstract/layer/WMSLayerClass',
], function(UriTemplate, WMSLayerClass) {

  'use strict';

  var wmsUrl = 'https://geo.socioambiental.org/arcgis/services/raisg/raisg_tis/MapServer/WMSServer?';
    wmsUrl += '&SERVICE=WMS';
    wmsUrl += '&REQUEST=GetMap';
    wmsUrl += '&VERSION=1.1.1';
    wmsUrl += '&LAYERS=0';
    wmsUrl += '&STYLES=polygonSymbolizer';
    wmsUrl += '&FORMAT=image%2Fpng';
    wmsUrl += '&TRANSPARENT=true';
    wmsUrl += '&HEIGHT=256';
    wmsUrl += '&WIDTH=256';
    wmsUrl += '&SLD=http://gfw-nav.herokuapp.com/assets/map/cartocss/polygon_polygonSymbolizer.xml';
    wmsUrl += '&SRS=EPSG%3A3857';


  var wmsInfowindowUrl = 'https://geo.socioambiental.org/arcgis/rest/services/raisg/raisg_tis/MapServer/3/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=tis.pais,tis.categoria,tis.nombre,tis.status,tis.etnias,tis.no_habitantes,tis.fuente_data_habitantes,tis.norma,tis.fecha_norma,tis.fecha_ultima_atualizacion_norma,tis.area_oficial_ha,tis.institucionraisg,tis.fuente,tis.fecha_atualizacion_dato,tis.leyenda,tis.codigo_tis&geometryType=esriGeometryPoint&geometry={longitude},{latitude}';


  var RaisgLayer = WMSLayerClass.extend({

    options: {
      url: wmsUrl,
      infowindowUrl: wmsInfowindowUrl,
    },

    getQuery: function(_longitude, _latitude, _bbox) {
      return new UriTemplate(wmsInfowindowUrl)
        .fillFromObject({ longitude: _longitude, latitude: _latitude});
    }


  });

  return RaisgLayer;

});
