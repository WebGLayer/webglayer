function Manager(canvasid) {

	var canvas = document.getElementById(canvasid);
	var div = canvas.parentElement;
	var gl = canvas.getContext('webgl', {});

	this.dimensions = [];
	this.databuffers = [];

	this.getGL = function(){
		return gl;
	}
	this.getCanvas = function(){
		return canvas;
	}
	this.getDiv = function(){
		return div;
	}
	
	/**
	 * Creates a data buffer object. itemSize is a dimension of the data
	 */
	this.addData = function(data, itemSize, name) {
		buffer = gl.createBuffer();
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
			d.enableBuffers(this.databuffers);
			d.render(this.databuffers[0].numItems);
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
}

