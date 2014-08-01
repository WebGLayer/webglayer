document.addEventListener('DOMContentLoaded', init, false);

var gllayer;
var cf;

var points;
var attributes;
var pts;


var map;
function init() {
	
	map = L.map('map-div',{
	    center: [50, 14],
	    zoom: 6,
	    zoomAnimation: false
	});
	L.tileLayer('http://{s}.www.toolserver.org/tiles/bw-mapnik//{z}/{x}/{y}.png', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
	    maxZoom: 18
	}).addTo(map);
	

	
	loadData();

	addColor();
	// addDataD3(40);
	
	 
	cf.onFiltered(this, function(filter){
		console.time("filter");
		addDataD3(filter);
		
		/*
		   for (i=0; i< 200;i++){    
			  if (filter[0][0]< i && i < filter[0][1]){
				  p =  d3.selectAll(".leaflet-overlay-pane").selectAll('.speed'+i);
				  p.attr("opacity","0.8");
				  
			  } else {
				  p =  d3.selectAll(".leaflet-overlay-pane").selectAll('.speed'+i);
				  p.attr("opacity","0"); 
			  }
			
			
		}*/
		   console.timeEnd("filter");
	});

	function addColor(){
		 path =  d3.select(".leaflet-overlay-pane").selectAll("path");
		 path.data(pts);
		 path.attr("fill",function(d){
			 return  'rgba('+Math.round(255*(1-d.speed/180.))+','+Math.round(255*(d.speed/180.))+',0,0.8)';
			 });
		 path.attr("class", function(d){return 'speed'+Math.round(d.speed);})
		
	}
	function addDataD3(fil){
		 path =  d3.select(".leaflet-overlay-pane").selectAll("path");
		 path.style("visibility", function(d){
			 out = "visible";
			 if (d.speed <fil[0][0]  || d.speed>fil[0][1] ||
				 d.hours < fil[1][0] || d.hours > fil[1][1] ||
				 d.time < fil[2][0] || d.time > fil[2][1] ||
				 d.roud_type < fil[3][0] || d.roud_type > fil[3][1] ||
				 d.unit_id < fil[4][0] || d.unit_id > fil[4][1]){
				 out = "hidden";
			 }
			 return  out;
		 })
	}
}

function onMove(){
	
	var tl = L.latLng(map.getBounds()._northEast.lat,
			map.getBounds()._southWest.lng);
	var offset = map.project(tl, 0);		
	gllayer.move(map.getZoom(), offset);
	// filters = cf.filters;
	gllayer.render();
	
	var bb = map.getBounds();
	var neLat = bb._northEast.lat;
	var neLon = bb._northEast.lng;
	var swLat = bb._southWest.lat;
	var swLon = bb._southWest.lng;
	cf.latDimension.filter([ swLat, neLat ]);
	cf.lonDimension.filter([ swLon, neLon ]);	
	dc.redrawAll();
	// var svg = d3.select("#dc-speed-chart").selectAll(".bar");
		// svg.attr("width", 5);
}


function loadData() {	
	// var pts = new Float32Array(10000);
	pts =[];
	var attr =[];
	var j = 0;
	var jj = 0;
	var g = L.featureGroup();;
	$.ajaxSetup({"async" : false});
	$.getJSON('../data/5000_r.js', function(data) {
		$.each(data, function(i, val) {
			// var v = map.options.crs.latLngToPoint(L.latLng(val.y, val.x),0);
			
			//pts[j++] = val.x;					
			val.hours = (new Date(val.time * 1000)).getHours()
			val.speed = Math.round(val.speed);	
			val.unit_id = val.unit_id%100000;	
			attr[jj++] = val.speed;		
			attr[jj++] = val.hours;
			attr[jj++] = val.time;
			attr[jj++] = val.road_type;	
			attr[jj++] = val.unit_id ;
			pts[j++] = val;
			p = L.circle([val.y, val.x], 600,{
			//	color: 'rgba('+Math.round(255*(1-val.speed/180.))+','+Math.round(255*(val.speed/180.))+',0,0.8)',
			    fillOpacity: 0.8,
			    stroke: false
					})
			g.addLayer(p);
			
					
		});	
		//g.setStyle({className: "tt"} ) ;
		 g.addTo(map);
		/* Create chat object */
		cf = new ChartFilter(data);
	});			
	//points      = array2TA(pts);
	attributes =  array2TA(attr);
};



function array2TA(pts){
	pts_ar = new Float32Array(pts.length);
	i=0;
	for (var i = 0; i < pts.length; i++) {
	     pts_ar[i]=pts[i];
	     pts[i]=null;
	}
	
	return pts_ar;
}
