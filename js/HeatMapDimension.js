
function HeatMapDimension(manager){
	//this.manager = manager;
	//Dimension.call(this, manager);
	
	this.glProgram = GLU.compileShaders('heatmap_vShader', 'heatmap_fShader', this);
	var framebuffer = gl.createFramebuffer();
	
	framebuffer.width = manager.w;	
	framebuffer.height = manager.h;

	var renderbuffer = gl.createRenderbuffer();

	this.heatTexture = gl.createTexture();
	this.heatTexture.name = "heat map texture";

	if (!gl.getExtension("OES_texture_float")) {
		console.log("OES_texture_float not availble -- this is legal");
	}
	/** Framebuffer */
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

	/** Texture */
	gl.bindTexture(gl.TEXTURE_2D, this.heatTexture);
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
			gl.TEXTURE_2D, this.heatTexture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
			gl.RENDERBUFFER, renderbuffer);

	gl.bindTexture(gl.TEXTURE_2D, null);
	

	/**
	 * program uniforms
	 */
	var zoom = 'zoom';
	var drawselect = 'drawselect';
	var numfilters = 'numfilters';
	
	gl.useProgram(this.glProgram);
	manager.storeUniformLoc(this.glProgram, zoom);
	manager.storeUniformLoc(this.glProgram, drawselect);
	manager.storeUniformLoc(this.glProgram, numfilters);
	gl.uniform1f(this.glProgram.numfilters, 3);		
	gl.useProgram(null);
	var	renderer = new HeatMapRenderer();
	var	maxcale = new MaxCalculator(Math.floor(manager.w/4),Math.floor(manager.h/4));
	
	
	this.setup = function() {
		
		//gl.useProgram(this.glProgram);
		/** add specific buffer and uniforms */
		gl.useProgram(this.glProgram);
		
		manager.bindMapMatrix(this.glProgram);
		manager.enableBufferForName(this.glProgram, "wPoint", "wPoint");
		manager.enableBufferForName(this.glProgram,  "index", "index");	
		manager.bindRasterMatrix(this.glProgram);	
		
		gl.bindTexture(gl.TEXTURE_2D, this.heatTexture);
		gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer );	
		
		
		gl.viewport(0, 0, manager.width, manager.height);
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
		gl.disable(gl.DEPTH_TEST);
		//gl.disable(gl.BLEND);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);
		
		manager.enableFilterTexture(this.glProgram);		
				
	}	
	this.render = function(num) {

		this.setup();		
	
		gl.useProgram(this.glProgram);	
		gl.uniform1f(this.glProgram[numfilters], 3);			
		gl.uniform1f(this.glProgram[drawselect], 0);
		gl.drawArrays(gl.POINTS, 0, num);	
		
		gl.uniform1f(this.glProgram[drawselect], 1);	
		gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer );	
		gl.drawArrays(gl.POINTS, 0, num);	
	    gl.useProgram(null);
	   
		gl.bindTexture(gl.TEXTURE_2D, null);
	    gl.useProgram(null);
	   
	 
	    
	    var max = maxcale.getMax(this.heatTexture);

	    manager.max = max;
	    renderer.heatTexture = 	this.heatTexture;	
	    renderer.render(max);
	    
		
	     			
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

	