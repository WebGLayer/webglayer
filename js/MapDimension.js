
function MapDimension(manager){
	Dimension.call(this, manager);
	var gl = manager.getGL();
	var canvas = manager.getCanvas();
	var div = manager.getDiv();
	
	var filterBuffer;
	
	
	this.setup = function() {
		canvas.setAttribute("width", div.offsetWidth);
		canvas.setAttribute("height", div.offsetHeight);
		var w = canvas.width;
		var h = canvas.height;
		gl.viewport(0, 0, w, h);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		matrix = new Float32Array(16);
		matrix.set([ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ]);

		gl.useProgram(this.glProgram);
		var matrixLoc = gl.getUniformLocation(this.glProgram, 'mapMatrix');
		gl.uniformMatrix4fv(matrixLoc, false, matrix);
				
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	
		
		
						
	}
	
}

MapDimension.prototype.filter = function(raster) {
	/*rendertriangel*/
	
	/*use result as uniform*/
	
}




MapDimension.prototype = Object.create(Dimension.prototype);

MapDimension.prototype.constructor = Dimension;
	