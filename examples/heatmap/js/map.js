
var	wgs = new OpenLayers.Projection("EPSG:4326"); // Transform from WGS 1984
var merc = new OpenLayers.Projection("EPSG:900913");
	
initMap = function() {

	var	wgs = new OpenLayers.Projection("EPSG:4326"); // Transform from WGS 1984
	var merc = new OpenLayers.Projection("EPSG:900913");
	var options = {
		units : 'm',
		projection : "EPSG:900913",
		zoomMethod: null
	};
	
	map = new OpenLayers.Map('map', options);
	 map.events.register('updatesize', map, 
			  function(){
		 		//initGLDimensions();	
		 		WGL.getManager().updateMapSize();
		 		WGL.mcontroller.resize();	
		 		//WGL.render();
		 		//WGL.mcontroller.resize(div.offsetWidth, div.offsetHeight);
		 		WGL.mcontroller.zoommove(map.zoom, getTopLeftTC());		 		
		 		
			  }) ;
	 
	  
	 var layer = new  OpenLayers.Layer.OSM('osm', 'http://${s}.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png', {});

    map.addLayer(layer);
    
	


	var lonlat = new OpenLayers.LonLat(-1.9,52.5).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
	map.setCenter(lonlat);
	map.zoomTo(11);
}


function transform(x, y) {
	var tl = getTopLeftTC();
	var p = new OpenLayers.LonLat(y, x);
	p.transform(wgs, map.projection);
	var v = map.getViewPortPxFromLonLat(p);
	
	var v0 = toLevel0(v, tl, map.getZoom());
	return v0;
}
function toLevel0(pt, tl, zoom) {
	ts = 256;
	scale = Math.pow(2, zoom);
	pt.x = pt.x / scale + tl.x;
	pt.y = pt.y / scale + tl.y;
	return pt;
}