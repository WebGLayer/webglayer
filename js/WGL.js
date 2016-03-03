WGL = function(num, url, divid){
	
	GLU.loadShaders(url);
	var numrec = num;
	var manager  = new Manager(divid); 	
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
	var legends = [];
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
		try { manager.addDataBuffer(array2TA(data), 2, 'wPoint');}
		catch(err) {
			console.warn(err);
		};
		var dim = new MapDimension(manager, id);
		dimensions[id] = dim;
		return dim;
	}
	
	this.resize = function(){
		for (var i in dimensions){
			var d = dimensions[i];
			if (d.resize != undefined){				
					d.resize()				
			}
		}
		
		WGL.render();
	}
	
	this.addLegend = function(l){
		legends.push(l);
	}
	
	this.addHeatMapDimension = function(data, id){
		try { manager.addDataBuffer(array2TA(data), 2, 'wPoint');}
		catch(err) {
			console.warn(err);
		};		
		var dim = new HeatMapDimension(manager, id);
		dimensions[id] = dim;		
		return dim;
		
	}
	
	this.getDimensions = function(){
		return dimensions;
	}
	
	this.getDimension = function(name){
		return dimensions[name];
	}
	
	
	this.addParallelCoordinates = function(div, data){		
		var dim = new ParallelCoordinates(manager,div, data);
		dimensions[div] = dim;	
		return dim;
	}
	
	this.addLinearHistDimension = function(m){
		this.addData(m);
		var dim = new HistDimension(manager, m);
		dimensions[m.name] = dim;
		oneDDim[m.name]  = dim;
		manager.dimnum =  Object.keys(oneDDim).length;
		return dim;
	}
	
	this.addData = function(m){
		var ta = array2TANormLinear(m , m.num_bins);
		manager.addDataBuffer(ta, 1, m.name, m.min, m.max);
	}
	
	this.addOrdinalHistDimension = function(m){
		var ta = array2TANormOrdinal(m);
		manager.addDataBuffer(ta, 1, m.name);
		var dim = new HistDimension(manager, m);
		dim.setToOrdinal();
		dimensions[m.name] = dim;
		oneDDim[m.name]  = dim;
		manager.dimnum =  Object.keys(oneDDim).length;
		return dim;
	}
	
	
	this.addMultiDim = function(d){
		 var ta = [];		
		 /* add multiple dimension*/
		for (var i in d){
			
			var dim = d[i];
			//create typedarray of every dimension /
			if (dim.type=='ordinal'){
				ta[i] = array2TANormOrdinal(dim);
			} else if (dim.type =='linear'){
				ta[i] = array2TANormLinear(dim , dim.num_bins);
			} else {
				console.error('Dimension type missing or unknown for dim '+d);
			}
		}

		/*data array*/
		var td = [];
		
		/*artificially generated coordinates of each column*/
		var ti = [];
		
		/*index of each row*/
		var index_pc = [];

		/*connects all typed array to one big array*/
		for (var j in ta[0]){
			for(var i in ta){
				i =  parseInt(i);				
				index_pc.push(index[parseInt(j)]);
				td.push(ta[i][j]);
				ti.push(i / (d.length-1)) ;
			
				/*if not end point add twice to connect each line*/
				 if( !(i==0 || i==(ta.length-1)) ){
					 index_pc.push(index[parseInt(j)]);
					 td.push(ta[i][j]);
					 ti.push(i / (d.length-1));
				 }
				
			}
		}
		
		var ai=array2TA2D(index_pc);
		manager.num_of_attrib = d.length;
		manager.addDataBuffer(ai, 2, 'indexpc');
		//manager.addElementBuffer(new Uint16Array(indicies),1, 'indicies');
		manager.addDataBuffer(new Float32Array(td), 1, 'td');
		manager.addDataBuffer(new Float32Array(ti), 1, 'ti');
	}
	
	this.addLinearFilter = function(m, res, id){
		var d = dimensions[m.name];
		if (d == null){
			console.error('Cant set fitler to not defined dimension '+m.name);
		}
		var f = new LinearFilter(manager, m, res, id);//res);
		//d.filter = f;
		
		addFilter(m.name, id, f);
	}
	
	this.addPolyBrushFilter = function(name, id){
		var d = dimensions[name];
			if (typeof(d) == 'undefined'){
			throw ('Cant set fitler to not defined dimension '+name);
		}
		var polyFilter = new MapPolyFilter(manager);//res);
		addFilter(name, id, polyFilter);
		
		//d.filter = polyFilter;
	}
	
	this.addColorFilter = function(name, id){
		
		var colorFilter = new MapColorFilter(manager, dimensions[name]);//res);
		addFilter(name, id, colorFilter);
		
		return colorFilter;
		//d.filter = colorFilter;
	}

	/**
	 * adds a fitler to dimensiton
	 */
	var addFilter = function(dimid, filterid, filter){
		var d = dimensions[dimid];
		if (typeof(d) == 'undefined'){
			throw ('Cant set fitler to not defined dimension '+name);
		}
		
		if (d.filters == null) {
			d.filters = [];
		    d.filtersids=[];
		}
		d.filters[filterid] = filter; 
		 d.filtersids.push(filterid);
		
	}
	this.addExtentFilter = function(){
		var isspatial=false;
		for (i in dimensions){
			// check if there is spatial dimension
			if (dimensions[i].isSpatial) {isspatial=true};
		}
		if (!isspatial){throw "Can not set spatial filter without spatial dimension" }
		
		extf = new ExtentFilter(manager);
	}
	
	this.addCharts = function(ch){		
		charts = ch;	
	}

	this.getManager = function(){
		return manager;
	}		

	
	this.render = function(){		
		gl.viewport(0,0, manager.w, manager.h);
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	//renderr();	
	//mainFilter.readPixelsAll();
	//logFilterStatus();
		for (var i in dimensions){			
			dimensions[i].render(numrec);
			};
		WGL.updateCharts();
		//this.updateLegends();
		
			//console.log("render");
				
	}

	this.updateLegends = function(){
		for (var i in legends){			
			legends[i].update();
			};
	}
	
	var dim_ids;
	var dim_iter = 0;
	
	var renderr = function(){	
		if (dim_ids ==null){
			dim_ids = Object.keys(dimensions);
		}
	
		if (dim_iter < dim_ids.length){			
			dimensions[dim_ids[dim_iter]].render(numrec);	
			console.log("rendering "+dim_ids[dim_iter]);
			dim_iter++;
			requestAnimationFrame(renderr);
		} else {
			//WGL.updateCharts();
			WGL.updateCharts();
			dim_iter = 0;
		}		
	}
	
	this.initFilters = function(){
			mainFilter.applyFilterAll(dimensions);	
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
		for ( var i in charts) {
				var readout = dimensions[i].readPixels();
				if (typeof readout != 'undefined') {
				charts[i].update(readout);				
			}
		}		
	}
	
	
	this.filterByExt = function(){		
		//console.log("filter by ext triggerd");
		//this.render();
		//dimensions['heatmap'].render(numrec);
		/** update spatial filer */
		

	
		
		var needfilter = false;
		for (var i in dimensions){
			
			if (dimensions[i].isSpatial){
				for (var j in dimensions[i].filters){
					var f = dimensions[i].filters[j];
					if (f.isActive){
						//dimensions['heatmap'].render(numrec);
						f.updateFilter();
						needfilter = true;
						//f.createFilteringData();
						//f.renderFilter();
						//this.filterDim(i,j,f.saved_filter, false);
						//mainFilter.applyFilterDim(dimensions[i],j);		
					} 
				}
				if (needfilter) {setFiltersTrasholds()
					mainFilter.applyFilterAll(dimensions);	
				};
			}
		}
		//logFilterStatus();
		if (typeof(extf)!='undefined'){
			extf.render();
			//thisfilter = undefined;	
		}

		this.render();
		//this.updateLegends();
		
	}
	


	this.filterDim = function(id, filterId, filter, dorendering){
		var f = dimensions[id].filters[filterId];	
		
		if  ( filter.length==0){
			//console.log("filter deleted");
			this.filterDeleted(id, filterId);	
			thisfilter = undefined;					
			return;
			
		} else if ( filter.length>0 && (filterId!=thisfilter || typeof(thisfilter)=='undefined' )){
			//console.log('filter changed');
			//thatfilter = thisfilter;			
			thisfilter =  filterId;
			this.filterChanged(id, thisfilter);						
		} 

		
		
		f.createFilteringData(filter);
		f.renderFilter();
		//f.readPixels();

		//logFilterStatus();
		mainFilter.applyFilterDim(dimensions[id],filterId);		
		//console.log("filtering...:"+filter);

		if (dorendering==undefined || dorendering==true){
			this.render();
			this.updateCharts();
		}
		
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
	
	this.filterChanged = function(id, newf){
		/*apply all filters and set current to empty to select all the features*/		
	
		//logFilterStatus();
		//manager.filternum = getNumberOfActiveFilters();
		dimensions[id].filters[newf].isActive=true;	
		setFiltersTrasholds();
		//getFiltersTrasholds();
		/*render with this filter not active*/
		dimensions[id].filters[newf].isActive=false;	
		
		
		mainFilter.applyFilterAll(dimensions);	

			
		mainFilter.switchTextures();	
		dimensions[id].filters[newf].isActive=true;
		
	
		if (typeof(extf)!='undefined'){
			extf.render();
		}	
			
			
		//setFiltersTrasholds(); 
	}

	this.filterDeleted = function(id, newf){
	
		dimensions[id].filters[newf].isActive=false;	 	
		//manager.filternum = getNumberOfActiveFilters();
		setFiltersTrasholds();
		
		//logFilterStatus();
		mainFilter.applyFilterAll(dimensions);
		
		if (typeof(extf)!='undefined'){
			extf.render();
		}	
		
		//this.filterByExt();
		this.render();
		this.updateCharts();
		//mainFilter.switchTextures();
	}

	function setFiltersTrasholds(){
		var  trasholds = {allsum: 0.0, spatsum: 0.0};
		var  num = 0;
		for (var i in dimensions){
			//if (typeof(d.filter)!='undefined')
			for (var f in dimensions[i].filters){
				var f =dimensions[i].filters[f];			
				{ 
				if (f.isActive) {		
					//console.log("active filter on dim "+d.name+" "+num);
					f.index = num;	
					trasholds.allsum = trasholds.allsum + Math.pow(2,num);
					if (dimensions[i].isSpatial){
						trasholds.spatsum = trasholds.spatsum + Math.pow(2,num);
						manager.spIndex = num;
					}
					num++;								
				}
					else {
						if (dimensions[i].isSpatial){
						manager.spIndex = -1.; // index for nonspatial filter
					}
				}
			} 
		}
		}
		//console.log("trasholds "+trasholds.spatsum);
		manager.trasholds = trasholds;
		//return trasholds;
	}
	
	function logFilterStatus(){
		var el = document.getElementById("log");
		var t ="";
		for (var i in dimensions){		
				for (var j in dimensions[i].filters){
					var f = dimensions[i].filters[j];		
					
					  t = t + "-----<br/> dim "+ i + " filter " + j+"<br/>"
					  +  "index: "+f.index+ "<br/>"
					  +  "is active: "+f.isActive+ "<br/>"
					  +  "is spatial: "+f.isspatial+ "<br/>";
					

						
					}
				}
		t = t + "trasholds "+manager.trasholds.allsum+ " " +manager.trasholds.spatsum;
		el.innerHTML = t;
			
	}
	
	
	function getNumberOfActiveFilters(){
		var  num = 0;
		for (var i in dimensions){
			//if (typeof(d.filter)!='undefined')
			for (var f in dimensions[i].filters){
			var f =dimensions[i].filters[f];
			
			{ 
				if (f.isActive) {		
					//console.log("active filter on dim "+d.name+" "+num);
					f.index = num;	
					if (dimensions[i].isSpatial){
						manager.spIndex = num;
					}
					num++;								
				}
					else {
						if (dimensions[i].isSpatial){
						manager.spIndex = -1.; // index for nonspatial filter
					}
				}
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
		//var v = (value / c_size) / max_all * 2 - 1;mainFilter.
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
				val =  ( (m.data[i] - m.min) / (m.max - m.min) ) *  m.num_bins /max_bins ;//+  (1 /(2*max_bins)) ;
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
			//pts[i] = null;
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

