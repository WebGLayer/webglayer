Filter = function(rastersize, manager) {

	
	this.rastersize = rastersize;
	this.manager = manager;	
	
	
	this.filterProgram = utils.loadShaders("filter_vShader", "filter_fShader",
			this);
	this.filterProgram.name = "Main filter";

	var framebuffer = gl.createFramebuffer();
	framebuffer.width = this.rastersize;
	framebuffer.height = this.rastersize;

	var renderbuffer = gl.createRenderbuffer();
	this.filterTexture = gl.createTexture();

	/** Framebuffer */
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

	/** Texture */
	gl.bindTexture(gl.TEXTURE_2D, this.filterTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebuffer.width,
			framebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

	/** Render buffer */
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
			framebuffer.width, framebuffer.height);

	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D, this.filterTexture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
			gl.RENDERBUFFER, renderbuffer);

	gl.bindTexture(gl.TEXTURE_2D, null);

	this.render = function() {

		gl.useProgram(this.filterProgram);
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		gl.viewport(0, 0, framebuffer.width,framebuffer.height);
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);

	//	this.manager.enableBuffersAndCommonUniforms(this.filterProgram);

		manager.bindMapMatrix(this.filterProgram);
		manager.enableBufferForName(this.filterProgram, "wPoint"+manager.year, "wPoint");
		manager.enableBufferForName(this.filterProgram,  "attr"+manager.year+manager.time, "attr");
		manager.enableBufferForName(this.filterProgram,  "index"+manager.year+"Line", "index");	
	
	//	for(var i = 0; i < metadata.length; i++){
		//	this.manager.enableBuffer(this.filterProgram, metadata[i].name);
	//	}
		
		/*for (var i = 0; i < metadata.length; i++) {
			
			
		}*/
		
		
		/*Filter texture*/
		/*if (this.filterProgram.mapLoc == null){
			this.filterProgram.mapLoc = manager.getUniformLoc(this.filterProgram, 'mapFilter'); 
		}*/
				 
		/*gl.uniform1i(this.filterProgram.mapLoc , 0);		   
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.mapFilter);*/
		
		
		/*Filter texture*/
		if (this.filterProgram.histLoc == null){
			this.filterProgram.histLoc = manager.getUniformLoc(this.filterProgram, 'histFilter'); 		
		}	
	 
		gl.uniform1i(this.filterProgram.histLoc , 1);		   
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, manager.histFilter);
		
		/*Has filters*/
		if (this.filterProgram.hasFilter == null){
			this.filterProgram.hasFilter = manager.getUniformLoc(this.filterProgram, 'hasFilter'); 		
		}	
	
		if (this.hasHistFilter == false && this.hasMapFilter == false){
			gl.uniform1f(this.filterProgram.hasFilter, 0);		   	
		} else {
			gl.uniform1f(this.filterProgram.hasFilter, 1);		   
		}
	 		
		
		
		
	
		gl.drawArrays(gl.POINTS, 0, manager.num_rec*2);
		gl.useProgram(null);
	//	gl.finish();
	}

	this.readPixels = function() {
		/**
		 * bind restexture as uniform, render, and read
		 */
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		// console.time("reading_pix");
		var readout = new Uint8Array( framebuffer.width * framebuffer.height* 4);
		gl.readPixels(0, 0, framebuffer.width, framebuffer.height, gl.RGBA,
				gl.UNSIGNED_BYTE, readout);
		// console.timeEnd("reading_pix");
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		console.log(readout);

		return res;// readout;
	}
	this.hasHistFilter = false;
	this.hasMapFilter = false;
}