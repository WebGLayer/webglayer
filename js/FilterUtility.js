function FilterUtility(manager){	
	var manager = manager;
	var gl = manager.getGL();
	var canvas = manager.getCanvas();
	var div = manager.getDiv();
	var posBuffer = gl.createBuffer();
	
	this.filterProgram = null;

	
	this.setProgram = function(){
		var vs = "mapFilter_vShader";
		var fs = "mapFilter_fShader";
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
		this.filterProgram =  pointProgram;
	}
	this.setup = function() {
		canvas.setAttribute("width", div.offsetWidth);
		canvas.setAttribute("height", div.offsetHeight);
		var w = canvas.width;
		var h = canvas.height;
		gl.viewport(0, 0, w, h);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		matrix = new Float32Array(16);
		matrix.set([ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ]);

		gl.useProgram(this.filterProgram);
		var matrixLoc = gl.getUniformLocation(this.filterProgram, 'mapMatrix');
		gl.uniformMatrix4fv(matrixLoc, false, matrix);
				
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	
		
		
						
	}
	
	this.renderFilter = function(points){		
		gl.useProgram(this.filterProgram);
		var attributeLoc = gl.getAttribLocation(this.filterProgram, 'poly');	
		gl.enableVertexAttribArray(attributeLoc);
		
		var itemSize = 2;
		var numItems = points.length / itemSize;
				
		gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);	
		gl.vertexAttribPointer(attributeLoc, itemSize, gl.FLOAT, false, 0, 0);
		
		gl.drawArrays(gl.TRIANGLES, 0, numItems);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
	
}
