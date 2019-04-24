	
var pw;
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
  	map.events.register("moveend", map, function () {
			WGL.render([true, true, false]);
    });

  var controlHM = new WGL.ChartDiv("charts","chm", "heat map controls", "Heat map controls");
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
		mapdim.pointSize = function (zoom) {
      if (zoom >= 15){
        return 10
      }
      if (zoom < 15 && zoom >= 12){
        return 5
      }
      return 2
    };
	
		WGL.addPolyBrushFilter('themap','polybrush');
		
		addHeatMapControl(heatmap,'chm');

		WGL.addExtentFilter();
	
		/*for ordinal dimension from 1-3 use range 0.5-3.5*/
	
		var charts = [];				

	
		//var road_surf = {data: data.road_surf, domain:['1','2','3','4','5'], name: 'road_surface'};
		
		/* DAYS*/
		//var days = {data: data.dayes,  min:0, max: 7, num_bins: 7,  name: 'dayes'};	
		var days = {data: data.days,  domain: data.daysarray,  name: 'days', type:'ordinal', label: "day of the week"};
		var chd1 = new WGL.ChartDiv("charts","ch1", "day of the week", "Day of the week", 3);
		//wgl.addLinearHistDimension(dayes);
		chd1.setDim(WGL.addOrdinalHistDimension(days));
		WGL.addLinearFilter(days,7, 'daysF');		
		charts['days'] = WGL.createStackBarChartSubset(days, "ch1", "day of the week", 'daysF',['Sun','Mon','Thu']);
		
		/*HOURS*/
		
		var hours = {data: data.hours,  min:0, max:24, num_bins: 24*5, name: 'hours',type:'linear', label :"hour of the day"} ;
		var chd2 = new WGL.ChartDiv("charts","ch2", "hour of the day", "Hour of the day", 24);
		chd2.setDim(WGL.addLinearHistDimension(hours));		
		WGL.addLinearFilter(hours, 24*10, 'hoursF');		
		charts['hours'] = WGL.createStackBarChart(hours, "ch2", "hour of the day", 'hoursF');
		
		/*SERVELITY*/
		var sev   = {data: data.sev,  domain: data.sevEnum ,  name: 'sev', type:'ordinal', label : "accident servelity"};	
		var chd3 = new WGL.ChartDiv("charts","ch3", "accident severity", "Accident severity", 3);
		chd3.setDim(WGL.addOrdinalHistDimension(sev));
		WGL.addLinearFilter(sev,3, 'sevF');
		charts['sev']   = WGL.createStackBarChart(sev, "ch3", "accident severity",'sevF');
	
		/*Date*/
		var date =  {data: data.date,   min:data.dmm.min, max:data.dmm.max, num_bins: 365, name: 'date', type:'linear'} ;
		var chd5 = new WGL.ChartDiv("charts","ch5", "date", "Date", 365);
		chd5.setDim(WGL.addLinearHistDimension(date));
		WGL.addLinearFilter(date,date.num_bins, 'dateF');
		charts['date']  = WGL.createStackBarChart(date, "ch5", "Date ", 'dateF');
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
		var chd4 = new WGL.ChartDiv("charts","ch4", "speed limit", "Speed Limit", 6);
		chd4.setDim(WGL.addOrdinalHistDimension(sl));
		WGL.addLinearFilter(sl, 13, 'slF');
		charts['speedlimit'] = WGL.createStackBarChart(sl, "ch4", "Speed limit", 'slF');

		//identify
		var idt = WGL.addIdentifyDimension(data.pts, data.pts_id, 'idt', null, data);
		idt.onlySelected = false;
		idt.pointSize = 15;
		//idt.debug = true;



		
	
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
	
// point selection
    divname=$("[id$='_svgRoot']") // OpenLayers name DIV is dynamic by setup of OL, i.e. #OpenLayers_Layer_Vector_32_svgRoot
    pw = new WGL.ui.PopupWin(divname, "idt", "Accident Details", data.pts);
    pw.setProp2html(function (t) {
      var d =  (new Date(t.date*1000*60*60));

      var s = "<table>";
      s += "<tr><td width='100px'>Date: </td><td>"+d.toDateString()+"</td></tr>";
      s += "<tr><td>Time: </td><td>"+d.toLocaleTimeString()+"</td></tr>";
      s += "<tr><td>Severity: </td><td>"+t.sev+"</td></tr>";
      s += "<tr><td>Road Type: </td><td>"+t.road_type+"</td></tr>";
      s += "<tr><td>Speed Limit: </td><td>"+t.speed_limit+"</td></tr>";
      return s;
    });
    pw.setMovemap(function (dx, dy) {
      var llc = map.getCenter();
      var pxc = map.getPixelFromLonLat(llc);
      pxc.x -= dx;
      pxc.y -= dy;
      var ll = map.getLonLatFromPixel(pxc);
      map.setCenter(ll);
    });
    map.events.register("move",map,function () {
	var testElement = document.getElementById('wgl-point-win');
	if( testElement.classList.contains("wgl-active") ) {
		pw.zoommove(map.getZoom(), getTopLeftTC());
        }

    });
    // end point selection
		
		$("#slider_pc").on("input", function(){			
			 //mapdim.render2(this.value);	
			pc.reRender(this.value);		
		});
				
		
		$("#reset").on("click", function(){
			WGL.resetFilters();
			var lonlat = new OpenLayers.LonLat(-1.9, 52.5).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
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
