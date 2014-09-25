

function animloop() {
	var now = Date.now() / 1000; // get time in seconds
	// compute time since last frame
	var elapsedTime = now - then;
	then = now;
	// compute fps
	var fps = 1 / elapsedTime;
	fpsElement.textContent = fps.toFixed(2);
	render();
	request = window.requestAnimFrame(animloop);
};

function dataupdateloop() {
	util.createFilteringData(generateOneTriangle());
	mcontroller.zoommove((Math.random() - 0.5) * 0.4, {
		x : (Math.random() - 0.5) * 5,
		y : 0
	});

	request = window.requestAnimFrame(dataupdateloop);
};

function start() {
	if (!request) {
		animloop();
		//dataupdateloop();
	}
}

function stop() {
	if (request) {
		window.cancelAnimationFrame(request);
		request = undefined;
	}
}


function render() {

	util.renderFilter();
	manager.texture = util.filterTexture;
	manager.render();
	read();
	// gl.flush();
	// console.timeEnd(i + " rendering_all");
}

function read() {

	readout = dimSpeed.readPixels();
	if(readout!=null){
		chart.update(readout);
	}

	$("#data").text("in:"+readout[0] + "out: "+ readout[1]);
	//console.log(readout[0], readout[1]);
	
	// dimTime.readPixels();
}

// util.createFilteringData(generatePolygon(2,3));
// util.renderFilter();
// util.addDataToFilter(generatePolygon(2,3));
// util.renderFilter();

// dimSpeed.readFloatPixels();
// dimTime.readFloatPixels();

window.requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame
			|| window.mozRequestAnimationFrame || function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};
})();

function getTopLeftTC() {
	var tlwgs = new OpenLayers.LonLat(-180, 90);
	tlwgs.transform(wgs, merc);
	s = Math.pow(2, map.getZoom());
	tlpixel = map.getViewPortPxFromLonLat(tlwgs);
	res = {
		x : -tlpixel.x / s,
		y : -tlpixel.y / s
	}
	return res;
}

function onMove() {
	gllayer.move(map.getZoom(), getTopLeftTC());
	filters = cf.filters;
	gllayer.render();

	ex = map.getExtent().transform(merc, wgs);
	cf.latDimension.filter([ ex.bottom, ex.top ]);
	cf.lonDimension.filter([ ex.left, ex.right ]);
	dc.redrawAll();
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
function transformProj(p) {
	
	var v = map.getViewPortPxFromLonLat(p);
	// var v = map.getViewPortPxFromLonLat( new OpenLayers.LonLat(90,0));

	var v0 = toLevel0(v, tl, map.getZoom());
	return v0;
}

function transform(x, y) {
	var tl =getTopLeftTC();
	var p = new OpenLayers.LonLat(y, x);
	p.transform(wgs, map.projection);
	var v = map.getViewPortPxFromLonLat(p);
	// var v = map.getViewPortPxFromLonLat( new OpenLayers.LonLat(90,0));

	var v0 = toLevel0(v, tl, map.getZoom());
	return v0;
}