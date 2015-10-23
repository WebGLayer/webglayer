	
	
function init() { 
			 
		initMap();
	
		var data = new DataLoader();
		//data.loadPosData("data/bermingham_acc.json");
		data.loadPosData("data/birmingham_5a.json");
	    //data.loadPosData("data/test2.json");
	//	data.loadPosData("data/acc600k.json");
		
		

	}

function visualize(data){	
	
		WGL = new WGL(data,'http://localhost:9999/js/webglayer/');		
				
		map.events.register("move", map, onMove);							
		
				
		WGL.addHeatMapDimension(data.pts, 'heatmap');
		WGL.addMapDimension(data.pts, 'themap');
		WGL.addPolyBrushFilter('themap','polybrush');
		
		WGL.addExtentFilter();
	
		/*for ordinal dimension from 1-3 use range 0.5-3.5*/
	
		var charts = [];
		
		/*SERVELITY*/
		var sev   = {data: data.sev,  domain: ['1','2','3'] ,  name: 'sev', type:'ordinal' };	
		WGL.addOrdinalHistDimension(sev);
		WGL.addLinearFilter(sev,3, 'sevF');
		charts['sev']   = new StackedBarChart(sev, "chart3", "accident servelity",'sev');
		
		
		//var road_surf = {data: data.road_surf, domain:['1','2','3','4','5'], name: 'road_surface'};
		
		/* DAYES*/
		//var dayes = {data: data.dayes,  min:0, max: 7, num_bins: 7,  name: 'dayes'};	
		var dayes = {data: data.dayes,  domain: data.daysarray,  name: 'dayes', type:'ordinal'};	
		//WGL.addLinearHistDimension(dayes);
		WGL.addOrdinalHistDimension(dayes);
		WGL.addLinearFilter(dayes,7, 'dayesF');		
		charts['dayes'] = new StackedBarChart(dayes, "chart1", "day of the week", 'dayes');
		
		/*HOURS*/
		
		var hours = {data: data.hours,  min:0, max:24, num_bins: 24, name: 'hours',type:'linear'} ;
		WGL.addLinearHistDimension(hours);
		WGL.addLinearFilter(hours, 24*10, 'hoursF');
		charts['hours'] = new StackedBarChart(hours, "chart2", "hour of the day", 'hours');
		
		
		/*Date*/
		//var date =  {data: data.date,   min:data.dmm.min, max:data.dmm.max, num_bins: 50, name: 'date', type:'linear'} ;
		//WGL.addLinearHistDimension(date);
		//WGL.addLinearFilter(date,date.num_bins, 'dateF');
		//charts['date']  = new StackedBarChart(date, "chart3", "Time", 'date');

		var roadtype = {data: data.road_type, min:0, max:8,  num_bins:8, name:'road surf', type:'linear'};
		var sl = {data: data.speed_limit, min:0, max:90,  num_bins:13, name:'speed limit', type:'linear'};	
		
		WGL.addCharts(charts);
		
		WGL.initFilters();
		//WGL.render();
		WGL.mcontroller.zoommove(map.getZoom(), getTopLeftTC());
		//WGL.render();	
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
	
	
	