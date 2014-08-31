function OneDDimension(manager) {
	Dimension.call(this, manager);
	

	
	this.max = 100;
	var attmatrix = new Float32Array(16);
	attmatrix.set([ 2 / this.max, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, -1, 0, 0,
			1 ]);
	
	attmatrix.name = "attMatrix";
	manager.matrices.push(attmatrix);
	
	
	this.bin_count = 8;
	

	var framebuffer = gl.createFramebuffer();
	framebuffer.width =  this.bin_count;
	framebuffer.height = 1;
	
	var renderbuffer = gl.createRenderbuffer();
	var restexture = gl.createTexture();
	
	if (!gl.getExtension("OES_texture_float")) {
		console.log("OES_texture_float not availble -- this is legal");
	}
	this.initOfscreenBuffer(framebuffer, renderbuffer, restexture );
	
	this.setup = function() {
		//gl.useProgram(this.glProgram);
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		gl.viewport(0, 0, this.bin_count, 1);				
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);
	
	
	}

	this.tearDown = function() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}
	
	this.readPixels = function() {
				
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	//	console.time("reading_pix");
		var readout= new Float32Array(8*4);
		gl.readPixels(0, 0, this.bin_count, 1, gl.RGBA, gl.FLOAT, readout);
	//	console.timeEnd("reading_pix");
		//gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	 
	  var sum = 0;
		for (i = 0; i < readout.length; i++) {
			sum = sum + readout[i];
		}
		console.log(sum);
		console.log(readout);
		return  readout;
	}
}
OneDDimension.prototype.setFrameBuffer = function(){
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}


OneDDimension.prototype = Object.create(Dimension.prototype);


OneDDimension.prototype.constructor = Dimension;



OneDDimension.prototype.initOfscreenBuffer = function(framebuffer, renderbuffer, restexture) {		
	
	/** Framebuffer */
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	

	/** Texture*/
	gl.bindTexture(gl.TEXTURE_2D, restexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebuffer.width,
			framebuffer.height, 0, gl.RGBA, gl.FLOAT, null);


	/** Render buffer*/
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
			framebuffer.width, framebuffer.height);

	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D, restexture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
			gl.RENDERBUFFER, renderbuffer);

	gl.bindTexture(gl.TEXTURE_2D, null);
	

}

