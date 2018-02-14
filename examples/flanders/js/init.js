	
function init() { 
		/*Initialize the map*/
		initMap();
		
		/*Load the data*/
		var data = new DataLoader();
		data.loadPosData("data/big/test10k.json");
		//data.loadPosData("data/all.json");
		//data.loadPosData("data/all_lines.json");
		//data.loadPosData("data/xybirm5a.json");
		//data.loadPosData("data/xyall3a1000k.json");	
			
	}

var link_ids =["11",
              "6",
              "5",
              "2",
              "4",
              "15",
              "7",
              "10",
              "3",
              "9",
              "12",
              "24",
              "8"]
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
			
		//var mapdim = WGL.addMapDimension(data.pts, 'themap');
		WGL.addColorFilter('heatmap','colorbrush');
		WGL.addPolyBrushFilter('heatmap','polybrush');

		heatmap.renderer.colors.set([ 1, 0, 1, 1, 
		           		              1, 0, 1, 1, 
		        		              0, 1, 1, 1,
		        		              0, 0, 0, 1 ]);
		
		heatmap.radiusFunction = function(r, z){			
			var res = r/20000 * Math.pow(2,z);
			//console.log(res);
			var gpsize = map.getGeodesicPixelSize();
			var pixelsize = (gpsize.h+gpsize.w)/2;
			return  res ;
			};
			heatmap.setRadius(40);
			
		
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
		/** Histogram for types */
	//	var routetype   = {data: data.route_type,  domain:  ["0","2", "3"] ,  name: 'rt', type:'ordinal',  label : "Route type"};	
	//	var chd1 = new WGL.ChartDiv("right","ch1", "Route type");
	//	WGL.addOrdinalHistDimension( routetype);
	//	WGL.addLinearFilter(routetype, 3 , 'rtf');
	//	charts['rt']   = new  WGL.ui.StackedBarChart(routetype, "ch1", "route number","rtf");
		
		/** Histogram for hours*/
		var hours = {data: data.departure_hour,  min:0, max:24, num_bins: 24, name: 'hours',type:'linear', label : "Hour of departure"} ;
		var chd2 = new WGL.ChartDiv("right","ch2", "Hour of departure");
		WGL.addLinearHistDimension(hours);			
		WGL.addLinearFilter(hours, 24, 'hoursF');
		charts['hours'] = new  WGL.ui.StackedBarChart(hours, "ch2", "hour of the day","hoursF");
		
		/** buildup area*/
		var bup_area = {data: data.built_up_buffer,  min:0, max:100, num_bins: 50, name: 'bua',type:'linear', label : "Built up area (%)"} ;
		var chd3 = new WGL.ChartDiv("right","ch3", "Built up area (%)");
		WGL.addLinearHistDimension(bup_area);			
		WGL.addLinearFilter(bup_area, 100, 'buaF');
		charts['bua'] = new  WGL.ui.StackedBarChart(bup_area, "ch3", "built up area [%]","buaF");
		
		/** Histogram for ids */
		var links   = {data: data.route_short_name,  domain:  link_ids ,  name: 'links', type:'ordinal', label : "Link id" };	
		var chd4 = new WGL.ChartDiv("right","ch4", "Link id");
		WGL.addOrdinalHistDimension( links );
		WGL.addLinearFilter(links , 14 , 'linkf');
		charts['links']   = new  WGL.ui.StackedBarChart(links, "ch4", "Link id","linkf");
		
		var d =[];
		//d[0]= routetype;
		d[0] = links;		
		d[1] = hours;
		d[2] = bup_area;	
		
	
		var pc = WGL.addParallelCoordinates('pc_chart', d);
		WGL.addMultiDim(d);
		
		//var legend = new WGL.ui.HeatMapLegend('heatlegend','colorbrush');
		/**
		 * Addin all charts
		 */		
		WGL.addCharts(charts);
  	var controlHM = new WGL.ChartDiv("right","chm", "Heat map controls");
  	addHeatMapControl(heatmap,'chm');
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
		
		$("#pc_header").click(function(){
			$(".pc_chart_div").slideToggle();
			var l = WGL.getDimension("pc_chart");
			
			var resize =  function(){	
			 	WGL.getManager().updateMapSize();
			 	WGL.mcontroller.resize();	
			 	WGL.mcontroller.zoommove(map.getZoom(), getTopLeftTC());
			 	WGL.render();
				}
			if (l.visible){		
					l.setVisible(false);
					$('#map').animate({ 'margin-bottom': '1.5em'},
							{done: resize})			
					$('#pc').animate({ 'height': '1.5em'},
									{done: resize})	
									
					$('#butPC').removeClass("fa-chevron-down");  
					$('#butPC').addClass("fa-chevron-up");
					setTimeout( function() { map.updateSize();}, 200);
			} else {
				l.setVisible(true);
				$('#map').animate({ 'margin-bottom': '18.5em'},
						{done: resize})		
				$('#pc').animate({ 'height': '18.5em'},
								{done: resize})	
				$('#butPC').removeClass("fa-chevron-up");  
				$('#butPC').addClass("fa-chevron-down");
				setTimeout( function() { map.updateSize();}, 200);
			}
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

function addHeatMapControl(hm,divid){

  $("#"+divid).append(
    "<div id="+divid+"left style='top:0em; left:0em; width:40%'></div>"+
    "<div id="+divid+"right style='top:0em; right:0em; width:35%; height:7em;'></div>");


  var thediv = $("#"+divid+"right");
  thediv.append(
    "<div style='margin:1.2em 0.5em 0.5em 0.5em'>"+
    "<text>Radius: </text><text id='radius_label'></text>"+
    "<input style='width: 50%; right:1em; position:absolute' type ='range' max='300' min='1'"+
    "step='1' name='points' id='slider_radius' value='30'></input> " +
    "</div>");
  thediv.append(
    "<div style='margin:1.2em 0.5em 0.5em 0.5em'>"+
    "<text>Density of records<br>within the radius: </text><text id='radius_label'></text>"+
    "<div id='heatmap-legend' style='float: right'></div>"+
    "</div>"
  );


  WGL.addColorFilter(hm.id,'colorbrush');
  var legend = new  WGL.ui.HeatMapLegend("heatmap-legend", 'colorbrush', true);
  hm.addLegend(legend);
  WGL.addLegend(legend);

  $("#slider_radius").on("input", function(){

    hm.setRadius(this.value);

    $('#radius_label').html(this.value+"m ");
    //heatmap.reRender();
    WGL.render();
  });

  $("#cross").off("click");
  $("#cross").click(function(e){

      $("#right").toggle();
      $(this).toggleClass("active");
      $("#sipka").toggleClass("fa-chevron-right");
      $("#sipka").toggleClass("fa-chevron-left");
      $("#map").toggleClass("fullscrean");
      $("#pc").toggleClass("pc_chart_big");

      WGL.getManager().updateMapSize();
      WGL.mcontroller.resize();
      WGL.mcontroller.zoommove(map.getZoom(),getTopLeftTC());
      map.updateSize();

      $("#info").hide();

      WGL.getDimension("pc_chart").resize();

      WGL.render();
    }

  )
}
	
	
	