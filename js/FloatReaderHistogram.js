function FloatReaderHistogram(raster, width, height) {	
	
	this.raster = raster;
	this.bin_count=width;
	this.height = height
		
	var rows =4 * height;
    /*Initialise offscreen buffer*/
		
	this.floatProgram = GLU.compileShaders("floathist_vShader",  "floathist_fShader", this);
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
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.bin_count,
			rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		
		
	/** Render buffer*/
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
			this.bin_count, rows);

	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D, this.floatTexture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
			gl.RENDERBUFFER, renderbuffer);
		
	
	/**create vertex buffer*/	
	this.buffer = gl.createBuffer();
	this.buffer.name="ras_vert";
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    
    
    this.vertices = new Float32Array(this.bin_count*2*rows);
    var m=0;
    for (var i = 0; i <rows; i++) {
    	for (var j =0; j<this.bin_count;j++){
    		this.vertices[m++] = j;//;/this.bin_count+(0.5/this.bin_count);
        	this.vertices[m++] = i;///rows+ (0.5 / rows); 
    	}
    	
	}		
    
	
    
    
    this.buffer.itemSize =2;
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    
		
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);		
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
	/** this goes before every rendering **/
    
	this.setup = function() {
		gl.useProgram(this.floatProgram);
		//gl.useProgram(this.glProgram);
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		
		this.enableBuffer(this.buffer);
		gl.viewport(0, 0, this.bin_count, rows);				
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.BLEND);
		//gl.blendFunc(gl.ONE, gl.ONE);
	}

	this.enableBuffer = function(buffer){
		
		var name = buffer.name;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		
		if (this.floatProgram[name]==null){
			this.floatProgram[name] = gl.getAttribLocation(this.floatProgram , name);
			if (gl.getAttribLocation(this.floatProgram , name)<0){
				console.log("Error: attribute "+name+" does not exist.");
			}
		}
		
		
	
        gl.enableVertexAttribArray(this.floatProgram[name]);
		gl.vertexAttribPointer(this.floatProgram[name],  buffer.itemSize, gl.FLOAT, false, 0, 0);	
	
	
}
	this.setUniforms = function(){				
		
		
		
		
	}
	
	
	
	this.render = function(){	
	
		
		//gl.bindTexture(gl.TEXTURE_2D, this.floatTexture);
		//gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		
		/**
		 * Enable source float raster
		 */
		if (this.floatProgram.rasterLoc == null){
			this.floatProgram.rasterLoc =  gl.getUniformLocation(this.floatProgram, 'floatRaster'); 		 
		}
		
		gl.uniform1i(this.floatProgram.rasterLoc , 0);	
		gl.activeTexture(gl.TEXTURE0);		
		gl.bindTexture(gl.TEXTURE_2D, this.raster);
						
		/**
		 * Enable uniforms
		 */
		this.bindIntUniform("height", rows);
		this.bindIntUniform("width", this.bin_count);
		
		
		
	//	gl.disable(gl.BLEND);
	//	gl.disable(gl.DEPTH_TEST);
		
			
		gl.drawArrays(gl.POINTS, 0, this.bin_count*rows);		
		
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		//gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		
	}
	

	this.bindIntUniform = function(name, val){
		if (this.floatProgram[name]==null){
			this.floatProgram[name] = gl.getUniformLocation(this.floatProgram, name);	
			if (!this.floatProgram[name] instanceof WebGLUniformLocation){
				console.error("Uniform set failed, uniform: "+name+ " value "+value );
				return;
			}
				
		}	
		gl.uniform1f(this.floatProgram[name], val);
	
	}
	
	this.readPixels = function() {
		
		console.time("reading filter");
		
		//gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		var readout_eight = new Uint8Array(this.bin_count * 4 * rows);
		gl.readPixels(0, 0, this.bin_count, rows, gl.RGBA, gl.UNSIGNED_BYTE, readout_eight);		

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

create2DTexture = function() {
    var data = new Uint8Array(10*10*4);
    kk=0;
	for (o = 0 ; o<10 ; o++){
		for (p = 0 ; p<10 ; p++){
			data[kk++]=20*p;
			data[kk++]=25;
			data[kk++]=50;
			data[kk++]=255;
		
		}
	
	}
   
    var texture = gl.createTexture();		
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 10, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	
	gl.bindTexture(gl.TEXTURE_2D, null);
  
	return texture;
   

	
}