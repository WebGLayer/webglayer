	
	setupSpeed = function() {
		bin_count = 200;
		
		canvas.setAttribute("width", 200);
		canvas.setAttribute("height",5);
		var w = canvas.width;
		var h = canvas.height;
		gl.viewport(0, 0, w, h);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		matrix = new Float32Array(16);
		matrix.set([ 2/200, 0, 0, 0, 	0, 1, 0, 0, 
		                 0, 0, 0, 0, 	-1, 0, 0, 1 ]);

		gl.useProgram(this.glProgram);
		var matrixLoc = gl.getUniformLocation(this.glProgram, 'mapMatrix');
		gl.uniformMatrix4fv(matrixLoc, false, matrix);
				
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);	
						
	}
