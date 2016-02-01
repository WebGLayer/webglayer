function MapColorFilter(manager, dim){	
	
	var manager = manager;
	
	this.isspatial = 1.0;
	var pointsSize = 0;	
	//var saved_filter;
	this.glProgram = GLU.compileShaders("mapColorFilter_vShader",  "mapColorFilter_fShader", this);
	
	/**
	 * Buffers
	 */
	  // provide texture coordinates for the rectangle.
	 var texCoordBuffer = gl.createBuffer();
	 gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	 gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
	      -1.0, -1.0,
	       1.0, -1.0,
	      -1.0,  1.0,
	       1.0,  1.0,
	       1.0, -1.0,
	      -1.0,  1.0]), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	var framebuffer  = gl.createFramebuffer();			
	var renderbuffer = gl.createRenderbuffer();
	
	this.filterTexture = gl.createTexture();
	this.filterTexture.name = "color filter texture";
	
	var texCoordLocation = gl.getAttribLocation(this.glProgram, "v_texCoord");
	var rasterLoc = 	   gl.getUniformLocation(this.glProgram, "heatmap_raster" );
	manager.storeUniformLoc(this.glProgram, "val_min");
	manager.storeUniformLoc(this.glProgram, "val_max");
	
	this.filter_val = [-Infinity, Infinity];
	
		
	this.createMapFramebuffer = function(){ 
		
		/*Initialise offscreen buffer*/
		
		/** Framebuffer */
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

		/** Texture*/
		gl.bindTexture(gl.TEXTURE_2D, this.filterTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, manager.w,
				manager.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		
		
		/** Render buffer*/
		gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
				manager.width, manager.height);

		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
				gl.TEXTURE_2D, this.filterTexture, 0);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
				gl.RENDERBUFFER, renderbuffer);
		
		
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	
	this.createMapFramebuffer();
	
	this.setup = function() {
		 gl.useProgram(this.glProgram);		
		 gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
		 gl.enableVertexAttribArray(texCoordLocation);
		 gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
		//gl.useProgram(this.glProgram);
		/** add specific buffer and uniforms */
		 gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	     gl.uniform1i(rasterLoc , 0);		   
		 gl.activeTexture(gl.TEXTURE0);
		 gl.bindTexture(gl.TEXTURE_2D, manager.heatTexture);
	
	
		 gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
					
		 gl.viewport(0, 0, manager.w, manager.h);
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.BLEND);
					

	}	
	this.renderFilter = function() {
		//legend.updateMax(max);		
		this.setup();
	
		
	    //gl.uniform1f(this.glProgram.max, max);	
	    //gl.uniform1f(this.glProgram.min, min);	
	   
	    
		gl.drawArrays(gl.TRIANGLES, 0, 6);	
		gl.bindTexture(gl.TEXTURE_2D, null);
	    gl.useProgram(null);
	   
		
	}


	this.updateFilter = function(){
		// set uniform
		dim.update();
		this.createFilteringData(this.saved_filter);
		this.renderFilter();
	}
	
	
	this.createFilteringData = function(v){
	 	this.saved_filter = v;
		console.log("filter: "+v );
			 gl.useProgram(this.glProgram);		
			 gl.uniform1f(this.glProgram.val_min, v[0]);
			 gl.uniform1f(this.glProgram.val_max, v[1]);
			
	}
	
	
	this.readPixels = function() {
		
	//	console.time("reading filter");
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		var readout = new Uint8Array(this.width * this.height * 4);
		gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, readout);
	//	console.timeEnd("reading");

		sum = 0;
		for (i = 0; i < readout.length; i++) {
			sum = sum + readout[i];
		}
		//console.log(sum);
		//console.log(readout);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}
	
	
}

