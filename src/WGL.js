var WGL = (function() {



	/** private part* */

	var manager, rasterer;
	
	var oneDDim;
	var charts;
	var legends;
	var index;
	var u;
	this.utils = u;
	
	var setVars = function(){
			oneDDim = [];
			charts = [];
			legends = [];
			index = [];
	}

	var addFilter = function(dimid, filterid, filter) {
		var d = WGL._dimensions[dimid];
		if (typeof (d) == 'undefined') {
			throw ('Cant set fitler to not defined dimension ' + name);
		}

		if (d.filters == null) {
			d.filters = [];
			d.filtersids = [];
		}
		d.filters[filterid] = filter;
		d.filtersids.push(filterid);
	};

	/** public part* */
	return {
		
		/* Internal helper classes */
		internal : {},
			
		/* Dimensions package */
		dimension : {},
		
		/*Filters package*/
		filter :{},
		/*Filters package*/
		experimental : {},
		ui : {},
		
		/* */
		filterutils: {},
		
		numrec : {},
			

		/* MAIN INTITAIZATION */
		init : function(num, url, divid, mapcontainerid) {
			setVars();			
			u = this.utils;
			manager = new WGL.internal.Manager(divid,  mapcontainerid);			
			WGL.internal.GLUtils.loadShaders(url);
			
			rasterer = new u.Rasterer(num);		
			manager.num_rec = num;
			manager.r_size = rasterer.size;
				
			this._mainFilter = new WGL.internal.Filter();

			this._dimensions = [];
			
			this.mcontroller = new WGL.internal.MapController();
			this.mcontroller.resize();
			
						
			for (var i = 0; i < manager.num_rec; i++) {
				index[i] = rasterer.calc(i);
			}

			var indexta = u.array2TA2D(index);
			manager.addDataBuffer(indexta, 2, 'index');

		},

		getManager : function() {
			return manager;
		},
		
		
		getRasterSize: function(){
			return rasterer.size;
		},
		
		
		/**
		 * Adding dimensions
		 */
		addMapDimension : function(data, id) {
			try {
				manager.addDataBuffer(u.array2TA(data), 2, 'wPoint');
			} catch (err) {
				console.warn(err);
			}
			;
			var dim = new WGL.dimension.MapDimension(id);
			this._dimensions[id] = dim;
			return dim;
		},

		addLineDimension : function(data, id) {
		//	try {				

				var triglines = u.array2TALines(data);
				manager.addDataBuffer(triglines.pts, 2, 'wPoint');
				manager.addDataBuffer(triglines.norm, 2, 'normals');
				manager.addElementBuffer(triglines.indicies, 1, 'indicies');

			//} catch (err) {
			//	console.warn(err);
			//}
			;
			var dim = new WGL.dimension.LineDimension(id);

			dim.num = triglines.num;
			
			this._dimensions[id] = dim;
			return dim;
		},
		
		addHeatMapDimension : function(data, id) {
			try {
				manager.addDataBuffer(u.array2TA(data), 2, 'wPoint');
			} catch (err) {
				console.warn(err);
			}
			;
			var dim = new WGL.dimension.HeatMapDimension(id);
			this._dimensions[id] = dim;
			return dim;
		},

		addLinearHistDimension : function(m) {
			var ta = u.array2TANormLinear(m, m.num_bins);
			manager.addDataBuffer(ta, 1, m.name, m.min, m.max);
			var dim = new WGL.dimension.HistDimension(m);
			this._dimensions[m.name] = dim;
			oneDDim[m.name] = dim;
			manager.dimnum = Object.keys(oneDDim).length;
			return dim;
		},

		addOrdinalHistDimension : function(m) {
			var ta = u.array2TANormOrdinal(m);
			manager.addDataBuffer(ta, 1, m.name);
			var dim = new WGL.dimension.HistDimension(m);
			dim.setToOrdinal();
			this._dimensions[m.name] = dim;
			oneDDim[m.name] = dim;
			manager.dimnum = Object.keys(oneDDim).length;
			return dim;
		},
		
		addMultiDim : function(d){
			 var ta = [];		
			 /* add multiple dimension*/
			for (var i in d){
				
				var dim = d[i];
				//create typedarray of every dimension /
				if (dim.type=='ordinal'){
					ta[i] = u.array2TANormOrdinal(dim);
				} else if (dim.type =='linear'){
					ta[i] = u.array2TANormLinear(dim , dim.num_bins);
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
			var ai=u.array2TA2D(index_pc);
			manager.num_of_attrib = d.length;
			manager.addDataBuffer(ai, 2, 'indexpc');
			//manager.addElementBuffer(new Uint16Array(indicies),1, 'indicies');
			manager.addDataBuffer(new Float32Array(td), 1, 'td');
			manager.addDataBuffer(new Float32Array(ti), 1, 'ti');
		},
		
		addParallelCoordinates : function(div, data){		
			var dim = new WGL.dimension.ParallelCoordinates(div, data);
			this._dimensions[div] = dim;	
			return dim;
		},
		

		/** Adding filters */
		addLinearFilter : function(m, res, id) {
			var d = this._dimensions[m.name];
			if (d == null) {
				console.error('Cant set fitler to not defined dimension '
						+ m.name);
			}
			var f = new WGL.filter.LinearFilter(m, res, id);// res);
			addFilter(m.name, id, f);
		},

		addPolyBrushFilter : function(name, id) {
			var d = this._dimensions[name];
			if (typeof (d) == 'undefined') {
				throw ('Cant set fitler to not defined dimension ' + name);
			}
			var polyFilter = new WGL.filter.MapPolyFilter();// res);
			addFilter(name, id, polyFilter);
		},

		addColorFilter : function(name, id) {
			var colorFilter = new WGL.filter.MapColorFilter(this._dimensions[name]);// res);
			addFilter(name, id, colorFilter);
			return colorFilter;
		},

		addExtentFilter : function() {
			var isspatial = false;
			for (i in this._dimensions) {
				// check if there is spatial dimension
				if (this._dimensions[i].isSpatial) {
					isspatial = true
				}
			}
			if (!isspatial) {
				throw "Can not set spatial filter without spatial dimension"
			}
			extf = new WGL.filter.ExtentFilter();
		},

		resetFilters : function() {
			
			
			for (var i in charts) {
				var ch = charts[i];
				ch.brush.clear();
			}
			
			for (var i in legends) {
				var l = legends[i];
				l.reset();
				//l.brush.clear();
				//l.brush.call(l.brushed);
				//try { 
					//d3.selectAll(".brush").call(l.brush)
					//}
				//catch (err){console.log(err)};
			}
			for (var i in this._dimensions) {
				if (this._dimensions[i].reset!= undefined){
						this._dimensions[i].reset();
					}	
				for (var f in this._dimensions[i].filters) {
					this._dimensions[i].filters[f].isActive = false;
															
				}
			}
			this.setFiltersTrasholds();
			this._mainFilter.applyFilterAll(this._dimensions);
			this.render();
		},
		/* Adding UI */

		addCharts : function(ch) {
			charts = ch;
		},

		addLegend : function(l) {
			legends.push(l);
		},

		initFilters : function() {
			this._mainFilter.applyFilterAll(this._dimensions);
		},
		
		updateCharts : function(){						
			for ( var i in charts) {
					if (this._dimensions[i].visible){										
						var readout = this._dimensions[i].readPixels();
						if (typeof readout != 'undefined') {
							charts[i].update(readout);		
					}		
				}
			}		
		},
		
		resize : function(){			
				for (var i in this._dimensions){
					var d = this._dimensions[i];
					if (d.resize != undefined){				
							d.resize()				
					}
				}		
				this.render();
			
		}
		
	
	};
	
}());
