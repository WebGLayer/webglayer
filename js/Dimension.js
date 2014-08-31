var Dimension = function(manager) {
	
	manager.addDimension(this);
	
	this.glProgram = null;
	/**
	 * 
	 */
	this.setProgram = function(vs, fs, name) {

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
		this.glProgram = pointProgram;
		this.glProgram.name = name;
	}
	

	this.bindCommonUniforms = function(){		
		
	
	}
	
	
	
	/**
	 * 
	 */
	this.enableBuffersAndCommonUniforms = function(buffers) {
	
		var matrixLoc = this.getUniformLoc('attMatrix');		
		gl.uniformMatrix4fv(matrixLoc, false, this.attmatrix);
		
		matrixLoc = this.getUniformLoc('mapMatrix');
		gl.uniformMatrix4fv(matrixLoc, false, this.matrix);
		
		matrixLoc = this.getUniformLoc('rasterMatrix');
		gl.uniformMatrix4fv(matrixLoc, false, this.rmatrix);
		
		var rasterLoc = this.getUniformLoc('mapFilter'); 		 
		gl.uniform1i(rasterLoc , 0);		   
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		
		for ( var i in buffers) {
			name = buffers[i].name;
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i]);

			if (gl.getAttribLocation(this.glProgram, name) >= 0) {
				var loc = gl.getAttribLocation(this.glProgram, name);
				gl.enableVertexAttribArray(loc);
				gl.vertexAttribPointer(loc, buffers[i].itemSize, gl.FLOAT,
						false, 0, 0);
			} else {
				console.log("Error: attribute " + name + " does not exist.");
			}
		}
	}

	/**
	 * 
	 */
	this.render = function(num) {
		gl.useProgram(this.glProgram);		
		gl.drawArrays(gl.POINTS, 0, num);	
	    gl.useProgram(null);
	    gl.finish();
		
	}
	
	this.getUniformLoc = function(name){
		var loc = gl.getUniformLocation(this.glProgram, name)
		if (loc==null){
			console.error("Error setting common uniform "+name+" for program "+this.glProgram.name);
		} else {
			return loc;
		}			
	}
};

Dimension.prototype.setFrameBuffer = function() {
	//console.log("setFrameBuffer function should be implemneted by subclass");
}


Dimension.prototype.readPixels = function() {
	//console.log("readPixels function should be implemneted by subclass");
}

Dimension.prototype.tearDown = function() {
	//console.log("tearDown function should be implemneted by subclass");
}

Dimension.prototype.setMapMatrix = function(m) {
	gl.useProgram(this.glProgram);
	var matrixLoc = gl.getUniformLocation(this.glProgram, 'mapMatrix');
	gl.uniformMatrix4fv(matrixLoc, false, m);
	gl.useProgram(null);
}

Dimension.prototype.filter = function(f) {
	/** create mask */
	console.log("filter function should be implemneted by subclass");
}
