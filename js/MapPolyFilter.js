function MapPolyFilter(manager){	
	var manager = manager;
	
	this.isspatial = 1.0;
	var pointsSize = 0;	
	this.filterProgram = GLU.compileShaders("mapFilter_vShader",  "mapFilter_fShader", this);
	/***
	 * Buffers
	 */
	var posBuffer = gl.createBuffer();
	posBuffer.attr="poly";
	
	var framebuffer = gl.createFramebuffer();			
	var renderbuffer = gl.createRenderbuffer();

	//var saved_filter;
	
	this.filterTexture = gl.createTexture();
	this.filterTexture.name = "filter texture";
		
	this.createMapFramebuffer = function(){ 
		
		/*Initialise offscreen buffer*/
		
		/** Framebuffer */
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

		/** Texture*/
		gl.bindTexture(gl.TEXTURE_2D, this.filterTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, manager.w,
				manager.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		
		
		/** Render buffer*/
		gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
				manager.width, manager.height);

		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
				gl.TEXTURE_2D, this.filterTexture, 0);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
				gl.RENDERBUFFER, renderbuffer);
		
		
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	
	this.createMapFramebuffer();
	
	this.renderFilter = function(){		
		gl.useProgram(this.filterProgram);
		manager.bindMapMatrix(this.filterProgram);
		gl.bindTexture(gl.TEXTURE_2D, this.filterTexture);
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		
		gl.viewport(0, 0, manager.w, manager.h);
		
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
	
		
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
				
		gl.disable(gl.BLEND);
		gl.disable(gl.DEPTH_TEST);
		
	
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
		
		gl.drawArrays(gl.TRIANGLES, 0, pointsSize);		
		
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		
	}
	
	this.updateFilter = function(){
		this.createFilteringData(this.saved_filter);
		this.renderFilter();
	}
	
	this.createFilteringData = function(polygons){	
		this.saved_filter = polygons;
		//console.log(polygons);
		//console.log("...........")
		var points = new Array();		
		for (var pol in polygons){
			points.push.apply(points,polygons[pol]);
		}
		//console.log(points);
		var p = new Float32Array(points);
		gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, p, gl.STATIC_DRAW);	
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		pointsSize = points.length/2;
		
		
	}
	
	this.readPixels = function() {
		
	//	console.time("reading filter");
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		var readout = new Uint8Array(this.width * this.height * 4);
		gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, readout);
	//	console.timeEnd("reading");

		sum = 0;
		for (i = 0; i < readout.length; i++) {
			sum = sum + readout[i];
		}
		//console.log(sum);
		//console.log(readout);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}
	
	
}

