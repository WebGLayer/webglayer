
function InterpolationDimension(manager){
	this.manager = manager;
	this.buf_id = 0;
	Dimension.call(this, manager);
	
	//var ext = gl.getExtension("ANGLE_instanced_arrays"); // Vendor prefixes may apply!
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
	
	this.floatReader = new FloatRasterReader(this.interTexture,
			framebuffer.width, framebuffer.height);
	

	var renderer = new InterpolationRenderer();
	
	this.setup = function() {
		
		//gl.useProgram(this.glProgram);
		/** add specific buffer and uniforms */
		gl.useProgram(this.glProgram);
		this.manager.bindMapMatrix(this.glProgram);
		this.manager.enableBuffer(this.glProgram, "wPoint");
		this.manager.enableBufferForName(this.glProgram, "attr"+this.buf_id, "attr");
		this.manager.enableBuffer(this.glProgram, "xy");
		
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
		
			gl.uniform1f(this.glProgram.loc, z);						
	}	
	this.render = function(num) {

		this.setup();				
		
		
		//gl.useProgram(this.glProgram);	
		if (this.glProgram.drawselect == null){
			this.glProgram.drawselect = gl.getUniformLocation(this.glProgram, "drawselect");
			if (!this.glProgram.drawselect instanceof WebGLUniformLocation) {
				console.error("Uniform set failed, uniform");
				return;
			}
		}
		gl.uniform1f(this.glProgram.drawselect, 0);
		
	
		gl.drawArrays(gl.TRIANGLES, 0, num*3);	
		//ext.drawArraysInstancedANGLE(gl.TRIANGLES,num*3, gl.UNSIGNED_SHORT,0,num);
		gl.uniform1f(this.glProgram.drawselect, 1);
		
		//gl.drawArrays(gl.POINTS, 0, num*3);	
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

	this.readPixel = function(x,y) {
		
				
		
		var readout = new Uint8Array(4);
	//	console.time("reading_pix");
		gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, readout);
	//	console.timeEnd("reading_pix");
	//	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		var sum = 0;
		for (i = 0; i < readout.length; i++) {
			sum = sum + readout[i];
		}
		//console.log(sum);
		//console.log(readout);	
	}
	
	this.readPixelaa = function() {

		gl.useProgram(this.program);	
		this.floatReader.setup()
		this.floatReader.render();
		var readout = this.floatReader.readPixel(10,10);

		
		return readout;

	}
}

InterpolationDimension.prototype.filter = function(raster) {
	/*rendertriangel*/
	
	/*use result as uniform*/	
}


InterpolationDimension.prototype = Object.create(Dimension.prototype);

InterpolationDimension.prototype.constructor = Dimension;
	