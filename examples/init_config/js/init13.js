function init() {
  initMap();
 const conf = new WGL.ui.Config("app.json", '../../', 'map', "right");
 conf.load();
  map.events.register("move", map, onMove);
  WGL.mcontroller.zoommove(map.getZoom(), getTopLeftTC());
}
	
function getTopLeftTC() {

	var tlwgs = (new OpenLayers.LonLat(-180, 90)).transform(
			new OpenLayers.Projection("EPSG:4326"),
		 	new OpenLayers.Projection("EPSG:900913"));
	
	var s = Math.pow(2, map.getZoom());
	tlpixel = map.getViewPortPxFromLonLat(tlwgs);
	res = {
			x : -tlpixel.x / s,
			y : -tlpixel.y / s
	}
	//console.log(res);
	return res;
}
	
function onMove() {
		WGL.mcontroller.zoommove(map.getZoom(), getTopLeftTC(), WGL.filterByExt);
}