
function HeatMapRenderer(manager){
	
	this.glProgram = GLU.compileShaders("heatmap_render_vShader",  "heatmap_render_fShader");
	gl.useProgram(this.glProgram);	
	var texCoordLocation = gl.getAttribLocation(this.glProgram, "v_texCoord");
	var rasterLoc = 	   gl.getUniformLocation(this.glProgram, "heatmap_raster" );
	manager.storeUniformLoc(this.glProgram, "max");
	manager.storeUniformLoc(this.glProgram, "min");
	manager.storeUniformLoc(this.glProgram, "max_filter");
	manager.storeUniformLoc(this.glProgram, "min_filter");
	manager.storeUniformLoc(this.glProgram, "colors");
	manager.storeUniformLoc(this.glProgram, "unselcolors");
	manager.storeUniformLoc(this.glProgram, "reduceSelection");
	
	
	this.colors =  new Float32Array(16);
	this.colors.set([ 1, 0, 0, 1, 
		              1, 1, 0, 1, 
		              0, 1, 0, 1,
		              0, 0, 0, 1 ]);
	
	this.unselcolors =  new Float32Array(16);
	this.unselcolors.set([  49/256, 130/256, 189/256, 1,
	                       158/256, 202/256, 225/256, 1, 
	                       222/256, 235/256, 247/256, 1, 
	                       0, 0, 0, 1 ]);
	//var legend = new HeatMapLegend('legend');

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
	  
	  gl.useProgram(this.glProgram);		
	  gl.uniformMatrix4fv(this.glProgram.colors, false, this.colors);
	  gl.uniformMatrix4fv(this.glProgram.unselcolors, false, this.unselcolors);
	  gl.useProgram(null);		
	
	  
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
	
	
		gl.bindFramebuffer(gl.FRAMEBUFFER,null);	
		gl.viewport(manager.l, manager.b, manager.w, manager.h);
	//	gl.clearColor(0.0, 0.0, 0.0, 0.0);
	//	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.BLEND);
		gl.enable(gl.BLEND);		
		gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA  );

	}	
	

	this.render = function(min, max, min_f, max_f, reduceSelection) {
		//legend.updateMax(max);
		this.setup();
	
		//console.log(max);
	    gl.uniform1f(this.glProgram.max, max);	
	    gl.uniform1f(this.glProgram.min, min);
	    gl.uniform1f(this.glProgram.max_filter, max_f);	
	    gl.uniform1f(this.glProgram.min_filter, min_f);
	    gl.uniform1f(this.glProgram.reduceSelection, reduceSelection);
	   
	   
	   //console.log("max a min filter " +  min_f + " " +max_f )
	   //console.log("max a min        " +  min + " " +max )
	    
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


	
}
	