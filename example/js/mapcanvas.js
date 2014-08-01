document.addEventListener('DOMContentLoaded', init, false);

var gllayer;
var cf;

var points;
var attributes;


var filter;
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
	

	
	
    var BigPointLayer = L.CanvasLayer.extend({

        renderCircle: function(ctx, point, radius, col) {
         /* ctx.fillStyle = col;
          ctx.strokeStyle = col;
          ctx.beginPath();
          ctx.arc(point.x, point.y, radius, 0, Math.PI * 2.0, true, true);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();*/
        	ctx.fillStyle = col; 
        	ctx.fillRect(point.x, point.y, size,size);
        },

 
        render: function() {
          var canvas = this.getCanvas();
          var ctx = canvas.getContext('2d');

          // clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          for (i=0; i< 1000;i++){        	           
          // get center from the map (projected)
         
        	  size=5;
          for (jj=0; jj< 5; jj++){        	
        	 if ( (cf.filters[jj][0] > attributes[i*5+jj]) || (attributes[i*5+jj]  >= cf.filters[jj][1])){
        		size=0;        		 
        	 }         	
          }
          var point = this._map.latLngToContainerPoint(new L.LatLng(points[2*i], points[2*i+1]));
     	  this.renderCircle(ctx, point, size, 'rgba('+Math.round(255*(1-attributes[i*5]/180.))+','+Math.round(255*(attributes[i*5]/180.))+',0,0.8)');
     
          this.redraw();

        }}
      });
    
    var layer = new BigPointLayer();
    layer.addTo(map);
	
	
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
	var pts =[];
	var attr =[];
	var j = 0;
	var jj = 0;
	$.ajaxSetup({"async" : false});
	$.getJSON('../data/500_r.js', function(data) {
		$.each(data, function(i, val) {
			// var v = map.options.crs.latLngToPoint(L.latLng(val.y, val.x),0);
			pts[j++] = val.y;
			pts[j++] = val.x;					
			val.hours = (new Date(val.time * 1000)).getHours()
			val.speed = Math.round(val.speed);	
			val.unit_id = val.unit_id%100000;	
			attr[jj++] = val.speed;		
			attr[jj++] = val.hours;
			attr[jj++] = val.time;
			attr[jj++] = val.road;	
			attr[jj++] = val.unit_id ;
		});	
		/* Create chat object */
		cf = new ChartFilter(data);
	});			
	points      = array2TA(pts);
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
