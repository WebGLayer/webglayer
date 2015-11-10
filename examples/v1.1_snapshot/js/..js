WGL = function(data, url){
	
	GLU.loadShaders(url);
	var numrec = data.num;
	var manager  = new Manager("map"); 	
	var rasterer = new Rasterer(numrec);
	var metadata = [];

	manager.num_rec = numrec;
	manager.index = "index";
	manager.r_size = rasterer.size;
	manager.wgl = this;
	manager.filternum = 0.;

	this.mcontroller = new MapController(manager);
	this.mcontroller.resize();
	
	var dimensions = [];
	var oneDDim = [];
	var thisfilter;
	var extf;
		
	var charts = [];
	var mainFilter = new Filter(manager);
	var polyFilter;
	
	
	
	var index = [];
	for (var i= 0; i<numrec; i++){
		index[i]=rasterer.calc(i);	
	}
	
	var indexta = array2TA2D(index);

	manager.addDataBuffer(indexta, 2, 'index');
	GLU.manager = manager;
	
	/*
	 * 
	 */
	this.addMapDimension = function(data, id){
		manager.addDataBuffer(array2TA(data), 2, 'wPoint');
		var dim = new MapDimension(manager);
		dimensions[id] = dim;
	}
	
	this.addHeatMapDimension = function(data, id){
		//manager.addDataBuffer(array2TA(data), 2, 'wPoint');
		var dim = new HeatMapDimension(manager);
		dimensions[id] = dim;
	}
	
	this.addLinearHistDimension = function(m){
		var ta = array2TANormLinear(m , m.num_bins);
		manager.addDataBuffer(ta, 1, m.name);
		var dim = new HistDimension(manager, m);
		dimensions[m.name] = dim;
		oneDDim[m.name]  = dim;
		manager.dimnum =  Object.keys(oneDDim).length;
	}
	
	this.addOrdinalHistDimension = function(m){
		var ta = array2TANormOrdinal(m);
		manager.addDataBuffer(ta, 1, m.name);
		var dim = new HistDimension(manager, m);
		dim.setToOrdinal();
		dimensions[m.name] = dim;
		oneDDim[m.name]  = dim;
		manager.dimnum =  Object.keys(oneDDim).length;
	}
	
	this.addLinearFilter = function(m, res, id){
		var d = dimensions[m.name];
		if (d == null){
			console.error('Cant set fitler to not defined dimension '+m.name);
		}
		var f = new LinearFilter(manager, m, res, id);//res);
		d.filter = f;
		//filters[id]= f;
		//manager.filternum =  Object.keys(filters).length;
	}
	
	this.addPolyBrushFilter = function(name, id){
		var d = dimensions[name];
			if (d == null){
			console.error('Cant set fitler to not defined dimension '+name);
		}
		var polyFilter = new MapPolyFilter(manager);//res);
		d.filter = polyFilter;
		//filters[id]= f;
		//manager.filternum =  Object.keys(filters).length;
	}

	this.addExtentFilter = function(){
		extf = new ExtentFilter(manager);
	}
	
	this.addCharts = function(ch){		
		charts = ch;	
	}

	this.getManager = function(){
		return manager;
	}		

	this.render = function(){	
	 	//console.log("filter num "+manager.filternum);	
		
		for (var i in dimensions){
			dimensions[i].render(numrec);
		}
		
	
	}
	this.initFilters = function(){
			mainFilter.render(dimensions);	
	}
	
	this.updateSizeOfMapDimensions = function(){
	
		for (var i in dimensions){
			var d = dimensions[i];
			if (typeof(d.createMapFramebuffer)!='undefined'){
				d.createMapFramebuffer();
			}

			if (typeof(d.filter) !='undefined'){
				if (typeof(d.filter.createMapFramebuffer) !='undefined'){
					d.filter.createMapFramebuffer();
				}
			}
		}
	}
	this.updateCharts = function(){				
			
		//console.log(WGL.readHist());
		//var readout =this.readHist();
		
		for ( var i in charts) {
				var readout = dimensions[i].readPixels();
				if (typeof readout != 'undefined') {
				charts[i].update(readout);				
			}
		}		
	}
	
	
	this.filterByExt = function(){		
	
		//mainFilter.render(dimensions);
		
		
		if (typeof(extf)!='undefined'){
			extf.render();
			thisfilter = undefined;	
		}
		this.render();
		this.updateCharts();
	}

	/*this.filterByPoly = function(id, polygons){
		var f = dimensions[id].filter;
		f.createFilteringData(polygons);
		f.renderFilter();
		manager.mapFilterTexture = f.filterTexture;
		mainFilter.render(dimensions);
		this.render();
		this.updateCharts();
	}*/


	
	this.filterDim = function(id, filter){
		var f = dimensions[id].filter;
		
	
		if (filter.length >0){
			f.isActive = true;				
		} else {
			f.isActive = false;		
		//	this.filterChanged(f);
		}				
		
		manager.filternum = getNumberOfActiveFilters();
		manager.noSpatialFilterNum =  getNumberOfNonSpatiolFilters();

		if (typeof(thisfilter)=='undefined' && filter.length>0){
			thisfilter = id;	
			this.filterChanged(thisfilter);				
		} 
		else if (id!=thisfilter){
			console.log('filter changed');
			//thatfilter = thisfilter;			
			thisfilter = id;
			this.filterChanged(thisfilter);						
		} 
		else if  (id==thisfilter && filter.length==0){
			console.log("filter deleted");
			this.filterDeleted(thisfilter);	
			thisfilter = undefined;		
		}

		
		f.createFilteringData(filter);
		f.renderFilter();
					//f.readPixels();

		mainFilter.applyFilter(dimensions[id]);		
		this.render();
		this.updateCharts();
		
		/** geting top k elemnts*/
		/* var sel = mainFilter.readPixels();
		var top = []
		console.log(sel.length);
		if(sel.length <500){
			for (var i = 0; i <10 ;i++ )
				top.push(data.hours[sel[i]]);
		}
		console.log(top);*/		
	}
	
	this.filterChanged = function(newf){
		/*apply all filter and set current to empty selected all the features*/		
	
		
		dimensions[newf].filter.isActive=true;	 	
		manager.filternum = getNumberOfActiveFilters();

		/*render with this filter not active*/
		dimensions[newf].filter.isActive=false;	
		
		
		mainFilter.render(dimensions);	
		extf.render();
		//mainFilter.switchTextures();
		this.render();
		this.updateCharts();
		mainFilter.switchTextures();
		
		/*us all selection as that filter*/

		/*aplly this as aggregation of both*/
	}

	this.filterDeleted = function(newf){
		/*apply all filter and set current to empty selected all the features*/		
	
		
		dimensions[newf].filter.isActive=false;	 	
		manager.filternum = getNumberOfActiveFilters();
		
		
		
		mainFilter.render(dimensions);
		
		this.render();
		this.filterByExt();
		this.updateCharts();
		mainFilter.switchTextures();
		
		/*us all selection as that filter*/

		/*aplly this as aggregation of both*/
	}

	function getNumberOfActiveFilters(){
		var  num = 0;
		for (var i in dimensions){
			var d =dimensions[i];
			if (typeof(d.filter)!='undefined')
			{ 
				if (d.filter.isActive) {		
					//console.log("active filter on dim "+d.name+" "+num);
					d.filter.index = num;	
					num++;								
					}
					else {
						//d.filter.index = -1;
					}
			} 
		}
		return num;
	}
	
	function getNumberOfNonSpatiolFilters(){
		var  num = 0;
		for (var i in dimensions){
			var d =dimensions[i];
			if (typeof(d.filter)!='undefined')
			{ 
				if (d.filter.isActive && !d.isSpatial) {		
					//console.log("active filter on dim "+d.name+" "+num);
					//d.filter.index = num;	
					num++;								
					}
					else {
						//d.filter.index = -1;
					}
			} 
		}
		return num;
	}
	
	/**
	 * calculates the value to max pixels between -1 -1;
	 */
	function normaliseByMax(value, max_all, this_min, this_max, this_num) {
		/* reduced value to 0-1 */
		// var c = value/ this_max;
		var s = (2/max_all) * ((this_max-this_min) / this_num);
		//var c_size = (this_max-this_min) / (this_num);
		//var v = (value / c_size) / max_all * 2 - 1;
		var v = s * (value - this_min) - 1 ;
		return v;
		// return 0.5;
	}
	
	function array2TANormOrdinal(m) {
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
	}
	
	function array2TANormLinear(m, max_bins) {
		pts_ar = new Float32Array(m.data.length);
		var i = 0;
		for (var i in m.data) {
			if (isNaN(m.data[i])) {
				val = 0.//-99999.			
				} 
			else {
				val =  ( (m.data[i] - m.min) / (m.max - m.min) ) *  m.num_bins /max_bins +  (1 /(2*max_bins)) ;
			}
			pts_ar[i] = val;
			//pts[i] = null;
		}
		return pts_ar;
	}

	
	function array2TANorm(m, max_bins) {
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

