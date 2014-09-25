function FloatRasterReader(raster, bin_count) {	
	
	this.raster = raster;
	this.bin_count=bin_count;
	this.name = name;
    /*Initialise offscreen buffer*/
		
	this.floatProgram = utils.loadShaders("float_vShader",  "float_fShader", this);
	var framebuffer = gl.createFramebuffer();	
	framebuffer.name = "float framBuffer";
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
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.bin_count,
		1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		
		
	/** Render buffer*/
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
			this.bin_count, 1);

	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D, this.floatTexture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
			gl.RENDERBUFFER, renderbuffer);
		
	
	/**create vertex buffer*/		
	this.buffer = gl.createBuffer();
	this.buffer.attr="ras_vert";
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    this.vertices = [
                    -0.5, 0.0,  
                     0.0, 0.0,  
                     0.5, 0.0 ];	    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    
		
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);		
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
	/** this goes before every rendering **/
    
	this.setup = function() {
		//gl.useProgram(this.glProgram);
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		    var loc = gl.getAttribLocation(this.floatProgram, this.buffer.attr);
			gl.enableVertexAttribArray(loc);
			gl.vertexAttribPointer(loc,  2, gl.FLOAT, false, 0, 0);
		gl.viewport(0, 0, this.bin_count, 1);				
		gl.clearColor(1.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);
	   
		

		

	}

	this.setUniforms = function(){				
		
		var rasterLoc =  gl.getUniformLocation(this.floatProgram, 'floatRaster'); 		 
		gl.uniform1i(rasterLoc , 0);		   
		gl.activeTexture(gl.TEXTURE3);
		gl.bindTexture(gl.TEXTURE_2D, this.raster);
		
		
	}
	
	
	
	this.render = function(){	
		gl.useProgram(this.floatProgram);
		gl.bindTexture(gl.TEXTURE_2D, this.floatTexture);
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		
		
		this.setUniforms();
				
		gl.disable(gl.BLEND);
		gl.disable(gl.DEPTH_TEST);
		
		
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.vertexAttribPointer(this.buffer.attr, 3, gl.FLOAT, false, 0, 0);
	    		
		
		gl.drawArrays(gl.POINTS, 0, 3);		
		
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		
	}
	

	
	this.readPixels = function() {
		
		console.time("reading filter");
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		var readout = new Uint8Array(this.bin_count * 4);
		gl.readPixels(0, 0, this.bin_count, 1, gl.RGBA, gl.UNSIGNED_BYTE, readout);
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

