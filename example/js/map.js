document.addEventListener('DOMContentLoaded', init, false);

var gllayer;
var cf;

var points;
var attributes;
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
	

	
	map.on('resize', function(){gllayer.resize();gllayer.render();});
	map.on('move', onMove);
	map.on('zoomstart', onMove);
	
	/**Helper function that reads the data and initialize the attributes, points and crossfilter*/
	loadData();
	
	/** init  the canvas */
	console.time("init") ; 
	gllayer = new WebglLayer("test", map.getContainer(), points, attributes);
	console.timeEnd("init") ; 
	
	/** Free the memory (data are loaded on GPU)*/
	points=null;	
	attributes = null;
	
	/**Call the method onMove to push the data from map to WebglLayer*/
	onMove();
	
	/**Render for the first time*/
	gllayer.render();

	/**Specify the on filter function for the Crossfilter*/
	cf.onFiltered(gllayer, gllayer.filter);
	
}
	


function onMove(){
	
	var tl = L.latLng(map.getBounds()._northEast.lat,
			map.getBounds()._southWest.lng);
	var offset = map.project(tl, 0);
	
	gllayer.move(map.getZoom(), offset);
	//filters = cf.filters;
	gllayer.render();
	
	
	var bb = map.getBounds();
	var neLat = bb._northEast.lat;
	var neLon = bb._northEast.lng;
	var swLat = bb._southWest.lat;
	var swLon = bb._southWest.lng;
	cf.latDimension.filter([ swLat, neLat ]);
	cf.lonDimension.filter([ swLon, neLon ]);	
	dc.redrawAll();
	//   var svg = d3.select("#dc-speed-chart").selectAll(".bar");
		//svg.attr("width", 5);
}


function loadData() {	
	//var pts = new Float32Array(10000);
	var pts =[];
	var attr =[];
	var j = 0;
	var jj = 0;
	console.time("parsing")
	$.ajaxSetup({"async" : false});
//	$.getJSON('../data/osm150k.js', function(data) {
	
	//	$.getJSON('http://localhost:8181/move/rest/pos_osm?num=200000', function(data) {	
	$.getJSON('../data/osm200k.js', function(data) { 
		$.each(data, function(i, val) {
			var v = map.options.crs.latLngToPoint(L.latLng(val.y, val.x),0);
			pts[j++] = v.x;
			pts[j++] = v.y;					
			val.hours = (new Date(val.time * 1000)).getHours()
			val.speed = Math.round(val.speed);	
			val.unit_id = val.unit_id%100000;	
			attr[jj++] = val.speed;		
			attr[jj++] = val.hours;
			attr[jj++] = val.time;
			attr[jj++] = val.road;	
			attr[jj++] = val.unit_id ;
		});	
		/*Create chart object*/
		cf = new ChartFilter(data);
	});			
	points      = array2TA(pts);
	attributes =  array2TA(attr);
	console.timeEnd("parsing")
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
