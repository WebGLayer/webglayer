function DataLoader() {
	this.points;
	this.attributes;
	this.cf;
	var that = this;

	DataLoader.prototype.loadData = function(transform) {

		var pts = [];
		var attr = [];
		var j = 0;
		var jj = 0;
		console.time("parsing")
		$.ajaxSetup({
			"async" : false
		});
		// $.getJSON('../data/osm150k.js', function(data) {
		// $.getJSON('http://localhost:8181/move/rest/pos_osm?num=200000',
		// function(data) {
		$.getJSON('../data/osm10k.js', function(data) {
			$.each(data, function(i, val) {
				// var v = map.options.crs.latLngToPoint(L.latLng(val.y,
				// val.x),0);
				var v = transform(val.y, val.x);
				pts[j++] = v.x;
				pts[j++] = v.y;

				//console.log(v.x + " " + v.y);

				val.hours = (new Date(val.time * 1000)).getHours()
				val.speed = Math.round(val.speed);
				val.unit_id = val.unit_id % 100000;
				attr[jj++] = val.speed;
				
			});
			
		});
		this.points = array2TA(pts);
		this.attributes = array2TA(attr);
		
	};

	function array2TA(pts) {
		pts_ar = new Float32Array(pts.length);
		i = 0;
		for (var i = 0; i < pts.length; i++) {
			pts_ar[i] = pts[i];
			pts[i] = null;
		}

		return pts_ar;
	}
}
