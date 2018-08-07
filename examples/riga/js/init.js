	
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
		heatmap.radiusFunction = function(r, z){			
			var res = r/20000 * Math.pow(2,z);
			//console.log(res);
			var gpsize = map.getGeodesicPixelSize();
			var pixelsize = (gpsize.h+gpsize.w)/2;
			return  res ;
			};

		WGL.addExtentFilter();
		
	
		/**
		 * Configuring the histograms and charts
		 */
		var charts = [];
		var params = [];
		params.w = 500;
		params.h = 300;
		params.margin = {
			top : 20,
			right : 70,
			bottom : 50,
			left : 60
			};
		params.rotate_x = true;
		/** Histogram for severity */
		var routenum   = {data: data.routenum,  domain:  datnums ,  name: 'sev', type:'ordinal' };
    	const chd1 = new WGL.ChartDiv("charts", "ch1", "route number", "Route Number", 12);
    	chd1.setDim(WGL.addOrdinalHistDimension(routenum));
		WGL.addLinearFilter(routenum,datnums.length, 'sevF');
		charts['sev']   = new  WGL.ui.StackedBarChart(routenum, "ch1", "route number","sevF", params);
		
		
		/** Histogram for hours*/
		var hours = {data: data.hours,  min:0, max:24, num_bins: 24, name: 'hours',type:'linear'} ;
    	const chd2 = new WGL.ChartDiv("charts", "ch2", "hours", "Hours", 24);
    	chd2.setDim(WGL.addLinearHistDimension(hours));
    	WGL.addLinearFilter(hours, 24*10, 'hoursF');
		charts['hours'] = new  WGL.ui.StackedBarChart(hours, "ch2", "hour of the day","hoursF");
		
		
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
		
		
		//var radius = 12.;	
		
		
		$("#slider_radius").on("input", function(){			
			heatmap.setRadius(this.value);	
			//$('#radius_label').html(this.value+"m ");
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

    const charts_element = $("#charts");
    charts_element.sortable(
        {
            placeholder: "ui-state-highlight",
            handle: '.chart-header',
            zIndex: 9999,
            helper: 'clone',
            cursor: "move",
            start: function() {
                $(this).find(".chart-header").addClass('grabbing');
            },
            stop: function() {
                $(this).find(".chart-header").removeClass('grabbing');
            },
            update: ( event, ui ) => {
                $("#chd-container-"+$($(ui.item[0]).children(".chart-content")[0]).attr("id") +" .chart-content").css("visibility", "visible");
            }
        }
    );
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
	
	
	