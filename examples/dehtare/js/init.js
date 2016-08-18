	
	
function init() { 			 
		initMap();	
		var data = new DataLoader();
	//	data.loadPosData("data/all13.json");
	//	data.loadPosData("data/all13a14.json");
	//	data.loadPosData("data/xybirm5a.json");
		data.loadPosData("data/t.json");
	//	data.loadPosData("data/xyall5a300k.json");
	//	data.loadPosData("data/xyall5atest.json");
	//	data.loadPosData("data/xyall5a400k.json");
	//  data.loadPosData("data/test.json");
	//	data.loadPosData("data/acc600k.json");
				
			

	}

function visualize(data){	

		//wgl = new WGL(data.num,'http://localhost:9999/js/webglayer/','map');	
		WGL.init(data.num,'../','map', 'OpenLayers_Map_2_OpenLayers_Container');	
		window.onresize = function(){
			WGL.resize();
		}
		
		map.events.register("move", map, onMove);							
		/*var heatmap2= WGL.addHeatMapDimension(data.pts, 'heatmap2');
		heatmap2.radiusFunction = function(r, z){			
			var res = r/40000 * Math.pow(2,z);
			//console.log(res);
			var gpsize = map.getGeodesicPixelSize();
			var pixelsize = (gpsize.h+gpsize.w)/2;
			return  res ;
			};

	heatmap2.renderer.colors.set([  1, 1, 1, 1.2, 
	         		              1, 1,1, 0.5, 
	         		              0, 0, 0, 0.0,
	        		              0, 0, 0, 1 ]);
	
	 heatmap2.setRadius(60);
	 heatmap2.gradFunction = function() {
			return 1;
		}*/
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
		 heatmap.setValues(data.ndvi_2016);
		 
		

		var mapdim = WGL.addMapDimension(data.pts, 'themap');
	
		WGL.addPolyBrushFilter('themap','polybrush');
		
		addHeatMapControl(heatmap,'chm');
		

		WGL.addExtentFilter();
	
		/*for ordinal dimension from 1-3 use range 0.5-3.5*/
	
		var charts = [];				

	
		//var road_surf = {data: data.road_surf, domain:['1','2','3','4','5'], name: 'road_surface'};
		
		
		
		/*HOURS*/
		
		var ndvi = {data: data.ndvi_2016,  min:0.1, max:0.7, num_bins: 100, name: 'ndvi',type:'linear', label :"ndvi_2016"} ;
		var chd2 = new WGL.ChartDiv("right","ch2", "NDVI 2016");
		chd2.setDim(WGL.addLinearHistDimension( ndvi));		
		WGL.addLinearFilter( ndvi, 24*10, 'hoursF');		
		charts['ndvi'] = new  WGL.ui.StackedBarChart( ndvi, "ch2", "ndvi 2016", 'hoursF');
		
		var ndvi2 = {data: data.ndvi_20161,  min:0.1, max:0.7, num_bins: 100, name: 'ndvi2',type:'linear', label :"ndvi_2016"} ;
		var chd2 = new WGL.ChartDiv("right","ch3", "NDVI 20161");
		chd2.setDim(WGL.addLinearHistDimension( ndvi2));		
		WGL.addLinearFilter( ndvi2, 24*10, 'hoursF2');		
		charts['ndvi2'] = new  WGL.ui.StackedBarChart( ndvi2, "ch3", "ndvi 20161", 'hoursF2');
		
		
		//charts['date'].setTicks(30);
		
	
			
		/**
		 * Addin all charts
		 */		
		WGL.addCharts(charts);
		//wgl.addLegend(legend);
		
		WGL.initFilters();
		//wgl.render();
	
		//wgl.render();	
		
		//var radius = 12.;		

		
	
		
		
				
		
		$("#reset").on("click", function(){
			WGL.resetFilters();
			var lonlat = new OpenLayers.LonLat(-1.9,52.5).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
			map.setCenter(lonlat);
			map.zoomTo(11);
		})
		
		
		
		$("#points_visible").click(function(){
			var l = WGL.getDimension(this.name);
			l.setVisible(this.checked);					
			WGL.render();			
		});
		$("#heatmap_visible").click(function(){
			var l = WGL.getDimension(this.name);
			l.setVisible(this.checked);
			 heatmap.setValues(data.ndvi_2016);
			// heatmap.reRender();
			WGL.render();			
		});
		
		$("#heatmap1_visible").click(function(){
			var l = WGL.getDimension(this.name);
			l.setVisible(this.checked);
			 heatmap.setValues(data.ndvi_20161);
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
	"<input style='width: 50%; right:1em; position:absolute' type ='range' max='300' min='1'"+
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
	WGL.addLegend(legend);
	
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
	
	
	