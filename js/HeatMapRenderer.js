
function HeatMapRenderer(){
	
	this.glProgram = GLU.compileShaders("heatmap_render_vShader",  "heatmap_render_fShader",this);
	
	var texCoordLocation = gl.getAttribLocation(this.glProgram, "v_texCoord");
	var rasterLoc = 	   gl.getUniformLocation(this.glProgram, "heatmap" );
	manager.storeUniformLoc(this.glProgram, "max");

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
		 gl.bindTexture(gl.TEXTURE_2D, this.heatTexture);
	
	
		//gl.bindFramebuffer(gl.FRAMEBUFFER,null);	
		gl.viewport(0, 0, manager.width, manager.height);
		//gl.clearColor(0.0, 0.0, 0.0, 0.0);
		//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
		gl.disable(gl.DEPTH_TEST);
		//gl.disable(gl.BLEND);
		gl.enable(gl.BLEND);		
		gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA  );
		
	
		
		
				
	}	
	this.render = function(max) {

		this.setup();
	
	    gl.uniform1f(this.glProgram.max, max);	
		gl.drawArrays(gl.TRIANGLES, 0, 6);	
		gl.bindTexture(gl.TEXTURE_2D, null);
	    gl.useProgram(null);
	   
		
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
		
		gl.useProgram(this.program);

		
		 gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		 var readout = new Float32Array(16);
		 gl.readPixels(5, 5, framebuffer.width, framebuffer.height, gl.RGBA,
			 gl.FLOAT, readout); 
			 console.log(readout);
	
	}
	
}
	