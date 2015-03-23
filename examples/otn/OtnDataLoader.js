function OtnDataLoader(fname) {
	this.points;
	this.attributes = [];

	this.index;
	this.cf;
	this.fname = fname;
	var that = this;
	var loadedfiles=0;

	/**
	 * Load text file
	 */
	 $("#speed_chart").text("Please wait... data are being loaded. This may take a while.");
	
	 this.loadPosData = function(file1, atrib_file1, file2, atrib_file2) {
	
		this.y2009 =[];
		this.y2020 =[];
		loadPos(file1, atrib_file1, this.y2009);				
		loadPos(file2, atrib_file2, this.y2020);		
	}

	 /**
	  * load positions
	  */
	 function loadPos(li, at, that){		
		
			var pts = [];		
			var index = [];
			var j = 0;
		
	

			d3.csv(li, function(error, data) {
				var rasterer = new Rasterer(data.length);
				index.r_size = rasterer.size;
				index.num_rec = data.length;		
				data.forEach(function(val, i) {
					{
						pts[j++] = parseFloat(val.x1);
						pts[j++] = parseFloat(val.y1);
						pts[j++] = parseFloat(val.x2);
						pts[j++] = parseFloat(val.y2);		
						index[i] = rasterer.calc(i);			      
					}
				});
				//that.points = [];
				that.points = array2TA(pts);		
				
				/*for (var i = 0; i < attr.length; i++) {
					//that.attributes[i] =  array2TATrig(attr[i]);
				}*/

				that.index =  array2TA2D(index);
				that.indexLine = array2TA2DLine(index);
				that.num_rec = index.num_rec;
				that.raster_size = index.r_size;
				
				loadedfiles++;
				
			});
			

					
					var attr = [];
					var attr1 = [];		
						
					d3.csv(at, function(error, data) {
						var frame = 0;
						var item = 0;
						var min = Number.MAX_VALUE;
						var max = Number.MIN_VALUE;
						
						
						data.forEach(function(val, i) {		
							if (item==0){attr[frame] = [];}									
							val.fval = parseFloat(val.value);
							if (val.fval <min) {min = val.fval };
							if (val.fval >max) {max = val.fval };
						
							attr[frame][item] =(val.fval );				
							attr[frame][item] =(val.value);
							
							if (item == that.num_rec-1){					
								frame++;
								item=0;						
							} else {
								item++;
							}
							
						});
						for (var j=0 ; j < attr.length; j++ ){
							attr1[j]=  array2TANorm(attr[j], min, (max-min));
							attr[j]=  array2TA2Norm(attr[j], min, (max-min));							
						
						}

						that.attributes = attr;
						that.attributes1 = attr1;		
						loadedfiles++;
						tryVisualize(loadedfiles);
					});	
			 
	 }
	 

	 
	tryVisualize = function(num){
		if (num == 4){
			visualize(that);	
		}
		
	}
	/**
	 * calculates the value to max pixels between -1 -1;
	 */
	Rasterer = function(max) {
		this.size = Math.ceil(Math.sqrt(max));

		this.calc = function(value) {
			var y = Math.floor(value / this.size);
			var x = value - (this.size * y);

			return [ normalise(x, this.size), normalise(y, this.size) ];
		}

	}

	/**
	 * calculates the value to max pixels between -1 -1;
	 */
	normaliseByMax = function(value, max_all, this_max, this_num) {
		/* reduced value to 0-1 */
		// var c = value/ this_max;
		var c_size = this_max / this_num;
		var v = (value / c_size) / max_all * 2 - 1;
		
		return v;
		// return 0.5;
	}

	/**
	 * calculates the value to max pixels between -1 -1;
	 */
	function normalise(value, max) {
		return value / max * 2 - 1 + (2 / (max * 2));
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
	
	function array2TATrig(pts) {
		pts_ar = new Float32Array(pts.length*3);
		var kk = 0;
		for (var i = 0; i < pts.length; i++) {
			pts_ar[kk++] = pts[i];
			pts_ar[kk++] = pts[i];
			pts_ar[kk++] = pts[i];
			pts[i] = null;
		}
		return pts_ar;
	}
	
	function array2TA2Norm(pts, min, norm) {
		pts_ar = new Float32Array(pts.length*2);
		var kk = 0;
		for (var i = 0; i < pts.length; i++) {
			var val = (pts[i]-min)/norm;
			pts_ar[kk++] = Math.log(val*10+1);
			pts_ar[kk++] = Math.log(val*10+1);						
		}
		return pts_ar;
	}
		
	function array2TANorm(pts, min, norm) {
		pts_ar = new Float32Array(pts.length);
		var kk = 0;
		for (var i = 0; i < pts.length; i++) {
			var val = (pts[i]-min)/norm;
			pts_ar[kk++] = Math.log(val*10+1);							
		}
		return pts_ar;
	}
		
	function array2TA2D(pts) {

		pts_ar = new Float32Array(pts.length * 2);
		var i = 0;
		var j = 0;
		for (var i = 0; i < pts.length; i++) {

			pts_ar[j++] = pts[i][0];
			pts_ar[j++] = pts[i][1];
			//pts[i] = null;
		}

		return pts_ar;
	}
	function array2TA2DLine(pts) {

		pts_ar = new Float32Array(pts.length * 4);
		var i = 0;
		var j = 0;
		for (var i = 0; i < pts.length; i++) {

			pts_ar[j++] = pts[i][0];
			pts_ar[j++] = pts[i][1];
			pts_ar[j++] = pts[i][0];
			pts_ar[j++] = pts[i][1];
			
			//pts[i] = null;
		}

		return pts_ar;
	}
}
