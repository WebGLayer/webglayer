	
	
function init() { 
			 
		initMap();
	
		
		
		
		var data = new DataLoader();
		//data.loadPosData("data/bermingham_acc.json");
	//	data.loadPosData("data/xybirm5a.json");
		data.loadPosData("data/xyall5a500k.json");
	//	data.loadPosData("data/xyall5a300k.json");
	//	data.loadPosData("data/xyall5atest.json");
	//	data.loadPosData("data/xyall5a400k.json");
	   //data.loadPosData("data/test2.json");
	//	data.loadPosData("data/acc600k.json");
				
			

	}

function visualize(data){
		

		//wgl = new WGL(data.num,'http://localhost:9999/js/webglayer/','map');	
		WGL.init(data.num,'http://localhost:9999/js/webglayer/','map');	
		window.onresize = function(){
			WGL.resize();
		}
		
		map.events.register("move", map, onMove);							


		var heatmap = WGL.addHeatMapDimension(data.pts, 'heatmap');

		var mapdim = WGL.addMapDimension(data.pts, 'themap');
		WGL.addColorFilter('heatmap','colorbrush');
		WGL.addPolyBrushFilter('themap','polybrush');
		var legend = new  WGL.ui.HeatMapLegend('legend', 'colorbrush');
		heatmap.addLegend(legend);


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
		//var date =  {data: data.date,   min:data.dmm.min, max:data.dmm.max, num_bins: 50, name: 'date', type:'linear'} ;
		//wgl.addLinearHistDimension(date);
		//wgl.addLinearFilter(date,date.num_bins, 'dateF');
		//charts['date']  = new StackedBarChart(date, "chart3", "Time", 'date');

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
		WGL.mcontroller.zoommove(map.getZoom(), getTopLeftTC());
		//wgl.render();	
		
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
	
	
	