function OneDDimension(manager, bin_count, max, name) {
	Dimension.call(this, manager);

	this.name = name;
	this.max = max;

	
	
	this.bin_count = bin_count;
	
	var framebuffer = gl.createFramebuffer();
	framebuffer.width =  this.bin_count;
	framebuffer.height = 1;
	
	var renderbuffer = gl.createRenderbuffer();
	this.restexture = gl.createTexture();
	
	if (!gl.getExtension("OES_texture_float")) {
		console.log("OES_texture_float not availble -- this is legal");
	}
	this.initOfscreenBuffer(framebuffer, renderbuffer, this.restexture );
	
	this.floatReader = new  FloatRasterReader(this.restexture, this.bin_count);
	
	/**
	 * this goes on every time in rendering cicle
	 */
	this.setup = function() {
		gl.useProgram(this.glProgram);
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		gl.viewport(0, 0, this.bin_count, 1);				
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);
		
		manager.enableBuffer(this.glProgram, "speed");
	
	}

	this.tearDown = function() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}
	
	this.readPixels = function() {
		/**
		 * bind restexture as uniform, render, and read
		 */		
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	//	console.time("reading_pix");
		var readout= new Float32Array(this.bin_count*4);
		gl.readPixels(0, 0, this.bin_count, 1, gl.RGBA, gl.FLOAT, readout);
		console.log(readout);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	 
		this.floatReader.setup()
		this.floatReader.render();
		var readout = this.floatReader.readPixels();
		
		var res = new Array(this.bin_count);
		for (var i = 0; i < this.bin_count; i++) {
				var d = {
				min : i*this.max/this.bin_count,
				max:  (i+1)*this.max/this.bin_count,
				selected : readout[i],
				unselected : readout[i+1*this.bin_count],
				out : readout[i+2*this.bin_count]};
				res[i]=d;
        }
		
	/*  var sum = 0;
		for (var i = 0; i < readout.length; i++) {
			sum = sum + readout[i];
        }
		console.log(sum);
		console.log(readout);*/
		return  res;//readout;
	}
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

