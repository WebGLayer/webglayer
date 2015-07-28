HistFilterRender = function(manager, metadata){	
	
	//this.manager = manager;
	
	var filters = [];
	
	//for (var m = 0 ; m < metadata.length ; m++){
	//	var y = ((m + 0.5) / metadata.length) * 2 - 1;
	//	filters[m] = new Float32Array([-1.1,y,1.1,y]);				
	//}
	var numdims= Object.keys(metadata).length;

	for (var i in metadata){
		
		var m = metadata[i];
		var y = ((m.index + 0.5) / numdims) * 2 - 1;
		filters[m.index] = new Float32Array([-1.1,y,1.1,y]);				
	}
	
	var pointsSize = 0;
	var height = numdims;
	var width = manager.max_bins;
		
	this.filterProgram = GLU.compileShaders("histFilter_vShader",  "histFilter_fShader", this);
	this.filterProgram.name ="HistFitler";
	/***
	 * Buffers
	 */
	var posBuffer = gl.createBuffer();
	posBuffer.attr="FilterLines";
	
	var framebuffer = gl.createFramebuffer();			
	var renderbuffer = gl.createRenderbuffer();
	
	this.filterTexture = gl.createTexture();
	this.filterTexture.name = "hist filter texture";


	/*Initialise offscreen buffer*/
		
		/** Framebuffer */
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

		/** Texture*/
		gl.bindTexture(gl.TEXTURE_2D, this.filterTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width,
				height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		
		
		/** Render buffer*/
		gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
				width, height);

		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
				gl.TEXTURE_2D, this.filterTexture, 0);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
				gl.RENDERBUFFER, renderbuffer);
		
		
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);

	

	
	
	this.renderFilter = function(){		
		gl.useProgram(this.filterProgram);
		gl.bindTexture(gl.TEXTURE_2D, this.filterTexture);
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		
		gl.viewport(0, 0, width, height);
			
		
		this.bindFilters();	
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		
		
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
		// this.setUniforms();
				
		gl.disable(gl.BLEND);
		gl.disable(gl.DEPTH_TEST);
		
	
		//utils.enableAttribute(this.filterProgram, posBuffer);
		//manager.enableBuffer(this.filterProgram, posBuffer.attr);
		gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
		
		if (this.filterProgram[posBuffer.attr] == null){
			this.filterProgram[posBuffer.attr] = gl.getAttribLocation(this.filterProgram, posBuffer.attr);
		}		
		if (this.filterProgram[posBuffer.attr] >= 0){
			gl.enableVertexAttribArray(this.filterProgram[posBuffer.attr]);
			gl.vertexAttribPointer(this.filterProgram[posBuffer.attr], 2, gl.FLOAT, false, 0, 0);
		} else {
			console.error("Error binding buffer: "+posBuffer);
			return;
		}
	
		gl.drawArrays(gl.LINES, 0, pointsSize);		
		//this.readPixels();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		
	}
	
	
	
	this.createFilteringData = function(ch_row, points){
		if (points.length==0){		
			var y = ((ch_row + 0.5) / manager.dimnum) * 2 - 1;
			filters[ch_row] = new Float32Array([-1.1,y,1.1,y]);												
		} else {
			filters[ch_row] = points;
		}
	//	console.log(points);
		//console.log(filters);		
		//this.bindFilters();			
	}
	
	this.bindFilters = function(){
		var allfilters = [];
		var m = 0;
		for (var i = 0; i < filters.length; i++){
			for(var j = 0; j < filters[i].length; j++){
				var index = m++;
				allfilters[index] = filters[i][j];
				if (index%2 ==0 && (allfilters[index]<=1. && allfilters[index]>=-1. ) ){
				//	allDataFilter.hasHistFilter= true;
				}
			}
		
		}
		
		var f = new Float32Array(allfilters);
		//	console.log( f);
			//console.log("...........")
			gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer );
			gl.bufferData(gl.ARRAY_BUFFER, f, gl.STATIC_DRAW);	
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			
			pointsSize = allfilters.length/2;
	}
	
	this.readPixels = function() {
		
//		console.time("reading filter");
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		var readout = new Uint8Array(width * height * 4);
		gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, readout);
	//	console.timeEnd("reading");

		sum = 0;
	/*	for (var i = 0; i < readout.length; i++) {
			readout[i];
		}**/
		//console.log(sum);
		console.log(readout);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}
	
}