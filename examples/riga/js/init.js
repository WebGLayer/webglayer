	
function init() { 
		/*Initialize the map*/
		initMap();
		
		/*Load the data*/
		var data = new DataLoader();
		//data.loadPosData("data/birmin_3a.json");
		data.loadPosData("data/sdi4appsall.json");
		//data.loadPosData("data/xybirm5a.json");
		//data.loadPosData("data/xyall3a1000k.json");	
			
	}

var datnums =["1",
"10",
"11",
"12",
"13",
"14",
"15",
"16",
"18",
"19",
"2",
"20",
"21",
"22",
"23",
"24",
"25",
"26",
"28",
"29",
"3",
"30",
"31",
"32",
"34",
"35",
"36",
"37",
"38",
"39",
"4",
"40",
"41",
"43",
"44",
"46",
"47",
"48",
"49",
"4z",
"5",
"50",
"51",
"52",
"53",
"54",
"55",
"56",
"57",
"6",
"7",
"8",
"9"]
function visualize(data){	
	
		/**
		 * initialize WGL with link to data, the relative path to the shader folder, and id of the map div
		 */
		
		WGL.init(data.num,'../../', 'map');		
		
		/**
		 * map is global variable from Open Layers, we set our onMove 
		 * function to be called any time the map moves 
		 */		 
		map.events.register("move", map, onMove);							
			
		/**
		 * Adding heatmap, point map and polybrush interactions
		 */
		var heatmap = WGL.addHeatMapDimension(data.pts, 'heatmap');
		//define radius function
			
		var mapdim = WGL.addMapDimension(data.pts, 'themap');
		WGL.addColorFilter('heatmap','colorbrush');
		WGL.addPolyBrushFilter('themap','polybrush');
		var legend = new  WGL.ui.HeatMapLegend('legend', 'colorbrush');
		heatmap.addLegend(legend);


		WGL.addExtentFilter();
		
	
		/**
		 * Configuring the histograms and charts
		 */
		var charts = [];
		var params = [];
		params.w = 640;
		params.h = 180;
		params.margin = {
			top : 20,
			right : 20,
			bottom : 50,
			left : 60
			};
		/** Histogram for severity */
		var routenum   = {data: data.routenum,  domain:  datnums ,  name: 'sev', type:'ordinal' };	
		WGL.addOrdinalHistDimension(routenum);
		WGL.addLinearFilter(routenum,datnums.length, 'sevF');
		charts['sev']   = new  WGL.ui.StackedBarChart(routenum, "chart1", "route number","sevF");
		
		
		/** Histogram for hours*/
		var hours = {data: data.hours,  min:0, max:24, num_bins: 24, name: 'hours',type:'linear'} ;
		WGL.addLinearHistDimension(hours);			
		WGL.addLinearFilter(hours, 24*10, 'hoursF');
		charts['hours'] = new  WGL.ui.StackedBarChart(hours, "chart3", "hour of the day","hoursF");
		
		
		//var legend = new WGL.ui.HeatMapLegend('heatlegend','colorbrush');
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
		WGL.render();
		
		
		var radius = 12.;	
		
		heatmap.radiusFunction = function(z){			
			var res = radius * Math.pow(2,z)/5000;
			//console.log(res);
			return  res ;
			};
		$("#slider_radius").on("input", function(){			
			radius = this.value;		
			//heatmap.reRender();
			WGL.render();			
		});
		
		$("#slider_pc").on("input", function(){			
			 //mapdim.render2(this.value);	
			pc.reRender(this.value);		
		});
		
		$("#points_visible").click(function(){
			var l = WGL.getDimension(this.name);
			l.setVisible(this.checked);					
			WGL.render();			
		});
		$("#heatmap_visible").click(function(){
			var l = WGL.getDimension(this.name);
			l.setVisible(this.checked);
			// heatmap.reRender();
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
	
	
	