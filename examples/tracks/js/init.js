	
function init() { 
		/*Initialize the map*/
		initMap();
		
		/*Load the data*/
		var data = new DataLoader();
		//data.loadPosData("data/birmin_3a.json");
		//data.loadPosData("data/test.json");
		//data.loadPosData("data/testf1k.json");
		data.loadPosData("data/f50k.json");
		
		//ata.loadPosData("data/xybirm5a.json");
		//data.loadPosData("data/xyall3a1000k.json");	
			
	}

function visualize(data){	
	
		/**
		 * initialize WGL with link to data, the relative path to the shader folder, and id of the map div
		 */
		
		WGL.init(data.num,'../../', 'map');	
		kdedim = WGL.addLineKDEDimension(data.lines, 'themap');
		//WGL.addMapDimension(data.lines[1], 'themap');
		
		/**
		 * map is global variable from Open Layers, we set our onMove 
		 * function to be called any time the map moves 
		 */		 
		map.events.register("move", map, onMove);							
			
		
		WGL.initFilters();
		
		/** Drawing the map fist time */
		WGL.mcontroller.zoommove(map.getZoom(), getTopLeftTC());
		WGL.render();
		$("#slider_radius").on("input", function(){		
			
			kdedim.setRadius(this.value/100000);			
			//heatmap.reRender();
			WGL.render();			
		});
		
	}


/**
 * Function to calculate top left corner of the map in pixels for zoom 0
 * @returns {___anonymous_res}
 */	
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
	
/**
 * Function to for moving the map event.
 */
function onMove() {			
		WGL.mcontroller.zoommove(map.getZoom(), getTopLeftTC(), WGL.filterByExt);
}


	
	
	