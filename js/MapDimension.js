
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
		
		matrixLoc = gl.getUniformLocation(this.glProgram, 'rMatrix');
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
	
	this.create2DTexture = function() {
	    /*var data = new Uint8Array(10*10*4);
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
	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 8, 8, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);
	  
	    */

	    i = gl.getUniformLocation(this.glProgram, "uSampler") 
	    if (i!= null){
	    	gl.uniform1i(i , 0);
	    } else {
	    	console.log("Error... uniform uSampler does not exist.");
	    	return;
	    }
	    gl.activeTexture(gl.TEXTURE0);
	    gl.bindTexture(gl.TEXTURE_2D, this.texture);
	  //  gl.uniform1i(i, 0);
	   
	
		
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
	