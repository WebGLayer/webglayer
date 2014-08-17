	
	setupSpeed = function() {
		bin_count = 4;			
		canvas.setAttribute("width", bin_count);
		canvas.setAttribute("height",1);
		var w = canvas.width;
		var h = canvas.height;
		gl.viewport(0, 0, w, h);
		gl.clearColor(0.0, 0.0, 0.0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		matrix = new Float32Array(16);
		matrix.set([ 4/bin_count, 0, 0, 0, 	0, 1, 0, 0, 
		                0, 0, 0, 0, 	-1, 0, 0, 1 ]);

		gl.useProgram(this.glProgram);
		var matrixLoc = gl.getUniformLocation(this.glProgram, 'mapMatrix');
		gl.uniformMatrix4fv(matrixLoc, false, matrix);
		
		gl.disable(gl.DEPTH_TEST);		
		gl.enable(gl.BLEND);
		
		gl.blendFunc(gl.ONE, gl.ONE);	
		
		t = create1DTexture(Math.pow(2,2));		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, t);
		gl.uniform1i(gl.getUniformLocation(this.glProgram, "uSampler"), 0);
		gl.bindTexture(gl.TEXTURE_2D, null);
		
	}

	create1DTexture = function(size) {
		 var data = new Uint8Array(size*4);
		for (kk = 0 ; kk<data.length ; kk++ ){
			data[kk]=4.;
		}
	   
	    var texture = gl.createTexture();
	    gl.bindTexture(gl.TEXTURE_2D, texture);
	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	    gl.bindTexture(gl.TEXTURE_2D, null);
	}
	
	
	readPixels = function(){	
		var readout = new Uint8Array(4 * 1 * 1*4);
		console.time("reading");
		//gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		gl.readPixels(0, 0, 4 ,1, gl.RGBA, gl.UNSIGNED_BYTE, readout);
		console.timeEnd("reading");

		sum = 0;
		for(i=1;i< readout.length; i++){
			sum=sum+readout[i];
		}
		console.log(sum);
		console.log(readout);
	}
