function FloatRasterReader(raster, width, height) {	
		
    /*Initialise offscreen buffer*/
		
	this.floatProgram = GLU.compileShaders("float_vShader",  "float_fShader", this);
	var framebuffer = gl.createFramebuffer();	
	framebuffer.name = "float frameBuffer";
	var renderbuffer = gl.createRenderbuffer();
	
	this.floatTexture = gl.createTexture();
	this.floatTexture.name = "float texture";
	
	/** Framebuffer */
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

	/** Texture*/
	gl.bindTexture(gl.TEXTURE_2D, this.floatTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); 
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width,
			height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		
		
	/** Render buffer*/
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
			width, height);

	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D, this.floatTexture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
			gl.RENDERBUFFER, renderbuffer);
		
	
	/**create vertex buffer*/	
	this.buffer = gl.createBuffer();
	this.buffer.itemSize = 2;
	this.buffer.name="ras_vert";
	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
	      -1.0, -1.0,
	       1.0, -1.0,
	      -1.0,  1.0,
	       1.0,  1.0,
	       1.0, -1.0,
	      -1.0,  1.0]), gl.STATIC_DRAW);
	
		
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);		
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    /**
	 * program uniforms
	 */
	var band = 'band';
	var floatTexture = 'floatTexture'
	gl.useProgram(this.floatProgram);
	manager.storeUniformLoc(this.floatProgram, band);
	manager.storeUniformLoc(this.floatProgram, floatTexture );
	
	var texCoordLocation = gl.getAttribLocation(this.floatProgram, "vertices");
	gl.useProgram(null);
    
	this.setup = function() {
		 gl.useProgram(this.floatProgram);		
		 gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		 gl.enableVertexAttribArray(texCoordLocation);
		 gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
		//gl.useProgram(this.glProgram);
		/** add specific buffer and uniforms */
		 gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	     gl.uniform1i(this.floatProgram[floatTexture] , 0);		   
		 gl.activeTexture(gl.TEXTURE0);
		 gl.bindTexture(gl.TEXTURE_2D, raster);
		
		//gl.bindFramebuffer(gl.FRAMEBUFFER,null);	
		gl.viewport(0, 0, manager.width, manager.height);
		//gl.clearColor(0.0, 0.0, 0.0, 0.0);
		//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.BLEND);		
				
	}	
	this.render = function(max) {

		this.setup();
	
	    gl.uniform1f(this.floatProgram[band], 0);	
		gl.drawArrays(gl.TRIANGLES, 0, 6);	
		gl.bindTexture(gl.TEXTURE_2D, null);
	    gl.useProgram(null);
	   
	}
	

	
	
	this.readPixels = function() {
		
		console.time("reading filter");
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		var readout_eight = new Uint8Array(height *  width * 4);
		gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, readout_eight);		

		var readout = new Float32Array(readout_eight.buffer);
	/*	sum = 0;
		for (i = 0; i < readout.length; i++) {
			sum = sum + readout[i];
		}
		console.log(sum);
		console.log(readout);*/
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		return readout;
	}
	
	this.readPixel = function(x,y) {
		
		//gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		var readout_eight = new Uint8Array(4);
		gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, readout_eight);		

		var readout = new Float32Array(readout_eight.buffer);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		return readout;
	}	
}


