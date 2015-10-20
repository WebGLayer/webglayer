
function ParallelCoordinates(manager, div){

	/*var test_data  = new Float32Array([0.0, 0.1, 0.0, 0.0, 
	                                   0.1, 0.2, 0.1, 0.2, ]);
	
	var test_index = new Float32Array([-1,-0.5,0,0.5,-1,-0.5,0,0.5]);
	//manager.addDataBuffer(test_data, 1, 'td');
	//manager.addDataBuffer(test_index, 1, 'ti');
	

	
	//this.createBuffer(data, index);
	*/
	/*var indices = [0,1,1,2,4,5,5,6,7,8,8,9];
	var pcIndexBuffer = gl.createBuffer();
	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pcIndexBuffer);
	    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);*/
	   
	    
	
	this.elRect = this.mapdiv = document.getElementById(div).getBoundingClientRect();
		
	this.glProgram = GLU.compileShaders('pc_vShader', 'pc_fShader', this);
		
	var numfilters ="numfilters";
	manager.storeUniformLoc(this.glProgram, numfilters);
	

	this.render = function() {
			
		gl.useProgram(this.glProgram);
		
		manager.enableBuffer(this.glProgram, "indexpc");	
		manager.enableBuffer(this.glProgram, "td");
		manager.enableBuffer(this.glProgram, "ti");	
		
		gl.uniform1f(this.glProgram.numfilters, manager.filternum );	
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);	
		gl.viewport(this.elRect.left, manager.body_height-this.elRect.bottom, this.elRect.width, this.elRect.height);
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
	
		gl.blendFunc( gl.ONE, gl.ONE  );		
	
		//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, manager.databuffers['indicies']);//pcIndexBuffer);
	//	manager.bindElementBuffer("indicies");	
		manager.enableFilterTexture(this.glProgram);

		gl.lineWidth(1);
       // gl.drawElements(gl.LINES, manager.num_rec*4, gl.UNSIGNED_SHORT,0);
       	gl.drawArrays(gl.LINES, 0, manager.num_rec*4);
				
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
	
	this.createBuffer = function(data, index){
		var res = [];
		for (i in data){
			var d = data[i];
			for (var j in d){
				d[j]
			}
		}
		
	}
}

	