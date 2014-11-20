
function MapDimension(manager){
	this.manager = manager;
	Dimension.call(this, manager);
	

	this.setup = function() {
		
		//gl.useProgram(this.glProgram);
		/** add specific buffer and uniforms */
		gl.useProgram(this.glProgram);
		this.manager.bindMapMatrix(this.glProgram);
		this.manager.enableBuffer(this.glProgram, "wPoint");
		this.manager.enableBuffer(this.glProgram, "speed");
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);	
		gl.viewport(0, 0, manager.width, manager.height);
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.BLEND);
		//gl.enable(gl.BLEND);
		//gl.blendFunc(gl.ONE, gl.ONE);
		var loc = gl.getUniformLocation(this.glProgram, "zoom");
		if (loc instanceof WebGLUniformLocation) {
			gl.uniform1f(loc, map.getZoom());
		} else {
			console.error("Uniform set failed, uniform: " + u_name
					+ " value " + value);
			return;
		}
		
				
	}	
	this.render = function(num) {

		//gl.useProgram(this.glProgram);		
		var loc = gl.getUniformLocation(this.glProgram, "drawselect");
		if (loc instanceof WebGLUniformLocation) {
			gl.uniform1f(loc, 0);
		} else {
			console.error("Uniform set failed, uniform");
			return;
		}
		gl.drawArrays(gl.POINTS, 0, num);	
		
		if (loc instanceof WebGLUniformLocation) {
			gl.uniform1f(loc, 1);
		} else {
			console.error("Uniform set failed, uniform");
			return;
		}
		gl.drawArrays(gl.POINTS, 0, num);	
	    gl.useProgram(null);
	    gl.finish();
		
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

MapDimension.prototype.filter = function(raster) {
	/*rendertriangel*/
	
	/*use result as uniform*/	
}


MapDimension.prototype = Object.create(Dimension.prototype);

MapDimension.prototype.constructor = Dimension;
	