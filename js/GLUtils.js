
function GLUtils() {

	// function dataupdateloop() {
	// util.createFilteringData(generateOneTriangle());
	// mcontroller.zoommove((Math.random() - 0.5) * 0.4, {
	// x : (Math.random() - 0.5) * 5,
	// y : 0
	// });
	//
	// request = window.requestAnimFrame(dataupdateloop);
	// };

	this.loadShaders = function(dom) {
		
		var domain;
		
		if (dom==null){
			 domain = 'http://localhost:9999/js/webglayer/';
		} else {
			domain = dom;
		}				
		
		$.ajaxSetup({
			async : false
		});

		$.get(domain+'shaders/shaders_linemap.glsl',
						function(data) {
							$("head").append(data);
						});

		$.get(domain+'shaders/shaders_hist.glsl',
						function(data) {
							$("head").append(data);
						});

		$.get(domain+'shaders/shaders_float.glsl',
				function(data) {
					$("head").append(data);
				});

		$.get(domain+'shaders/shaders_filter_generic.glsl',
						function(data) {
							$("head").append(data);
						});

		$.get(domain+'shaders/shaders_filterhist.glsl',
						function(data) {
							$("head").append(data);
						});
		
		$.get(domain+'shaders/shaders_map_interpolation.glsl', function(data) {
			$("head").append(data);
		});
		
		$.get(domain+'shaders/shaders_interpolation.glsl', function(data) {
			$("head").append(data);
		});

		$.get(domain+'shaders/shaders_linechart.glsl', function(data) {
			$("head").append(data);
		});
		
		$.get(domain+'shaders/shaders_sdlinechart.glsl', function(data) {
			$("head").append(data);
		});		
		
		$.get(domain+'shaders/shaders_map.glsl', function(data) {
			$("head").append(data);
		});
			
		$.get(domain+'shaders/shaders_heatmap.glsl', function(data) {
			$("head").append(data);
		});
		
		$.get(domain+'shaders/shaders_heatmap_render.glsl', function(data) {
			$("head").append(data);
		});
		
		$.get(domain+'shaders/shaders_max_calculator.glsl', function(data) {
			$("head").append(data);
		});
		
		
		$.ajaxSetup({
			async : true
		});
	}


	this.mapFilter = function() {
		// mapFilterRender.renderFilter();
		// allDataFilter.mapFilter = mapFilterRender.filterTexture;
		updateFilters();
	}
	this.histFilter = function() {
		this.histFilterRender.renderFilter();
		this.manager.histFilter = this.histFilterRender.filterTexture;
		updateFilters();
	}

	function updateFilters() {

		

		 GLU.render();
		//read();

	}

	function read() {
		readout = histDim.readPixels();
		if (typeof readout != 'undefined') {
			for ( var i in charts) {
				charts[i].update(readout[i]);
			}
		}
	}


	this.compileShaders = function(vs, fs){	
		var vertexSrc = document.getElementById(vs).text;
		var vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexShader, vertexSrc);
		gl.compileShader(vertexShader);

		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
			alert("An error occurred compiling the shaders: "
					+ gl.getShaderInfoLog(vertexShader));
			return null;
		}
		// create fragment shader
		var fragmentSrc = document.getElementById(fs).text;
		var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragmentShader, fragmentSrc);
		gl.compileShader(fragmentShader);

		if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
			alert("An error occurred compiling the shaders: "
					+ gl.getShaderInfoLog(vertexShader));
			return null;
		}
		// link shaders to create our program
		var pointProgram = gl.createProgram();
		gl.attachShader(pointProgram, vertexShader);
		gl.attachShader(pointProgram, fragmentShader);
		gl.linkProgram(pointProgram);
		return pointProgram;
	}
	

	



}

var GLU = new GLUtils();