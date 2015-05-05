
function MapLineDimension(manager){
	this.manager = manager;
	Dimension.call(this, manager);
	

	this.setup = function() {
		
		//gl.useProgram(this.glProgram);
		/** add specific buffer and uniforms */
		gl.useProgram(this.glProgram);
		manager.bindMapMatrix(this.glProgram);
		manager.enableBufferForName(this.glProgram, "wPoint"+manager.year, "wPoint");
		manager.enableBufferForName(this.glProgram,  "attr"+manager.year+manager.time, "attr");
		manager.enableBufferForName(this.glProgram,  "index"+manager.year+"Line", "index");	
	
		manager.enableFilterTexture(this.glProgram);
		manager.bindRasterMatrix(this.glProgram);
		//this.manager.enableBufferForName(this.glProgram,  "attr0", "attr");
		//this.manager.enableBuffer(this.glProgram, "speed");
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);	
		gl.viewport(0, 0, manager.width, manager.height);
		
		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.BLEND);
		//gl.enable(gl.BLEND);
		//gl.blendFunc(gl.ONE, gl.ONE);
		if (this.glProgram.loc == null ){
			this.glProgram.loc = gl.getUniformLocation(this.glProgram, "zoom");
			if (!this.glProgram.loc instanceof WebGLUniformLocation) {				
				console.error("Uniform set failed, uniform: " + u_name
						+ " value " + value);
				return;
			}
		}
		/*set point size*/
		var z = map.getZoom();
	//	console.log( map.getZoom());
		if (z > 8){
			var zz = (z -7)/2;
			gl.uniform1f(this.glProgram.loc, zz);		
		} else {
			gl.uniform1f(this.glProgram.loc, 1);		
		}
		
		
		
		
				
	}	
	
	this.bindDrawSelect = function(val){
		if (this.glProgram.drawselect == null ){
			this.glProgram.drawselect = gl.getUniformLocation(this.glProgram, "drawselect");
			if (!this.glProgram.drawselect instanceof WebGLUniformLocation) {				
				console.error("Uniform set failed, uniform: drawselect"
						+ " value " + val);
				return;
			}
		}
	
		gl.uniform1f(this.glProgram.drawselect, val);		
	
	}
	
	
	this.render = function(num) {

		this.setup();
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
		this.bindDrawSelect(0);	
		gl.lineWidth(1);					 
		gl.drawArrays(gl.LINES, 0,  manager.num_rec*2);
		
		this.bindDrawSelect(1);	
		gl.lineWidth(4);					 
		gl.drawArrays(gl.LINES, 0,  manager.num_rec*2);		
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


MapLineDimension.prototype = Object.create(Dimension.prototype);

MapLineDimension.prototype.constructor = Dimension;
	