function FilterUtility(manager){	
	var manager = manager;
	var gl = manager.getGL();
	var canvas = manager.getCanvas();
	var div = manager.getDiv();
	
	var pointsSize = 0;
	
	this.filterProgram = null;
	/***
	 * Buffers
	 */
	var posBuffer = gl.createBuffer();
	var framebuffer = gl.createFramebuffer();	
		
	var renderbuffer = gl.createRenderbuffer();
	this.filterTexture = gl.createTexture();
	
	
	
	this.init = function(){
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
		
		this.initOfscreenBuffer();
	}
	
		
		
	
	this.initOfscreenBuffer = function() {
		
		/** Framebuffer */
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

		/** Texture*/
		gl.bindTexture(gl.TEXTURE_2D, this.filterTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,this.width,
				this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		
		
		/** Render buffer*/
		gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
				this.width, this.height);

		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
				gl.TEXTURE_2D, this.filterTexture, 0);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
				gl.RENDERBUFFER, renderbuffer);
		
		
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	
	this.setup = function() {	
		//this.initOfscreenBuffer();
		gl.bindTexture(gl.TEXTURE_2D, this.filterTexture);
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		gl.viewport(0, 0, this.width, this.height);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		gl.useProgram(this.filterProgram);
		var matrixLoc = gl.getUniformLocation(this.filterProgram, 'mapMatrix');
		gl.uniformMatrix4fv(matrixLoc, false, this.matrix);
				
		gl.disable(gl.BLEND);
		gl.disable(gl.DEPTH_TEST);
		
		//gl.bindFramebuffer(gl.FRAMEBUFFER, null);				
				
	}	
	

	
	
	
	this.renderFilter = function(){		
		gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
		var attributeLoc = gl.getAttribLocation(this.filterProgram, 'poly');	
		gl.enableVertexAttribArray(attributeLoc);
		gl.vertexAttribPointer(attributeLoc, 2, gl.FLOAT, false, 0, 0);
		
		gl.drawArrays(gl.TRIANGLES, 0, pointsSize);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		
	}
	
	
	
	this.createFilteringData = function(points){		
		gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);	
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		pointsSize = points.length/2;
	}
	
	this.readPixels = function() {
		
		console.time("reading filter");
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		var readout = new Uint8Array(this.width * this.height * 4);
		gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, readout);
		console.timeEnd("reading");

		sum = 0;
		for (i = 0; i < readout.length; i++) {
			sum = sum + readout[i];
		}
		console.log(sum);
		console.log(readout);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}
	
	
}

