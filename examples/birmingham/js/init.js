	
function init() { 
		/*Initialize the map*/
		initMap();
		
		/*Load the data*/
		var data = new DataLoader();
		data.loadPosData("data/birmin_3a.json");
		//data.loadPosData("data/test.json");
			
				
	}
function circleSelection(element){
	if (element.checked){
		console.log("cvvv");
	}
}

function visualize(data){	
	
		/**
		 * initialize WGL with link to data, the relative path to the shader folder, and id of the map div
		 */
		WGL = new WGL(data.num,'../../', 'map');		
		
		/**
		 * map is global variable from Open Layers, we set our onMove 
		 * function to be called any time the map moves 
		 */		 
		map.events.register("move", map, onMove);							
			
		/**
		 * Adding heatmap, point map and polybrush interactions
		 */
		WGL.addHeatMapDimension(data.pts, 'heatmap');
		//define radius function
		var radius = 12.;		

		WGL.getDimensions()['heatmap'].radiusFunction = function(z){			
			var res = radius * Math.pow(2,z)/5000;
			//console.log(res);
			return  res ;
			};
		WGL.addMapDimension(data.pts, 'themap');
		WGL.addColorFilter('themap','colorbrush');
		WGL.addPolyBrushFilter('themap','polybrush');
		
		/**
		 * Adding fitering by map extent
		 */
		WGL.addExtentFilter();	
	
		/**
		 * Configuring the histograms and charts
		 */
		var charts = [];
		var params = [];
		params.w = 240;
		params.h = 180;
		params.margin = {
			top : 20,
			right : 20,
			bottom : 50,
			left : 60
			};
		/** Histogram for severity */
		var sev   = {data: data.sev,  domain: ['1','2','3'] ,  name: 'sev', type:'ordinal' };	
		WGL.addOrdinalHistDimension(sev);
		WGL.addLinearFilter(sev,3, 'sevF');
		charts['sev']   = new StackedBarChart(sev, "chart1", "accident servelity","sevF", params);
		
		
		//** Histogram for days*//
		var days = {data: data.days,  domain: data.daysarray,  name: 'days', type:'ordinal'};			
		WGL.addOrdinalHistDimension(days);
		WGL.addLinearFilter(days,7, 'daysF');		
		charts['days'] = new StackedBarChart(days, "chart2", "day of the week","daysF", params);
		
		/** Histogram for hours*/
		var hours = {data: data.hours,  min:0, max:24, num_bins: 24, name: 'hours',type:'linear'} ;
		WGL.addLinearHistDimension(hours);
		WGL.addLinearFilter(hours, 24*10, 'hoursF');
		charts['hours'] = new StackedBarChart(hours, "chart3", "hour of the day","hoursF");
		
		
		var legend = new HeatMapLegend('color_axis', 'heatmap');
		/**
		 * Addin all charts
		 */		
		WGL.addCharts(charts);
		//WGL.addLegend(legend);
		
		/**
		 * Initilizing all the filters
		 */
		WGL.initFilters();
		
		/** Drawing the map fist time */
		WGL.mcontroller.zoommove(map.getZoom(), getTopLeftTC());
		//WGL.render();
		
		
		
		
		$("#slider_radius").on("input", function(){			
			radius = this.value;			
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
	
	
	