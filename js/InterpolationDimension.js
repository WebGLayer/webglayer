
function InterpolationDimension(manager){
	this.manager = manager;
	Dimension.call(this, manager);
	
	var framebuffer = gl.createFramebuffer();
	framebuffer.width = manager.width; 
	framebuffer.height = manager.height;

	var renderbuffer = gl.createRenderbuffer();

	this.interTexture = gl.createTexture();
	this.interTexture.name = "Interpolation texture";

	if (!gl.getExtension("OES_texture_float")) {
		console.log("OES_texture_float not availble -- this is legal");
	}
	/** Framebuffer */
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

	/** Texture */
	gl.bindTexture(gl.TEXTURE_2D, this.interTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // Prevents
	// s-coordinate
	// wrapping
	// (repeating).
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebuffer.width,
			framebuffer.height, 0, gl.RGBA, gl.FLOAT, null);

	/** Render buffer */
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
			framebuffer.width, framebuffer.height);

	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D, this.interTexture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
			gl.RENDERBUFFER, renderbuffer);

	gl.bindTexture(gl.TEXTURE_2D, null);
	
	

	var renderer = new InterpolationRenderer();
	
	this.setup = function() {
		
		//gl.useProgram(this.glProgram);
		/** add specific buffer and uniforms */
		gl.useProgram(this.glProgram);
		this.manager.bindMapMatrix(this.glProgram);
		this.manager.enableBuffer(this.glProgram, "wPoint");
		this.manager.enableBuffer(this.glProgram, "attr");
		
		gl.bindTexture(gl.TEXTURE_2D, this.interTexture);
		gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer );	
		
		
		gl.viewport(0, 0, manager.width, manager.height);
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
		gl.disable(gl.DEPTH_TEST);
		//gl.disable(gl.BLEND);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);
		if (this.glProgram.loc == null ){
			this.glProgram.loc = gl.getUniformLocation(this.glProgram, "zoom");
			if (!this.glProgram.loc instanceof WebGLUniformLocation) {				
				console.error("Uniform set failed, uniform: " + u_name
						+ " value " + value);
				return;
			}
		}
		/*set point size*/
		var z = map.getZoom();
	//	console.log( map.getZoom());
		if (z > 8){
			var zz = (z -7)/2;
			gl.uniform1f(this.glProgram.loc, 20);		
		} else {
			gl.uniform1f(this.glProgram.loc, 20);		
		}
		
		
		
		
				
	}	
	this.render = function(num) {

		this.setup();
		manager.enableBuffersAndCommonUniforms(this.glProgram);
		manager.enableFilterTexture(this.glProgram);
		//gl.useProgram(this.glProgram);	
		if (this.glProgram.drawselect == null){
			this.glProgram.drawselect = gl.getUniformLocation(this.glProgram, "drawselect");
			if (!this.glProgram.drawselect instanceof WebGLUniformLocation) {
				console.error("Uniform set failed, uniform");
				return;
			}
		}
		gl.uniform1f(this.glProgram.drawselect, 0);
		
	
		gl.drawArrays(gl.POINTS, 0, num);	
		
		gl.uniform1f(this.glProgram.drawselect, 1);
		
		gl.drawArrays(gl.POINTS, 0, num);	
		gl.bindTexture(gl.TEXTURE_2D, null);
	    gl.useProgram(null);
	   
	    renderer.intepolationTexture =  this.interTexture;
	   renderer.render();
		
	}
	
	this.tearDown = function(){
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
	}
	

	this.setMatrix = function(matrix){
		manager.matrices.push(matrix);	
		manager.mapMatrix=matrix;
	}

	this.readPixels = function() {
		
		//gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		var readout = new Uint8Array(4);
	//	console.time("reading_pix");
		gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, readout);
	//	console.timeEnd("reading_pix");
	//	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		var sum = 0;
		for (i = 0; i < readout.length; i++) {
			sum = sum + readout[i];
		}
		console.log(sum);
		console.log(readout);	
	}
	
}

InterpolationDimension.prototype.filter = function(raster) {
	/*rendertriangel*/
	
	/*use result as uniform*/	
}


InterpolationDimension.prototype = Object.create(Dimension.prototype);

InterpolationDimension.prototype.constructor = Dimension;
	