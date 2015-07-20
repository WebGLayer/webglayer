WGL = function(numrec){
	
	GLU.loadShaders();		
	var manager  = new Manager("map"); 	
	var rasterer = new Rasterer(numrec);
	var metadata = [];
	var mainFilter;
	var histFilter;
	
	manager.num_rec = numrec;
	manager.index = "index";
	manager.r_size = rasterer.size;

	
	var dimensions = [];

	
	
	var index = [];
	for (var i= 0; i<numrec; i++){
		index[i]=rasterer.calc(i);	
	}
	
	var indexta = array2TA2D(index);

	manager.addDataBuffer(indexta, 2, 'index');

	
	/*
	 * 
	 */
	this.addMapDimension = function(data, id){
		manager.addDataBuffer(array2TA(data), 2, 'wPoint');
		var dim = new MapDimension(manager);
		dimensions[id] = dim;
	}
	
	/*
	 * 
	 */
	this.addHistogramDimension = function(o){
		var i =  Object.keys(metadata).length;
		o.index = i;
		metadata[o.name] = o;	
	}

	this.manager = function(){
		return manager;
	}

	this.readHist = function(){
		return dimensions['hist'].readPixels();
	}
	
	this.initHistograms = function(){
		var max_bins = 0;
		for (var i in metadata){
			
			if (metadata[i].max > max_bins) {max_bins = metadata[i].max } ;
		}
		manager.max_bins = max_bins;
		manager.dimnum = Object.keys(metadata).length;
		
		for (var i in metadata){
			var m = metadata[i];
			var ta = array2TANorm(m.data, m.min, max_bins);
			manager.addDataBuffer(ta, 1, m.name);
		}
		
		GLU.manager = manager;
		dimensions['hist'] = new HistogramDimension(manager, metadata);
	
		mainFilter = new Filter(manager, metadata);
		histFilter = new HistFilterRender(manager, metadata);
		
 		
	}

	this.render = function(){		
		
		for (var i in dimensions){
			dimensions[i].render(numrec);
		}
	
	}

	
	this.filterHist = function(id, f){		
		var h_filter = new Float32Array(f.length * 4);
		// console.log(h_filter.length);
		var j = 0;
		var ch_row = metadata[id].index;
		var m = metadata[id];
		for ( var i in f) {
			var y = ((ch_row + 0.5) / manager.dimnum) * 2 - 1;

			h_filter[j++] = normaliseByMax(f[i][0],manager.max_bins,
					m.max, m.num_bins);
			h_filter[j++] = y;

			h_filter[j++] = normaliseByMax(f[i][1], manager.max_bins,
					m.max, m.num_bins);
			h_filter[j++] = y;
		}

		histFilter.createFilteringData(ch_row, h_filter);
		histFilter.renderFilter();
		
		manager.histFilter = histFilter.filterTexture;
		mainFilter.render();
		manager.filterTexture = mainFilter.filterTexture;
		render();
	
	}
	/**
	 * calculates the value to max pixels between -1 -1;
	 */
	function normaliseByMax(value, max_all, this_max, this_num) {
		/* reduced value to 0-1 */
		// var c = value/ this_max;
		var c_size = this_max / this_num;
		var v = (value / c_size) / max_all * 2 - 1;
		
		return v;
		// return 0.5;
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
			//pts[i] = null;
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
	
	function array2TA(pts) {
		pts_ar = new Float32Array(pts.length);
		var i = 0;
		for (var i = 0; i < pts.length; i++) {
			pts_ar[i] = pts[i];
			pts[i] = null;
		}
		return pts_ar;
	}
	
	function Rasterer(max){
		this.size = Math.ceil(Math.sqrt(max));
		this.calc = function(value) {
			var y = Math.floor(value / this.size);
			var x = value - (this.size * y);

			return [ normalise(x, this.size), normalise(y, this.size) ];
		}
	}
	
	function normalise(value, max) {
		return value / max * 2 - 1 + (2 / (max * 2));
	}
}

