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

  const heatmap = WGL.addHeatMapDimension(data.pts, 'heatmap', 4);
  heatmap.radiusFunction = function (r, z) {
    return r*(z/10);
  };
  heatmap.setRadius(20);
  //heatmap.renderIllumination(true);

  // use normal distribution for values around point
  heatmap.gauss = true;

  const dotmap = WGL.addMapDimension(data.pts, 'themap');
  dotmap.setVisible(false);
  WGL.addPolyBrushFilter('themap','polybrush');


  WGL.addExtentFilter();
  WGL.colorSchemes.setSchemeSelected('gamma');

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

  const updatedraw = () => {
    const features = draw.getAll();
    if (features.features.length > 0){
      let polygons = [];
      features.features.forEach((f)=>{
        if (validity(f)){
          try{
            polygons[f.id] = geometryToPoly(f);
          }
          catch(e){

          }
        }
      });
      polygons.length = Object.keys(polygons).length;
      WGL.filterDim('themap','polybrush', polygons);

    }
    else{
      WGL.filterDim('themap','polybrush', []);
    }
    onMove();
  };

  map.on('draw.create', updatedraw);
  map.on('draw.delete', updatedraw);
  map.on('draw.update', updatedraw);
  map.on('draw.render', updatedraw);
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

function wgsToZeroLevel(pos){
  const proj = new SphericalMercator.SphericalMercator();
  const point = proj.forward(pos);
  const x = (point[0] + 20037508.34) / (20037508.34*2)*256;
  const y = -(point[1] - 20037508.34) / (20037508.34*2)*256;
  return {x: x, y: y}
}

function geometryToPoly(feature) {
  const geom = feature.geometry.coordinates[0];

  let poly_zero = [];
  for(let i = 0;i < geom.length-1; i++){
    poly_zero.push(wgsToZeroLevel(geom[i]));
  }
  // triangulate
  const ts = new poly2tri.SweepContext(poly_zero);
  ts.triangulate();
  return trianglesToArray(ts.getTriangles());
}

function trianglesToArray(trig) {
  let points = [];
  for ( let i in trig) {
    for ( let j in trig[i].points_) {
      points.push(trig[i].points_[j].x);
      points.push(trig[i].points_[j].y);
    }
  }
  return points;
}

function validity(feature){
  if (feature.geometry.coordinates.length === 0){
    return false;
  }
  const geom = feature.geometry.coordinates[0];
  if (geom.length > 3){
    for(let i = 1;i < geom.length-1; i++){
      if (geom[i][0] === geom[i-1][0] && geom[i][1] === geom[i-1][1]){
        return false;
      }
    }
    return true
  }
  return false;
}
	
	
	