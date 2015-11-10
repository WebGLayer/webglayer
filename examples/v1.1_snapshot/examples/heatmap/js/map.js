
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
		 		WGL.mcontroller.manager.updateMapSize();
		 		WGL.mcontroller.resize();	
		 		//WGL.render();
		 		//WGL.mcontroller.resize(div.offsetWidth, div.offsetHeight);
		 		WGL.mcontroller.zoommove(map.zoom, getTopLeftTC());		 		
		 		
			  }) ;
	 
	  
    var layer = new OpenLayers.Layer.OSM('', null, {
        eventListeners: {
            tileloaded: function(evt) {
                var ctx = evt.tile.getCanvasContext();
                if (ctx) {
                    var imgd = ctx.getImageData(0, 0, evt.tile.size.w, evt.tile.size.h);
                    var pix = imgd.data;
                    for (var i = 0, n = pix.length; i < n; i += 4) {
                        pix[i] = pix[i + 1] = pix[i + 2] = (3 * pix[i] + 4 * pix[i + 1] + pix[i + 2]) / 25;                    }
                    ctx.putImageData(imgd, 0, 0);
                    evt.tile.imgDiv.removeAttribute("crossorigin");
                    evt.tile.imgDiv.src = ctx.canvas.toDataURL();
                }
            }
        }
    });

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