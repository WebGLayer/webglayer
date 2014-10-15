function Manager(canvasid) {

	/**
	 * Global variables
	 */
	canvas = document.getElementById(canvasid);
	div = canvas.parentElement;
	gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});

	
	this.dimensions = [];
	
	/**
	 * Common databuffers for all dimensions
	 */
	this.databuffers =[];
	this.matrices = [];
	
	this.filters = [];
	
	this.setMapMatrix = function(matrix){
		this.mapMatrix = matrix;		
	}
	
	this.rMatrix = new Float32Array(16);
	this.rMatrix.set([ 0.5, 0, 0, 0, 
	             0, 0.5, 0, 0, 
	             0, 0,    0, 0,
	             0.5, 0.5, 0, 1 ]);
	this.rMatrix.name = "rasterMatrix";
	this.matrices.push(this.rMatrix);

	
	this.addDimension = function(d){
		this.dimensions.push(d);
	}
	
	/**
	 * Creates a data buffer object. itemSize is a dimension of the data
	 */
	this.addDataBuffer = function(data, itemSize, name) {
		var buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
		buffer.itemSize = itemSize;
		buffer.numItems = data.length / itemSize;
		buffer.name = name;
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		this.databuffers.push(buffer);
	}
	

	
	/**
	 * traverse all dimensions and renders them
	 */

	this.render = function() {
		/* bind array buffers */
		 
		for (var i = 0; i < this.dimensions.length; i++) {
			d = this.dimensions[i];
			d.setup();
			this.enableBuffersAndCommonUniforms(d.glProgram);
			
			d.render(this.databuffers[0].numItems);
			d.tearDown();
		}
		
	}
	
	/**
	 * 
	 */
	this.enableBuffersAndCommonUniforms = function(prog) {
	
		gl.useProgram(prog);
		
		/*Fiteres, hardocodeed*/
		var rasterLoc = this.getUniformLoc(prog, 'mapFilter'); 		 
		gl.uniform1i(rasterLoc , 0);		   
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		
		/**
		 * Bind matrices
		 */
		for (var i in this.matrices){
			var m = this.matrices[i];
			var matrixLoc = this.getUniformLoc(prog, m.name);		
			gl.uniformMatrix4fv(matrixLoc, false, m);			
		}
		
		var matrixLoc = this.getUniformLoc(prog, this.mapMatrix.name);		
		gl.uniformMatrix4fv(matrixLoc, false,  this.mapMatrix);		

		
		
		
		for ( var i in this.databuffers) {
			var buf = this.databuffers[i];
			gl.bindBuffer(gl.ARRAY_BUFFER, buf);

			if (gl.getAttribLocation(prog, buf.name) >= 0) {
				var loc = gl.getAttribLocation(prog, buf.name);
				gl.enableVertexAttribArray(loc);
				gl.vertexAttribPointer(loc, buf.itemSize, gl.FLOAT,
						false, 0, 0);
			} else {
				console.log("Error: attribute " +  buf.name + " does not exist in program "+prog.name);
			}
		}
	}
	
	
	this.getUniformLoc = function(prog, name){
		var loc = gl.getUniformLocation(prog, name)
		if (loc==null){
			console.error("Error setting common uniform "+name+" for program "+ prog.name);
		} else {
			return loc;
		}			
	}
}
