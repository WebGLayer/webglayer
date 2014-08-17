
function Manager(canvasid) {
	
	this.dimensions = [];
	this.databuffers = [];
	setGL(canvasid);
			
	/* bind vbo */

    
	/*init webgl*/	
	function setGL(canvasid){
		canvas = document.getElementById(canvasid);
		div = canvas.parentElement;	
		gl = canvas.getContext('webgl', {
			antialias : false
		});
		return gl;
	}	
}

Manager.prototype.addData = function(data, itemSize, name){
	buffer = gl.createBuffer();  
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data,gl.STATIC_DRAW);
	buffer.itemSize = itemSize;
	buffer.numItems = data.length/itemSize;
	buffer.name = name;
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	this.databuffers.push(buffer);
}

Manager.prototype.render = function(){
	/* bind array buffers*/	
	
	for (i = 0; i < this.dimensions.length; i++) {			
		d = this.dimensions[i];	
		d.glSetup();
		d.enableBuffers(this.databuffers);
		d.render(this.databuffers[0].numItems);
	}
	
	for (dim in this.dimensions) {		
		/* use program */		
		/* render */
		/* update visuals */
	}
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
}



