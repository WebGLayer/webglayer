	
	
function init() { 			 
		initMap();	
		var data = new DataLoader();
	//	data.loadPosData("data/all13.json");
	//	data.loadPosData("data/all13a14.json");
	//	data.loadPosData("data/xybirm5a.json");
		data.loadPosData("data/tall.json");
	//	data.loadPosData("data/xyall5a300k.json");
	//	data.loadPosData("data/xyall5atest.json");
	//	data.loadPosData("data/xyall5a400k.json");
	//  data.loadPosData("data/test.json");
	//	data.loadPosData("data/acc600k.json");
				
			

	}

function visualize(data){	

		//wgl = new WGL(data.num,'http://localhost:9999/js/webglayer/','map');	
		WGL.init(data.num,'../../','map', 'OpenLayers_Map_2_OpenLayers_Container');	
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
			
		 heatmap.setRadius(3000);
		 
		

		var mapdim = WGL.addMapDimension(data.pts, 'themap');
	
		WGL.addPolyBrushFilter('themap','polybrush');
		
		addHeatMapControl(heatmap,'chm');
		

		WGL.addExtentFilter();
	
		/*for ordinal dimension from 1-3 use range 0.5-3.5*/
	
		var charts = [];				

	
		//var road_surf = {data: data.road_surf, domain:['1','2','3','4','5'], name: 'road_surface'};
		
		/* SEX*/
		//var days = {data: data.dayes,  min:0, max: 7, num_bins: 7,  name: 'dayes'};	
		var sex = {data: data.sex,  domain: ['0', '1'],  name: 'sex', type:'ordinal', label: "gendre"};
		var chd1 = new WGL.ChartDiv("right","ch1", "Gendre");
		//wgl.addLinearHistDimension(dayes);
		chd1.setDim(WGL.addOrdinalHistDimension(sex));
		WGL.addLinearFilter(sex,2, 'sexF');		
		charts['sex'] = new  WGL.ui.StackedBarChart(sex, "ch1", "gendre", 'sexF');
		
		/* Subject*/
		//var days = {data: data.dayes,  min:0, max: 7, num_bins: 7,  name: 'dayes'};	
		var subject = {data: data.subject,  domain: ["ENG",
		                                             "BIO",
		                                             "PHY",
		                                             "MAT",
		                                             "CHE",
		                                             "HIS",
		                                             "FRE",
		                                             "LAT",
		                                             "RUS",
		                                             "GER"],  name: 'subject', type:'ordinal', label: "subject"};
		var chd2 = new WGL.ChartDiv("right","ch2", "subject");
		//wgl.addLinearHistDimension(dayes);
		chd2.setDim(WGL.addOrdinalHistDimension(subject));
		WGL.addLinearFilter(subject,10, 'subF');		
		charts['subject'] = new  WGL.ui.StackedBarChart(subject, "ch2", "subject", 'subF');
		
		
		/* sucess*/
		//var days = {data: data.dayes,  min:0, max: 7, num_bins: 7,  name: 'dayes'};	
		var percent = {data: data.percent, min:0, max: 100, num_bins: 100,  name: 'percent', type:'linear', label: "percent"};
		var chd3 = new WGL.ChartDiv("right","ch3", "percent");
		//wgl.addLinearHistDimension(dayes);
		chd3.setDim(WGL.addLinearHistDimension(percent));
		WGL.addLinearFilter(percent,100, 'perF');		
		charts['percent'] = new  WGL.ui.StackedBarChart(percent, "ch3", "percent", 'perF');
	
		/* type*/
		//var days = {data: data.dayes,  min:0, max: 7, num_bins: 7,  name: 'dayes'};	
		var sch_type = {data: data.sch_type,  domain: ["high school",
		                                               "boarding school",
		                                               "vac school",
		                                               "vocational school",
		                                               "state gym",
		                                               "gymnasium",
		                                               "uni"],
		                name: 'sch_type', type:'ordinal', label: "school type"};
		var chd4 = new WGL.ChartDiv("right","ch4", "school type");
		//wgl.addLinearHistDimension(dayes);
		chd1.setDim(WGL.addOrdinalHistDimension(sch_type));
		WGL.addLinearFilter(sch_type,7, 'schoolF');		
		charts['sch_type'] = new  WGL.ui.StackedBarChart(sch_type, "ch4", "sch_type", 'schoolF');
		
		
		
		var d =[];
		d[0]= sex;
		d[1] = subject;		
		d[2] = percent;
		d[3] = sch_type;
		
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
		
		
	
		$("#schools_visible").click(function(){
			map.getLayersByName('Points')[0].setVisibility(this.checked);		
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
	"<input style='width: 50%; right:1em; position:absolute' type ='range' max='5000' min='1'"+
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
	
	
	