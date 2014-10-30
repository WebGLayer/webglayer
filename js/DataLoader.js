function DataLoader(fname) {
	this.points;
	this.attributes = [];

	this.index;
	this.cf;
	this.fname = fname;
	var that = this;

	DataLoader.prototype.loadData = function() {
		
		var pts = [];
		
		/*Configure speed dimension*/
		var attr = [];

		var index = [];
		
		var j = 0;
		var jj = 0;
		
		
		
		console.time("parsing")
		$.ajaxSetup({
			"async" : false
		});
		// $.getJSON('../data/osm150k.js', function(data) {
		// $.getJSON('http://localhost:8181/move/rest/pos_osm?num=200000',
		// function(data) {
		$.getJSON(this.fname, function(data) {
			
			var rasterer = new Rasterer(data.length);
			index.r_size = rasterer.size;
			index.num_rec = data.length;
			
			for (var m =0; m< metadata.length; m++){
				attr[m] =[];
			}
			
			$.each(data, function(i, val) {
				// var v = map.options.crs.latLngToPoint(L.latLng(val.y,
				// val.x),0);
				var v = transform(val.y, val.x);
				pts[j++] = v.x;
				pts[j++] = v.y;

				//console.log(v.x + " " + v.y);

				val.hours = (new Date(val.time * 1000)).getHours()
				val.speed = val.speed;
				val.unit_id = val.unit_id % 100000;
		
				
			
				for (var m =0; m< metadata.length; m++){
					attr[m][i]= normaliseByMax(val[metadata[m].name], 
							metadata.max_bins, 
							metadata[m].max, 
							metadata[m].num_bins);
				}
				
			
			//	attr_hours[m]  = normaliseByMax(val.hours, this.metadata.max_bins, attr_hours.max, attr_hours.num_bins);		
				//index[i] =  normalise(i,data.length);
				index[i] = rasterer.calc(i);
				

			});
			
		});
		
		
		this.points = array2TA(pts);
		
		for (var i =0 ; i< attr.length; i++){
			this.attributes[i] = array2TA(attr[i]);
		}	
		
		
		this.index = array2TA2D(index);
		this.num_rec = index.num_rec;
		return index.r_size;
		
	};

	/**
	 * calculates the value to max pixels between -1 -1;
	 */
	Rasterer = function(max){
		this.size = Math.ceil(Math.sqrt(max));
		
		this.calc = function(value){
			var y = Math.floor(value/this.size);
			var x =value-(this.size*y);
			
			return [normalise(x,this.size), normalise(y,this.size)];
		}
			
	}
	
	
	/**
	 * calculates the value to max pixels between -1 -1;
	 */
	normaliseByMax = function(value, max_all, this_max, this_num){
		/*reduced value to 0-1*/
		//var c = value/ this_max;
		var c_size =  this_max / this_num;
		var v =  (value / c_size)/max_all*2 - 1 ;
		
		return v;
		//return 0.5;
	}
	
	/**
	 * calculates the value to max pixels between -1 -1;
	 */
	function normalise(value,max){
		return value/max*2 -1 +(2/(max*2));
	}
	function array2TA(pts) {
		pts_ar = new Float32Array(pts.length);
		var i = 0;
		for (var i = 0; i < pts.length; i++) {
			pts_ar[i] = pts[i];
			pts[i] = null;
		}
		return pts_ar;
	}
	function array2TA2D(pts) {
		
		pts_ar = new Float32Array(pts.length*2);
		var i = 0;
		var j = 0;
		for (var i = 0; i < pts.length; i++) {
			
			pts_ar[j++] = pts[i][0];
			pts_ar[j++] = pts[i][1];
			pts[i] = null;
		}

		return pts_ar;
	}
}
