
function MapDimension(manager){
	Dimension.call(this, manager);
	
	this.rmatrix = new Float32Array(16);
	this.rmatrix.set([ 0.5, 0, 0, 0, 
	             0, 0.5, 0, 0, 
	             0, 0,    0, 0,
	             0.5, 0.5, 0, 1 ]);
	
	
	this.setup = function() {		
		gl.viewport(0, 0, this.width, this.height);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		gl.useProgram(this.glProgram);
		var matrixLoc = gl.getUniformLocation(this.glProgram, 'mapMatrix');
		gl.uniformMatrix4fv(matrixLoc, false, this.matrix);
		
		matrixLoc = gl.getUniformLocation(this.glProgram, 'rasterMatrix');
		gl.uniformMatrix4fv(matrixLoc, false, this.rmatrix);
		
		/** Bind texture*/
		this.create2DTexture();
				
		//gl.enable(gl.BLEND);
		//gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	
		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.BLEND);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);				
	}	
	
	this.tearDown = function(){
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
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
	