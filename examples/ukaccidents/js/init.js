	var map, vectors, controls, pts, tlwgs, tl;
	
	
	function init() { 
			 
		metadata = [];
		initMap();
		GLU.loadShaders();
	
		//r_count = 1 * Math.pow(10, 5);
		manager = new Manager("map");
		mcontroller = new MapController(manager);

		/*top left corrner*/
		
	
		var data = new DataLoader();
		var rastersize = data.loadPosData("data/acc_snap.json");

	}

	function visualize(data){	
		pts = data.points;	
			 		
		manager.num_rec = data.num_rec;
		manager.index = "index";
		manager.r_size = data.raster_size;
	
		
		/**init geo buffer*/
		manager.addDataBuffer(data.points, 2, 'wPoint');
		manager.addDataBuffer(data.index, 2, 'index');
		manager.addDataBuffer(data.sev, 1, 'attr1');
		manager.addDataBuffer(data.dayes, 1, 'attr2');
		manager.addDataBuffer(data.hours, 1, 'attr3');
	
		GLU.manager = manager;
		/*init first attribute buffer*/			
		
		var metadata = [];
		metadata[0] = {max : 3, num_bins : 3, name: "attr1"};		
		metadata[1] = {max : 7, num_bins : 7, name: "attr2"};		
		metadata[2] = {max : 24, num_bins : 24, name: "attr3"};
		metadata.max_bins =metadata[2].num_bins;
		manager.metadata=metadata;

		charts = [];
		charts[0] = new StackedBarChart(3, 0, "chart1", "accident servelity", metadata);
		charts[1] = new StackedBarChart(7, 1, "chart2", "day of the week", metadata);
		charts[2] = new StackedBarChart(24, 2, "chart3", "hour of the day", metadata);
	//charts[1] = new StackedBarChart(metadata[4].max, 0, "chart2", "weather condition");
		
		initGLDimensions();
		//util.createFilteringData(generateOneTriangle());
	
	
		
		map.events.register("move", map, onMove);
		map.events.register("zoomstart", map, onZoom);	
	}
	
	
	function initGLDimensions(){
		manager.update();
		mcontroller = new MapController(manager);

		//canvas.setAttribute("width", div.offsetWidth);
		//canvas.setAttribute("height", div.offsetHeight);
		
		dimHeatMap  = new HeatMapDimension(manager);
		dimMap  = new MapDimension(manager);		
		dimHist = new HistogramDimension(manager, manager.metadata);
		
		GLU.histFilterRender = new HistFilterRender(manager);
		GLU.allDataFilter = new Filter(manager, manager.metadata);

		mcontroller.resize(manager.mapdiv.offsetWidth, manager.mapdiv.offsetHeight);
		
		tlwgs = (new OpenLayers.LonLat(-180, 90)).transform(
			new OpenLayers.Projection("EPSG:4326"),
		 	new OpenLayers.Projection("EPSG:900913"));	
		

		mcontroller.zoommove(map.zoom, getTopLeftTC(), render);	
		GLU.render = render;
		GLU.render();

	}
	
	function render(){		
		GLU.allDataFilter.render();
		manager.filterTexture = GLU.allDataFilter.filterTexture;
		
		dimHist.render(manager.num_rec);
		
		dimMap.render(manager.num_rec);
		dimHeatMap.render(manager.num_rec);
		var readout = dimHist.readPixels();
		if (typeof readout != 'undefined') {
				for ( var i in charts) {
					charts[i].update(readout[i]);
				}
		 }
		//var read = dimMap.readPixel();
		//console.log(readout);
	
		
	}
	
	var getTopLeftTC = function() {

		var s = Math.pow(2, map.getZoom());
		tlpixel = map.getViewPortPxFromLonLat(tlwgs);
		res = {
			x : -tlpixel.x / s,
			y : -tlpixel.y / s
		}
		//console.log(res);
		return res;
	}
	
	
	onMove = function() {
		mcontroller.zoommove(map.getZoom(), getTopLeftTC(), render);
				
		
	}
	
	onZoom = function() {
		mcontroller.zoommove(map.getZoom(), getTopLeftTC(), render);
	
		svgc.transform(map.getZoom(), getTopLeftTC());
	}
	

	