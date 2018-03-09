function visualize(data) {
  console.log(data.num);
  WGL.init(data.num, '../../','map', true);

  // register movezoom event
  map.on("move", onMove);
  
  // resize window
  window.onresize = function(){
    WGL.getManager().updateMapSize();
    WGL.mcontroller.resize();
    $("#webglayer").css("display","none");
    onMove();
  };

  const heatmap = WGL.addHeatMapDimension(data.pts, 'heatmap');
  heatmap.radiusFunction = function (r, z) {
    return r*(z/10);
  };
  heatmap.setRadius(10);

  WGL.addExtentFilter();
  WGL.colorSchemes.setSchemeSelected('icy');

  let idt = WGL.addIdentifyDimension(data.pts, data.pts_id, 'idt', '../birmingham/data/identify/');
  idt.enabled = true;
  pw = new WGL.ui.PopupWin(".mapboxgl-canvas", "idt", "Accident Details");
  pw.setProp2html(function (t) {
    const d =  (new Date(t["timestamp"]*1000));
    const weekarray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri","Sat"];
    const wd = weekarray[d.getDate()];
    const sev = data.sevEnum[t["accident_severity"]-1];
    const rt = data.rtEnum[t["road_type"]];
    //speed_limit

    let s = "<table>";
    s += "<tr><td width='100px'>Date: </td><td>"+d.toDateString()+"</td></tr>";
    s += "<tr><td>Time: </td><td>"+d.toLocaleTimeString()+"</td></tr>";
    s += "<tr><td>Severity: </td><td>"+sev+"</td></tr>";
    s += "<tr><td>Road Type: </td><td>"+rt+"</td></tr>";
    s += "<tr><td>Speed Limit: </td><td>"+t["speed_limit"]+"</td></tr>";
    return s;
  });
  pw.setMovemap(function (dx, dy) {
    let c = map.getCenter();
    const cpx = map.project(c);
    cpx.x -= dx;
    cpx.y -= dy;
    map.setCenter(map.unproject(cpx));
  });
  map.on("move", function () {
    pw.zoommove(map.getZoom()+1, getTopLeftTC());
  });

  
  $("#webglayer").css("z-index","1");
  $("#webglayer").css("display","none");

  const layer = {
    "id": "canvas",
    "source": "canvas",
    "type": "raster",
    "paint": { 'raster-fade-duration': 0 }
  };

  const layers = map.getStyle().layers;
  // Find the index of the first symbol layer in the map style
  let firstSymbolId;
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].type === 'symbol') {
      firstSymbolId = layers[i].id;
      break;
    }
  }
  const map_source = {
    "type": 'canvas',
    "canvas": 'webglayer',
    "coordinates": [
      [-12, 60],
      [2, 60],
      [2, 50],
      [-12, 50]
    ],
    "animate": true
  };
  map.addSource("canvas", map_source);
  map.addLayer(layer, firstSymbolId);

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

  const proj = new SphericalMercator.SphericalMercator();
  const center_3857 = proj.forward([c.lng, c.lat]);

  return {
    x: (center_3857[0] - TL3857_ZERO.x)*ZERO_PIX_3857_COEF - dx,
    y: (-center_3857[1] + TL3857_ZERO.y)*ZERO_PIX_3857_COEF - dy
  };
}
	
function onMove() {
  const z = map.getZoom() + 1;
  WGL.mcontroller.zoommove(z, getTopLeftTC());
  modifyCanvasCor();
}

function modifyCanvasCor(){
  const b = map.getBounds();
  let cor = [];
  cor[0] = [b._sw.lng, b._ne.lat];
  cor[1] = [b._ne.lng, b._ne.lat];
  cor[2] = [b._ne.lng, b._sw.lat];
  cor[3] = [b._sw.lng, b._sw.lat];
  let canvas_source = map.getSource('canvas');
  canvas_source.setCoordinates(cor);
  canvas_source.play();
  canvas_source.prepare();
  canvas_source.pause();
}
	
	
	