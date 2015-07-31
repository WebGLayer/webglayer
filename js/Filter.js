Filter = function(manager) {

	
	this.rastersize = manager.r_size ;
	this.manager = manager;	
	
	
	this.filterProgram = GLU.compileShaders("filter_vShader", "filter_fShader",
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
	
	if (this.filterProgram.histLoc == null){
		this.filterProgram.histLoc = manager.getUniformLoc(this.filterProgram, 'histFilter'); 		
	}	

	this.render = function(dimensions) {

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
		manager.enableBufferForName(this.filterProgram, "wPoint", "wPoint");
		manager.enableBufferForName(this.filterProgram,  "index", "index");	

		
		/*Has filters*/
		if (this.filterProgram.hasFilter == null){
		//	this.filterProgram.hasFilter = manager.getUniformLoc(this.filterProgram, 'hasFilter'); 		
		}	
	
		if (this.hasHistFilter == false && this.hasMapFilter == false){
			gl.uniform1f(this.filterProgram.hasFilter, 0);		   	
		} else {
			gl.uniform1f(this.filterProgram.hasFilter, 1);		   
		}
	 				
		for (var i in dimensions) {
			var d = dimensions[i];		
			/*Filter texture*/
		
			if (typeof(d.filter) != 'undefined'){
				
			
			gl.uniform1i(this.filterProgram.histLoc , 1);		   
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, d.filter.filterTexture);
			
			manager.enableBufferForName(this.filterProgram, d.name, "attr1");
		 	gl.drawArrays(gl.POINTS, 0, manager.num_rec);			
			}
			
		}

		
		//manager.enableBufferForName(this.filterProgram,  "attr1", "attr1");
		//manager.enableBufferForName(this.filterProgram,  "attr2", "attr2");
		//manager.enableBufferForName(this.filterProgram,  "attr3", "attr3");
		
	
		//gl.drawArrays(gl.POINTS, 0, manager.num_rec);
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