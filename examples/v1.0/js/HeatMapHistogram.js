function HeatMapHistogram(metadata){
	
	//input: colored heatmap, positions
	//output: histogram raster coresponding to number of positions in each color.
	
	this.glProgram = GLU.compileShaders('heathist_vShader', 'heathist_fShader', this);
	var framebuffer = gl.createFramebuffer();
	
	framebuffer.width = metadata.max_bins;
	framebuffer.height = 1;	

	var renderbuffer = gl.createRenderbuffer();

	this.histTexture = gl.createTexture();
	this.histTexture.name = "heat map texture";

	if (!gl.getExtension("OES_texture_float")) {
		console.log("OES_texture_float not availble -- this is legal");
	}
	/** Framebuffer */
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

	/** Texture */
	gl.bindTexture(gl.TEXTURE_2D, this.histTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // Prevents
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebuffer.width,
			framebuffer.height, 0, gl.RGBA, gl.FLOAT, null);

	/** Render buffer */
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
			framebuffer.width, framebuffer.height);

	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D, this.histTexture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
			gl.RENDERBUFFER, renderbuffer);

	gl.bindTexture(gl.TEXTURE_2D, null);
	

	/**
	 * program uniforms
	 */
	var heatraster = 'heatraster';
	var numfilters = 'numfilters';
	var max = 'max';
	
	gl.useProgram(this.glProgram);
	manager.storeUniformLoc(this.glProgram, heatraster);
	manager.storeUniformLoc(this.glProgram, numfilters);
	manager.storeUniformLoc(this.glProgram, "max");
	gl.uniform1f(this.glProgram.numfilters, 3);		
	gl.useProgram(null);
	
	this.floatReader = new FloatReaderHistogram(this.histTexture,
			framebuffer.width, framebuffer.height);
	
	this.setup = function() {
		
		//gl.useProgram(this.glProgram);
		/** add specific buffer and uniforms */
		gl.useProgram(this.glProgram);
		
		manager.bindMapMatrix(this.glProgram);
		manager.enableBufferForName(this.glProgram, "wPoint", "wPoint");
		manager.enableBufferForName(this.glProgram,  "index", "index");	
		manager.bindRasterMatrix(this.glProgram);	
		
		gl.bindTexture(gl.TEXTURE_2D, this.histTexture);
		gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer );	
		
		
		gl.viewport(0, 0, framebuffer.width, framebuffer.height);
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
		gl.disable(gl.DEPTH_TEST);
		//gl.disable(gl.BLEND);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);
		
		manager.enableFilterTexture(this.glProgram);		
			
		gl.uniform1i(this.glProgram.heatraster, 1);		   
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.heatTexture);
	}	
	this.render = function(num) {

		this.setup();		
	
		gl.useProgram(this.glProgram);	
		gl.uniform1f(this.glProgram[numfilters], 3);	
		gl.uniform1f(this.glProgram[max],  manager.max);	
	//	gl.uniform1f(this.glProgram[drawselect], 0);
		gl.drawArrays(gl.POINTS, 0, num);	
		
	   
		gl.bindTexture(gl.TEXTURE_2D, null);
	    gl.useProgram(null);
	   
	 
	    this.readPixels();
	    
	    //var max = maxcale.getMax(this.heatTexture);

	    //renderer.heatTexture = 	this.heatTexture;	
	    //renderer.render(max);
	   		
	     			
	}
	
	this.readPixels = function() {
		
		
		 gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer); 
		 var readout = new Float32Array(framebuffer.width * framebuffer.height * 4);
		 gl.readPixels(0, 0, framebuffer.width, framebuffer.height, gl.RGBA, gl.FLOAT, readout); 
		console.log("Heat dim:"); 
		console.log(readout);
		
		// console.log("Dloat reader"); 
		this.floatReader.setup()
		this.floatReader.render();
		var  rf = this.floatReader.readPixels();
		console.log(rf);
		
		var res =[];
		  var m = 0;
			res[m] = new Array(metadata[m].num_bins);
			res[m].max = {0:0,1:0,2:0,3:0};
			for (var i = 0; i < metadata[m].num_bins; i++) {
				var s = metadata[m].max / metadata[m].num_bins;
				
				var dimid = m * metadata.max_bins*3;
				var d = {					
					min : i * s,
					max : (i + 1) * s,
					selected : rf[dimid+i],
					unselected : rf[dimid+i + 1 * metadata.max_bins],
					out : rf[dimid+i + 2 * metadata.max_bins]
				};
				
				if (d.selected > res[m].max[0]){res[m].max[0] = d.selected};
				if (d.unselected+d.selected > res[m].max[1]){res[m].max[1] = d.unselected+d.selected};
				if (d.out+d.unselected+d.selected > res[m].max[2]){res[m].max[2] = d.out+d.unselected+d.selected};				
				res[m][i] = d;
			}
		
		return res;

		
	}
	
}