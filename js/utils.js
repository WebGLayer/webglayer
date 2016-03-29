WGL.utils = {
	/**
	 * calculates the value to max pixels between -1 -1;
	 */
	normaliseByMax : function(value, max_all, this_min, this_max, this_num) {
		/* reduced value to 0-1 */
		// var c = value/ this_max;
		var s = (2/max_all) * ((this_max-this_min) / this_num);
		//var c_size = (this_max-this_min) / (this_num);
		//var v = (value / c_size) / max_all * 2 - 1;mainFilter.
		var v = s * (value - this_min) - 1 ;
		return v;
		// return 0.5;
	},
	
	array2TANormOrdinal : function(m) {
		pts_ar = new Float32Array(m.data.length);
		var i = 0;
		m.num_bins = m.domain.length;
		m.min = 0.;
		m.max = m.num_bins;
		for (var i in m.data) {
		
			var bin = m.domain.indexOf(m.data[i]);
				if (bin == -1){
					console.warn('data out of range ' +(m.data[i]));
					val = -1;
				} else {
					val =  (bin+0.5) / m.num_bins ;
				}
			
			pts_ar[i] = val;
			//pts[i] = null;
		}
		return pts_ar;
	},
	
	array2TANormLinear : function(m, max_bins) {
		pts_ar = new Float32Array(m.data.length);
		var i = 0;
		for (var i in m.data) {
			if (isNaN(m.data[i])) {
				val = 0.//-99999.			
				} 
			else {
				val =  ( (m.data[i] - m.min) / (m.max - m.min) ) *  m.num_bins /max_bins ;//+  (1 /(2*max_bins)) ;
			}
			pts_ar[i] = val;
			//pts[i] = null;
		}
		return pts_ar;
	},

	
	array2TANorm : function(m, max_bins) {
		pts_ar = new Float32Array(m.data.length);
		var i = 0;
		for (var i in m.data) {
			if (isNaN(m.data[i])) {
				val = 0.//-99999.			
				} 
			else {
				val =  ( (m.data[i] - m.min) / (m.max - m.min) ) *  m.num_bins /max_bins ;//+  (1 /(3*max_bins)) ;
			}
			pts_ar[i] = val;
			//pts[i] = null;
		}
		return pts_ar;
	},
	
	array2TA2D : function(pts) {

		pts_ar = new Float32Array(pts.length * 2);
		var i = 0;
		var j = 0;
		for (var i = 0; i < pts.length; i++) {
			pts_ar[j++] = pts[i][0];
			pts_ar[j++] = pts[i][1];
			//pts[i] = null;
		}

		return pts_ar;
	},
	
	array2TA : function(pts) {
		pts_ar = new Float32Array(pts.length);
		var i = 0;
		for (var i = 0; i < pts.length; i++) {
			pts_ar[i] = pts[i];
			pts[i] = null;
		}
		return pts_ar;
	},
	
		
	Rasterer : function(max){
			this.size = Math.ceil(Math.sqrt(max));
			this.calc = function(value) {
				var y = Math.floor(value / this.size);
				var x = value - (this.size * y);
				return [ normalise(x, this.size), normalise(y, this.size) ];
				}
			var normalise =  function(value, max) {
				return value / max * 2 - 1 + (2 / (max * 2));
			}	
	},
	
	
};