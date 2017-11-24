	
	
function init() { 			 
		initMap();	
		var data = new DataLoader();
		data.loadPosData("data/all13.json");
	//	data.loadPosData("data/all13a14.json");
	//	data.loadPosData("data/xybirm5a.json");
	//	data.loadPosData("data/xyall5a500k.json");
	//	data.loadPosData("data/xyall5a300k.json");
	//	data.loadPosData("data/xyall5atest.json");
	//	data.loadPosData("data/xyall5a400k.json");
	//  data.loadPosData("data/test.json");
	//	data.loadPosData("data/acc600k.json");
				
			

	}

function visualize(data){	

		//wgl = new WGL(data.num,'http://localhost:9999/js/webglayer/','map');	
		WGL.init(data.num,'../../','map');	
		window.onresize = function(){
			WGL.resize();
		}
		
		map.events.register("move", map, onMove);							

		var controlHM = new WGL.ChartDiv("right","chm", "Heat map controls");
		var heatmap = WGL.addHeatMapDimension(data.pts, 'heatmap');
		heatmap.radiusFunction = function(r, z){			
			var res = r/20000 * Math.pow(2,z);
			//console.log(res);
			var gpsize = map.getGeodesicPixelSize();
			var pixelsize = (gpsize.h+gpsize.w)/2;
			return  res ;
			};

		 heatmap.setRadius(30);

		var mapdim = WGL.addMapDimension(data.pts, 'themap');
	
		WGL.addPolyBrushFilter('themap','polybrush');
		
		addHeatMapControl(heatmap,'chm');

		WGL.addExtentFilter();
	
		/*for ordinal dimension from 1-3 use range 0.5-3.5*/
	
		var charts = [];				

	
		//var road_surf = {data: data.road_surf, domain:['1','2','3','4','5'], name: 'road_surface'};
		
		/* DAYS*/
		//var days = {data: data.dayes,  min:0, max: 7, num_bins: 7,  name: 'dayes'};	
		var days = {data: data.days,  domain: data.daysarray,  name: 'days', type:'ordinal', label: "day of the week"};
		var chd1 = new WGL.ChartDiv("right","ch1", "Day of the week");
		//wgl.addLinearHistDimension(dayes);
		chd1.setDim(WGL.addOrdinalHistDimension(days));
		WGL.addLinearFilter(days,7, 'daysF');		
		charts['days'] = new  WGL.ui.StackedBarChart(days, "ch1", "day of the week", 'daysF');
		
		/*HOURS*/
		
		var hours = {data: data.hours,  min:0, max:24, num_bins: 24*5, name: 'hours',type:'linear', label :"hour of the day"} ;
		var chd2 = new WGL.ChartDiv("right","ch2", "Hour of the day");
		chd2.setDim(WGL.addLinearHistDimension(hours));		
		WGL.addLinearFilter(hours, 24*10, 'hoursF');		
		charts['hours'] = new  WGL.ui.StackedBarChart(hours, "ch2", "hour of the day", 'hoursF');
		
		/*SERVELITY*/
		var sev   = {data: data.sev,  domain: data.sevEnum ,  name: 'sev', type:'ordinal', label : "accident servelity"};	
		var chd3 = new WGL.ChartDiv("right","ch3", "Accident severity");
		chd3.setDim(WGL.addOrdinalHistDimension(sev));
		WGL.addLinearFilter(sev,3, 'sevF');
		charts['sev']   = new  WGL.ui.StackedBarChart(sev, "ch3", "accident severity",'sevF');
	
		/*Date*/
		var date =  {data: data.date,   min:data.dmm.min, max:data.dmm.max, num_bins: 365, name: 'date', type:'linear'} ;
		var chd5 = new WGL.ChartDiv("right","ch5", "Date");
		chd5.setDim(WGL.addLinearHistDimension(date));
		WGL.addLinearFilter(date,date.num_bins, 'dateF');
		charts['date']  = new WGL.ui.StackedBarChart(date, "ch5", "Date ", 'dateF');
		charts['date'].xformat = function(d){
			var data =  new Date(d*1000*60*60);
			return (data.getDay()+1)+". "+ (data.getMonth()+1);
		}
		var roadtype = {data: data.road_type, domain: data.rtDom,  
				name:'roadt', type:'ordinal', label : "road type"};
		WGL.addOrdinalHistDimension(roadtype).setVisible(false);
		WGL.addLinearFilter( roadtype, 8 , 'roadtF');		
		//charts['roadt'] = new StackedBarChart(roadtype, "chart4", "road type", 'roadtF');
	

		var sl = {data: data.speed_limit, domain: ['20','30','40','50','60','70'], 
				name:'speedlimit', type:'ordinal', label : "Speed limit"};
		var chd4 = new WGL.ChartDiv("right","ch4", "Speed Limit");	
		chd4.setDim(WGL.addOrdinalHistDimension(sl));
		WGL.addLinearFilter(sl, 13, 'slF');
		charts['speedlimit'] = new  WGL.ui.StackedBarChart(sl, "ch4", "Speed limit", 'slF');
		
	
		var d =[];
		d[0]= hours;
		d[1] = days;		
		d[2] = roadtype;
		d[3] = sl;
		d[4] = sev;
		
		var pc = WGL.addParallelCoordinates('pc_chart', d);
		WGL.addMultiDim(d);
			
		/**
		 * Addin all charts
		 */		
		WGL.addCharts(charts);
		//wgl.addLegend(legend);
		
		WGL.initFilters();
		//wgl.render();
	
		//wgl.render();	
		
		//var radius = 12.;		

		
	
		
		$("#slider_pc").on("input", function(){			
			 //mapdim.render2(this.value);	
			pc.reRender(this.value);		
		});
				
		
		$("#reset").on("click", function(){
			WGL.resetFilters();
			var lonlat = new OpenLayers.LonLat(-1.9,52.5).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
			map.setCenter(lonlat);
			map.zoomTo(11);
		})
		
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
			//WGL.resize();
			//WGL.getManager().updateMapSize();
	 		//WGL.mcontroller.resize();	
	 				
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

function updateLabel(v){
	console.log(v);
}

function addHeatMapControl(hm,divid){
	
	
	$("#"+divid).append(
	"<div id="+divid+"left style='top:0em; left:0em; width:40%'></div>"+
	"<div id="+divid+"right style='top:0em; right:0em; width:60%; height:10em; position:absolute'></div>");
		
	
	var thediv = $("#"+divid+"right");
	 thediv.append(
	"<div style='margin:0.5em'>"+
	"<text>Radius: </text><text id='radius_label'></text>"+	 
	"<input style='width: 50%; right:1em; position:absolute' type ='range' max='100' min='1'"+
       				"step='1' name='points' id='slider_radius' value='30'></input> </div>");
       				
   
	 thediv.append(
				"<div style='margin:0.5em'>"+
				"<text>Get maximum from data:</text>"+	 
				"<input style='width: 20%; right:0em; position:absolute' type ='checkbox'"+
			        				" default='true' id='max_checked' checked='true' ></input> </div>");
	 thediv.append(
			"<div style='margin:0.5em'>"+
			"<text>Maximum:</text>"+	 
			"<input style='width: 50%; right:1em; position:absolute' type ='range' max='300' min='1'"+
		        				"step='1' name='points' id='hm_max' value='10' disabled></input> </div>");
	


	
	
   
    
    WGL.addColorFilter(hm.id,'colorbrush');
	var legend = new  WGL.ui.HeatMapLegend(divid+"left", 'colorbrush');
	hm.addLegend(legend);
	
	
	$("#slider_radius").on("input", function(){		
		
		hm.setRadius(this.value);	
		$('#radius_label').html(this.value+"m ");
		//heatmap.reRender();
		WGL.render();			
	});
	
	$("#hm_max").on("input", function(){	
		
		hm.maxVal= this.value;		
		//heatmap.reRender();
		WGL.render();	
		legend.updateMaxAll(this.value);		
	});
	
	$("#max_checked").on("click", function(d,i){
		
			 hm.lockScale = !this.checked;
			 //$("#hm_min").val(100);			 
			 document.getElementById("hm_max").disabled = this.checked;
					
		 
		}); 
}
	
	
	