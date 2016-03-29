	
function init() { 
		/*Initialize the map*/
		initMap();
		
		/*Load the data*/
		var data = new DataLoader();
		//data.loadPosData("data/birmin_3a.json");
		data.loadPosData("data/test.json");
		//data.loadPosData("data/xybirm5a.json");
		//data.loadPosData("data/xyall3a1000k.json");	
			
	}

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
		var hd = WGL.addHeatMapDimension(data.pts, 'heatmap');
		//define radius function
			

		hd.radiusFunction = function(z){	
			var radius = 12.;			
			var res = radius * Math.pow(2,z)/5000;
			//console.log(res);
			return  res ;
			};
		WGL.addMapDimension(data.pts, 'themap');
		
	
		
		
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
		charts['sev']   = new  WGL.ui.StackedBarChart(sev, "chart1", "accident servelity","sevF", params);
		
		
		/** Histogram for hours*/
		var hours = {data: data.hours,  min:0, max:24, num_bins: 24, name: 'hours',type:'linear'} ;
		WGL.addLinearHistDimension(hours);			
		WGL.addLinearFilter(hours, 24*10, 'hoursF');
		charts['hours'] = new  WGL.ui.StackedBarChart(hours, "chart3", "hour of the day","hoursF");
		
			
		//** Histogram for days*//
		var days = {data: data.days,  domain: data.daysarray,  name: 'days', type:'ordinal'};			
		var dim = WGL.addOrdinalHistDimension(days);
		dim.setValueData(hours);
		WGL.addLinearFilter(days,7, 'daysF');		
		charts['days'] = new  WGL.ui.StackedBarChart(days, "chart2", "day of the week","daysF", params);
	
		
		var legend = new WGL.ui.HeatMapLegend('heatlegend','colorbrush');
		/**
		 * Addin all charts
		 */		
		WGL.addCharts(charts);
		WGL.addLegend(legend);
		
		/**
		 * Initilizing all the filters
		 */
		WGL.initFilters();
		
		/** Drawing the map fist time */
		WGL.mcontroller.zoommove(map.getZoom(), getTopLeftTC());
		WGL.render();
		
		
		
		
		$("#slider_radius").on("input", function(){			
			radius = this.value;			
			WGL.render();			
		});
		
		$("#points_visible").click(function(){
			var l = WGL.getDimension(this.name);
			l.setVisible(this.checked);					
			WGL.render();			
		});
		$("#heatmap_visible").click(function(){
			var l = WGL.getDimension(this.name);
			l.setVisible(this.checked);					
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
	
	
	