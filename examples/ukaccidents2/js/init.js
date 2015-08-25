	
	
function init() { 
			 
		initMap();
	
		var data = new DataLoader();
		data.loadPosData("data/acc_snap3k.json");
		
		

	}

function visualize(data){	
		WGL = new WGL(data.num,'http://localhost:9999/js/webglayer/');		
				
		map.events.register("move", map, onMove);							
	
		WGL.addMapDimension(data.pts, 'map');
		//WGL.addHeatMapDimension(data.pts, 'map');
	
		/*for ordinal dimension from 1-3 use range 0.5-3.5*/
	
		var sev   = {data: data.sev,  domain: ['1','2','3'] ,  name: 'sev'  };		
		//var road_surf = {data: data.road_surf, domain:['1','2','3','4','5'], name: 'road_surface'};
		var dayes = {data: data.dayes,  min:0, max: 7, num_bins: 7,  name: 'dayes'};		
		var hours = {data: data.hours,  min:0, max:24, num_bins: 24, name: 'hours'} ;
		
		//WGL.addHistogramDimension(sev);
		
		WGL.addOrdinalHistDimension(sev);
		//WGL.addOrdinalHistDimension(road_surf);	
		
		
		WGL.addLinearHistDimension(dayes);
		WGL.addLinearFilter(dayes,7, 'dayesF');		
		
		WGL.addLinearHistDimension(hours);
		WGL.addLinearFilter(hours,24*4, 'hoursF');
		//WGL.initHistograms();
				
		var charts = [];
		charts['sev']   = new StackedBarChart(sev, "chart1", "accident servelity",'servelity');
		charts['dayes'] = new StackedBarChart(dayes, "chart2", "day of the week", 'dayes');
		charts['hours'] = new StackedBarChart(hours, "chart3", "hour of the day", 'hours');
		//charts['road_surface'] = new StackedBarChart(road_surf, "chart4", "road surface", 'road surface');

		WGL.addCharts(charts);
		
		WGL.render();
		WGL.mcontroller.zoommove(map.getZoom(), getTopLeftTC(), WGL.filterByExt);
		WGL.render();	
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
	
	
	