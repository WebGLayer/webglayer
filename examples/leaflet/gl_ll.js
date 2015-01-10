
//function dataupdateloop() {
//	util.createFilteringData(generateOneTriangle());
//	mcontroller.zoommove((Math.random() - 0.5) * 0.4, {
//		x : (Math.random() - 0.5) * 5,
//		y : 0
//	});
//
//	request = window.requestAnimFrame(dataupdateloop);
//};

function start() {
	mapFilterRender.renderFilter();
	histFilterRender.renderFilter();

	// histFilterRender.readPixels();

	allDataFilter.mapFilter = mapFilterRender.filterTexture;
	allDataFilter.histFilter = histFilterRender.filterTexture;

	allDataFilter.render();
	manager.filterTexture = allDataFilter.filterTexture;

	histDim.render();

	dimMap.render(manager.num_rec);

	read();
	/*
	 * if (!request) { animloop(); //dataupdateloop(); }
	 */
}




function mapFilter() {
	mapFilterRender.renderFilter();
	allDataFilter.mapFilter = mapFilterRender.filterTexture;
	updateFilters();
}
function histFilter() {
	histFilterRender.renderFilter();
	allDataFilter.histFilter = histFilterRender.filterTexture;
	updateFilters();
}


function updateFilters() {
	
	

	allDataFilter.render();
	manager.filterTexture = allDataFilter.filterTexture;
	dimMap.render(manager.num_rec);	
	histDim.render();
	read();
	


	

}

function read() {

	// readout = dimSpeed.readPixels();

	readout = histDim.readPixels();
	if (typeof readout != 'undefined') {
		for ( var i in charts) {
			charts[i].update(readout[i]);
		}

	}

	// $("#data").text("in:"+readout[0] + "out: "+ readout[1]);

	// dimTime.readPixels();
}

// util.createFilteringData(generatePolygon(2,3));
// util.renderFilter();
// util.addDataToFilter(generatePolygon(2,3));
// util.renderFilter();

// dimSpeed.readFloatPixels();
// dimTime.readFloatPixels();

function onMove(){	
	
	gllayer.move(map.getZoom(), v);
	filters = cf.filters;
	gllayer.render();	
	
	//cf.latDimension.filter([ swLat, neLat ]);
	//cf.lonDimension.filter([ swLon, neLon ]);	
	//dc.redrawAll();

}

function transform(x, y){
	var v = map.options.crs.latLngToPoint(L.latLng(x, y), 0);
	return v;
}


function getTopLeftTC() {
	var tl = L.latLng(map.getBounds()._northEast.lat,
			map.getBounds()._southWest.lng);
	var offset = map.project(tl, 0);
	return  offset;
}

/**
 * Transfares the coordinates to zoom level 0 in pixel coordiantes
 */
function toLevel0(pt, tl, zoom) {
	ts = 256;
	scale = Math.pow(2, zoom);
	pt.x = pt.x / scale + tl.x;
	pt.y = pt.y / scale + tl.y;
	return pt;
}

