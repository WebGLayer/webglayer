/**/
function HistogramDimension(manager, meta) {
	var manager = manager;
	var metadata = meta;
	this.isSpatial = false;
	
	this.program = GLU.compileShaders("hist_vShader", "hist_fShader", this);

	gl.useProgram(this.program);
	manager.storeUniformLoc(this.program, "attr_row");
	manager.storeUniformLoc(this.program, "numfilters");
	
	var framebuffer = gl.createFramebuffer();
	framebuffer.width = manager.max_bins;
	framebuffer.height = Object.keys(metadata).length;

	var renderbuffer = gl.createRenderbuffer();

	this.histTexture = gl.createTexture();
	this.histTexture.name = "histogram texture";

	if (!gl.getExtension("OES_texture_float")) {
		console.log("OES_texture_float not availble -- this is legal");
	}
	/** Framebuffer */
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

	/** Texture */
	gl.bindTexture(gl.TEXTURE_2D, this.histTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // Prevents
	// s-coordinate
	// wrapping
	// (repeating).
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebuffer.width,
			framebuffer.height, 0, gl.RGBA, gl.FLOAT, null);

	/** Render buffer */
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
			framebuffer.width, framebuffer.height);

	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D, this.histTexture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
			gl.RENDERBUFFER, renderbuffer);

	gl.bindTexture(gl.TEXTURE_2D, null);

	this.floatReader = new FloatReaderHistogram(this.histTexture,
			framebuffer.width, framebuffer.height);

	this.render = function() {
		gl.useProgram(this.program);
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

		gl.viewport(0, 0, framebuffer.width, framebuffer.height);
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);


		manager.enableBufferForName(this.program,  "index", "index");	
		manager.enableFilterTexture(this.program);	
		manager.bindRasterMatrix(this.program);

		//gl.finish();

		for (var i in metadata) {
			var m = metadata[i];
			/* set unifom */
			var r = (m.index / framebuffer.height) * 2 - 1 + (1 / framebuffer.height);
			gl.uniform1f(this.program.attr_row, r);
			gl.uniform1f(this.program.numfilters, manager.dimnum);
			console.log("Filter num "+manager.dimnum);
			
			manager.enableBufferForName(this.program, m.name, "attr");
			gl.drawArrays(gl.POINTS, 0, manager.num_rec);
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);

	}

	this.readPixels = function() {

		/* console.time("reading filter"); */
		gl.useProgram(this.program);

		
		// gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer); var readout = new
		// Float32Array(framebuffer.width * framebuffer.height * 4);
		// gl.readPixels(0, 0, framebuffer.width, framebuffer.height, gl.RGBA,
		// gl.FLOAT, readout); 
		// console.log("HistDim:");
		// console.log(readout);
		

		/*
		 * sum = 0; for (i = 0; i < readout.length; i++) { sum = sum +
		 * readout[i]; } console.log(sum);
		 */

		//gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		// return readout;*/

		this.floatReader.setup()
		this.floatReader.render();
		var readout = this.floatReader.readPixels();
		
		//console.log(readout);

		var res =[];

		
		for (var m in metadata) {

			var meta = metadata[m];
			res[m] = new Array(meta.num_bins);
			res[m].max = {0:0,1:0,2:0,3:0};

			var valcalc;
			if (meta.type=='linear'){
					valclac = function(i){ return (i + meta.min ) * (meta.max -meta.min) / (meta.num_bins)}	
				} else if (meta.type=='ordinal'){
					valclac = function(i){return meta.domain[i]};
				}
			for (var i = 0; i < meta.num_bins; i++) {				
				
				
				var dimid = meta.index * manager.max_bins*3;
				var d = {					
					val : valclac(i) ,
					selected : readout[dimid+i],
					unselected : readout[dimid+i + 1 *  manager.max_bins],
					out : readout[dimid+i + 2 *  manager.max_bins]
				};
				
				if (d.selected > res[m].max[0]){res[m].max[0] = d.selected};
				if (d.unselected+d.selected > res[m].max[1]){res[m].max[1] = d.unselected+d.selected};
				if (d.out+d.unselected+d.selected > res[m].max[2]){res[m].max[2] = d.out+d.unselected+d.selected};				
				res[m][i] = d;
			}
		}
		return res;

	}

}

