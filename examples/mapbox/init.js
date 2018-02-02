function visualize(data) {
  console.log(data.num);
  WGL.init(data.num, '../../', 'map');

  // register movezoom event
  map.on("move", onMove);

  var heatmap = WGL.addHeatMapDimension(data.pts, 'heatmap');
  heatmap.radiusFunction = function (r, z) {
    return r*(z/10);
  };

  heatmap.setRadius(15);

  WGL.addExtentFilter();
  WGL.colorSchemes.setSchemeSelected('fire');
  onMove();
}

/**
 * Compute coordinates of top-left conner in zero level pixel
 * for MapBox JS GL API
 * Note: zoom = mapbox_zoom + 1 !!!!
 * @returns {{x: number, y: number}}
 */
function getTopLeftTC() {
  const ZERO_PIX_3857_COEF = 128/20037508.34;
  const z = map.getZoom() + 1;
  const scale = Math.pow(2, z);
  const dx = WGL.getManager().w/2/scale;
  const dy = WGL.getManager().h/2/scale;

  const TL3857_ZERO = {x: -20037508.34, y: 20037508.34};
  const c = map.getCenter();

  const proj = new SphericalMercator();
  const center_3857 = proj.forward([c.lng, c.lat]);

  return {
    x: (center_3857[0] - TL3857_ZERO.x)*ZERO_PIX_3857_COEF - dx,
    y: (-center_3857[1] + TL3857_ZERO.y)*ZERO_PIX_3857_COEF - dy
  };
}
	
function onMove() {
    var z = map.getZoom() + 1;
		WGL.mcontroller.zoommove(z, getTopLeftTC());
}
	
	
	