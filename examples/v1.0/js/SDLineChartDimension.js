/**/
function SDLineChartDimension(manager, width) {
	var manager = manager;

	this.program = utils.loadShaders("sdlineChart_vShader", "sdlineChart_fShader", this);

	var framebuffer = gl.createFramebuffer();
	framebuffer.width = width;
	framebuffer.height = 1;

	var renderbuffer = gl.createRenderbuffer();

	this.lineTexture = gl.createTexture();
	this.lineTexture.name = "line chart texture";

	if (!gl.getExtension("OES_texture_float")) {
		console.log("OES_texture_float not availble -- this is legal");
	}
	/** Framebuffer */
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

	/** Texture */
	gl.bindTexture(gl.TEXTURE_2D, this.lineTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // Prevents
	
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebuffer.width,
			framebuffer.height, 0, gl.RGBA, gl.FLOAT, null);

	/** Render buffer */
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
			framebuffer.width, framebuffer.height);

	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D, this.lineTexture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
			gl.RENDERBUFFER, renderbuffer);

	gl.bindTexture(gl.TEXTURE_2D, null);

	this.floatReader = new FloatRasterReader(this.lineTexture,
			framebuffer.width, framebuffer.height);
	var rasterLoc = gl.getUniformLocation(this.program, "lineRaster" );
	

	this.render = function() {
		gl.useProgram(this.program);
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

		gl.viewport(0, 0, framebuffer.width, framebuffer.height);
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);

	//	manager.enableBuffersAndCommonUniforms(this.program);
		manager.enableBufferForName(this.program,  "findex", "findex");			
		manager.enableBufferForName(this.program, "attr", "attr");
			
	//	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	    gl.uniform1i(rasterLoc , 0);		   
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.lineChartTexture);
		 
		gl.drawArrays(gl.POINTS, 0, manager.num_frames);
	

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);

	}

	this.readPixels = function() {

		/* console.time("reading filter"); */
		gl.useProgram(this.program);

		
		 gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer); var readout = new
		 Float32Array(framebuffer.width * framebuffer.height * 4);
		 gl.readPixels(0, 0, framebuffer.width, framebuffer.height, gl.RGBA,
		 gl.FLOAT, readout); console.log("HistDim:"); console.log(readout);
		

		/*
		 * sum = 0; for (i = 0; i < readout.length; i++) { sum = sum +
		 * readout[i]; } console.log(sum);
		 */

		//gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		// return readout;*/

		this.floatReader.setup()
		this.floatReader.render();
		var readout = this.floatReader.readPixels();

		var res =[];

		console.log(readout);
		/*for (var m = 0; m < metadata.length; m++) {
			res[m] = new Array(metadata[m].num_bins);
			res[m].max = {0:0,1:0,2:0,3:0};
			for (var i = 0; i < metadata[m].num_bins; i++) {
				var s = metadata[m].max / metadata[m].num_bins;
				
				var dimid = m * metadata.max_bins*3;
				var d = {					
					min : i * s,
					max : (i + 1) * s,
					selected : readout[dimid+i],
					unselected : readout[dimid+i + 1 * metadata.max_bins],
					out : readout[dimid+i + 2 * metadata.max_bins]
				};
				
				if (d.selected > res[m].max[0]){res[m].max[0] = d.selected};
				if (d.unselected+d.selected > res[m].max[1]){res[m].max[1] = d.unselected+d.selected};
				if (d.out+d.unselected+d.selected > res[m].max[2]){res[m].max[2] = d.out+d.unselected+d.selected};				
				res[m][i] = d;
			}
		}*/
		
		var res = []; 
		for (var i = 0; i < width; i++){		
			var d = [];
			d.value = readout[i];
			d.date=i;
			d.numrec=readout[width+i];
			res[i]=d
		}
		
		return res;

	}

}

