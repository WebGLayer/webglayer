
function GLUtils() {

	this.loadShaders = function(dom) {
		
		var domain;
		
		if (dom==null){
			 domain = 'http://localhost:9999/js/webglayer/';
			// domain = 'http://home.zcu.cz/~jezekjan/webglayer-gl-filter2/';
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
		
		$.get(domain+'shaders/shaders_floatreaderhistogram.glsl', function(data) {
			$("head").append(data);
		});
		
		$.get(domain+'shaders/shaders_heat_hist.glsl', function(data) {
			$("head").append(data);
		});

		$.get(domain+'shaders/shaders_linearhist.glsl', function(data) {
			$("head").append(data);
		});
		
		$.get(domain+'shaders/shaders_linearhist_param.glsl', function(data) {
			$("head").append(data);
		});
		
		$.get(domain+'shaders/shaders_filtermap.glsl', function(data) {
			$("head").append(data);
		});
		
		$.get(domain+'shaders/shaders_filter_extent.glsl', function(data) {
			$("head").append(data);
		});
		
		$.get(domain+'shaders/shaders_pc.glsl', function(data) {
			$("head").append(data);
		});
		
		$.get(domain+'shaders/shaders_colorfiltermap.glsl', function(data) {
			$("head").append(data);
		});
		$.get(domain+'shaders/shaders_pc_render.glsl', function(data) {
			$("head").append(data);
		});
		
		
		$.ajaxSetup({
			async : true
		});
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