function MaxCalculator(w, h){
	
	this.glProgram = GLU.compileShaders("max_calculator_vShader",  "max_calculator_fShader",this);
	
	var framebuffer = gl.createFramebuffer();
	
	framebuffer.width  = w;//manager.w;
	framebuffer.height = h;//manager.h;

	var renderbuffer = gl.createRenderbuffer();

	this.maxTexture = gl.createTexture();
	this.maxTexture.name = "max";
	this.floatReader = new FloatRasterReader(
			framebuffer.width, framebuffer.height);

	if (!gl.getExtension("OES_texture_float")) {
		console.log("OES_texture_float not availble -- this is legal");
	}
	/** Framebuffer */
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

	/** Texture */
	gl.bindTexture(gl.TEXTURE_2D, this.maxTexture);
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
			gl.TEXTURE_2D, this.maxTexture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
			gl.RENDERBUFFER, renderbuffer);

	gl.bindTexture(gl.TEXTURE_2D, null);
	
	/** getting attribut locations*/
	var texCoordLocation = gl.getAttribLocation(this.glProgram, "v_texCoord");
	var rasterLoc = 	   gl.getUniformLocation(this.glProgram, "heatmap_raster" );

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
	
	
	  
	this.setup = function(texture) {
		 gl.useProgram(this.glProgram);		
		 gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
		 gl.enableVertexAttribArray(texCoordLocation);
		 gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
		//gl.useProgram(this.glProgram);
		/** add specific buffer and uniforms */
		 gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);
	     gl.uniform1i(rasterLoc , 0);		   
		 gl.activeTexture(gl.TEXTURE0);
		 gl.bindTexture(gl.TEXTURE_2D, texture);
	
	
		//gl.bindFramebuffer(gl.FRAMEBUFFER,null);	
		gl.viewport(0, 0, framebuffer.width, framebuffer.height);
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
		gl.disable(gl.DEPTH_TEST);
		//gl.disable(gl.BLEND);
		gl.disable(gl.BLEND);				
	}	
	this.render = function(texture) {
		
		this.setup(texture);
	
		gl.drawArrays(gl.TRIANGLES, 0, 6);	
		gl.bindTexture(gl.TEXTURE_2D, null);
	    gl.useProgram(null);
	   
		
	}
	this.getMax = function(texture, band){
		this.render(texture);
		var m = this.readPixels(band);
		//console.log("heatmap max "+m);
		return m;
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

	this.readPixels = function(band) {
		
		this.floatReader.render(this.maxTexture,band);
		
		var readf = this.floatReader.readPixels();
		var max = arrayMax(readf);
		//console.log(max);	 
		return max;

		
	
	}
	function arrayMax(arr) {
		  var len = arr.length, max = -Infinity;
		//  var heap = new Heap(function(a,b){return a.val > b.val});
		  while (len--) {
		//	  var item = [];
	//		  item.val = arr[len];
				var item = arr[len];
	//		  item.x = len;
	//		  heap.push(item);
		    if (item > max) {
		      max = item;
		    }
		  }
		  return max;//heap.pop().val;
		};
	
		
		
		
		this.getMaxExperiment = function(){
			this.render();
		//	this.readPixels();
			
		//	framebuffer = gl.createFramebuffer();
		//	renderbuffer = gl.createRenderbuffer();
			framebuffer.width = 1;
			framebuffer.height = 1;		

			
			texture = this.maxTexture;
			//gl.deleteTexture(this.maxTexture);
			this.maxTexture = gl.createTexture();
			this.maxTexture.name = "max";
			
			/** Framebuffer */
			gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

			/** Texture */
			gl.bindTexture(gl.TEXTURE_2D, this.maxTexture);
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
					gl.TEXTURE_2D, this.maxTexture, 0);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
					gl.RENDERBUFFER, renderbuffer);

			gl.bindTexture(gl.TEXTURE_2D, null);
			this.render();
			this.readPixels();
			gl.deleteTexture(texture);
			
		}
}
	