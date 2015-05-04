function DataLoader(fname) {
	this.points;
	this.attributes = [];

	this.index;
	this.cf;
	this.fname = fname;
	
	this.valmin=0;
	this.valmax=0;
	var that = this;

	/**
	 * Load text file
	 */
	 $("#speed_chart").text("Please wait... data are being loaded. This may take a while.");
	
	 DataLoader.prototype.loadPosData = function(file, atrib_file) {
		
		var xy = [];
		var pts = [];
		this.ptsxy = [];
		var attr = [];
		var index = [];
		var attr_line=[];
		var times=[];

		var j = 0;
		var jj = 0;
		var kk = 0;
		
		var pos_ready=false;
		var obs_ready=false;
		/**
		 * load positions
		 */
		d3.csv(file, function(error, data) {

			var rasterer = new Rasterer(data.length);
			index.r_size = rasterer.size;
			index.num_rec = data.length;

			var uids = [];
			
			data.forEach(function(val, i) {
				{
					// var v = transform(val.y, val.x);
					
				/*
				 * pts[j++] = parseFloat(val.x); pts[j++] = parseFloat(val.y);
				 */
					attr_line[i] = [];
					pts[j++] = parseFloat(val.x)+0.6;
					pts[j++] = parseFloat(val.y);
					pts[j++] = parseFloat(val.x)-0.3;
					pts[j++] = parseFloat(val.y)-4.5;
					pts[j++] = parseFloat(val.x)-0.3;
					pts[j++] = parseFloat(val.y)+4.5;
					
					xy[kk++] =parseFloat(val.x);
					xy[kk++] =parseFloat(val.y);
					uids[i] = val.unit_id;	
			
					that.ptsxy[i] =[];
					that.ptsxy[i].x=parseFloat(val.x);
					that.ptsxy[i].y=parseFloat(val.y);
					that.ptsxy[i].uid=val.unit_id;
					index[i] = rasterer.calc(i);			      
				}
			});
			that.points = array2TA(pts);
			that.pointsxy = array2TATrig2(xy);
			
			that.ptsxy = addcolors(that.ptsxy);
			
			/*for (var i = 0; i < attr.length; i++) {
				//that.attributes[i] =  array2TATrig(attr[i]);
			}*/

			that.index =  array2TATrig(index);
			that.num_rec = index.num_rec;
			that.raster_size = index.r_size;			
		
			/**
			 * loading attributes
			 */
			
			d3.csv(atrib_file, function(error, data){
				var min = Number.MAX_VALUE;
				var max = Number.MIN_VALUE;
				var timeframe = null;
				var times = [];
				var timest= [] ;
				var frame = 0;
				var uidcount = 0;
				data.forEach(function(val, i) {		
					var time = val.time_stamp;
					var obsval = parseFloat(val.value);
					if (timeframe == null){timeframe = time; attr[frame]=[];times[frame] = frame; timest[frame] =  new Date(time*1000);}
				
					if (timeframe!=time){	
						/*new time series*/
						frame++;
						attr[frame]=[];						
						timeframe=time;
						times[frame] = frame;//new Date(time*1000);//frame;//time;
						timest[frame] = new Date(time*1000);
						uidcount = 0;
					}	
					attr_line[uidcount][frame] = obsval;
					attr[frame][uidcount++] = obsval;
					if (obsval < min) {min = obsval };
					if (obsval > max) {max = obsval };
				
									
				});

				/**covert to typed array*/

				that.valmax = max;
				that.valmin =min;
				
				for (var j in attr ){
					attr[j]=  array2TATrigNorm(attr[j], min, (max-min));		
				}
				for (var j in attr_line){
					//attr_line[j]=  new Float32Array(attr_line[j]);
					attr_line[j]=  array2TA(attr_line[j]);	
				}
				
				frameindex =   array2TANorm(times, 0, times.length);
				
				
				that.attributes = attr;
				that.attributes_line= attr_line;
				that.findex = frameindex;
				that.timest = timest;
				//that.times = times;
				visualize(that);
			});
			/*d3.csv(atrib_file, function(error, data) {
				var frame = 0;
				var item = 0;
				var min = Number.MAX_VALUE;
				var max = Number.MIN_VALUE;
				
				
				data.forEach(function(val, i) {		
					var time = val.time_stamp;
					var uid = val.unit_id;
					var val = parseFloat(val.value);
					
					
					if (attr[time] ==null) {attr[time] = []; }					
					if (attr_line[uid] == null) {attr_line[uid] =[];};
					
				
					if (val < min) {min = val };
					if (val > max) {max = val };
				
					attr[time][uid] =val;
					
					attr_line[uid][time]= val;		
					frameindex[time] = time;
					
				});
				
				var pom=0;
				for (var j in attr ){
					attr[pom++]=  array2TATrigNorm(attr[j], min, (max-min));		
				}
				
				var pom=0;
				for (var j in attr_line.length){
					attr_line[pom++]=  new Float32Array(attr_line[j]);				
				}
				frameindex = new  array2TAnorm(frameindex, frameindex.length);
				that.attributes = attr;
				that.attributes_line= attr_line;
				that.findex = frameindex;
				visualize(that);		
			});*/
		});
		/**
		 * Load attributes
		 */		
		
		// return ;
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
	
	function array2TANorm(pts, min, norm) {
		pts_ar = new Float32Array(pts.length);
		var i = 0;
		for (var i in pts) {
			if (isNaN(pts[i])) {
				val = 0.//-99999.			
				} 
			else {
				val =  (pts[i] - min)/norm;
			}
			pts_ar[i] = val;
			pts[i] = null;
		}
		return pts_ar;
	}
	function array2TA(pts) {
		pts_ar = new Float32Array(pts.length);
		var i = 0;
		for (var i in pts) {
			if (isNaN(pts[i])) {
				val = -99999.			
				} 
			else {
				val =  pts[i];
			}
			pts_ar[i] = val;
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
	
	function array2TATrigNorm(pts, min, norm) {
		pts_ar = new Float32Array(pts.length*3);
		var kk = 0;
		for (var i in pts) {
			var val;
			if (isNaN(pts[i])) {
				val = -99999.			
				} 
			else {
				val = (pts[i]-min)/norm; 
				}
			pts_ar[kk++] = val;
			pts_ar[kk++] = val;
			pts_ar[kk++] = val;
			pts[i] = null;
		}
		return pts_ar;
	}
	
	function array2TATrig2(pts) {
		pts_ar = new Float32Array(pts.length*3);
		var kk = 0;
		for (var i = 0; i < pts.length; i=i+2) {
			pts_ar[kk++] = pts[i];
			pts_ar[kk++] = pts[i+1];
			pts_ar[kk++] = pts[i];
			pts_ar[kk++] = pts[i+1];
			pts_ar[kk++] = pts[i];
			pts_ar[kk++] = pts[i+1];
			
			pts[i] = null;
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
			pts[i] = null;
		}

		return pts_ar;
	}
	
	function addcolors(pts){
		var colors = d3.scale.category20();
		
		for (var i = 0; i < pts.length; i++) {
			pts[i].col = colors(i);			
		}
		return pts;
	}
}
