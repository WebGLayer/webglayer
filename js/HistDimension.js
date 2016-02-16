/**/
function HistDimension(manager, meta) {
	
	this.isSpatial = false;
	
	var valcalc = function(i){
		return meta.min + i * (meta.max -meta.min) / (meta.num_bins);
		};

	var valcalcMeta = function(i, metaData){
		if (metaData ==undefined){
			return i;
			} else {
				return metaData.min + i * (metaData.max -metaData.min) ;
			}
		};
			
	
	
	/*metadata for value array*/
	var valueMetadata ;
	this.name = meta.name;
	
	this.program = GLU.compileShaders("linearhist_vShader", "linearhist_fShader", this);

	/** default function to calculate final value */
	this.valFunction = function(val, count){
		return val;		
	}

	
	/** default blending function*/
	this.reduceFunction = function(gl){
		gl.blendFunc(gl.ONE, gl.ONE);
	}
	
	/** default blending function*/
	this.setValueData = function(data){
		this.program = GLU.compileShaders("linearhist_param_vShader", "linearhist_param_fShader", this);
		valueMetadata = data;			
		
		gl.useProgram(this.program);
		manager.storeUniformLoc(this.program, "numfilters");
		gl.useProgram(null);
	}
	
	gl.useProgram(this.program);
	manager.storeUniformLoc(this.program, "numfilters");
	gl.useProgram(null);
	
	var framebuffer = gl.createFramebuffer();
	framebuffer.width = meta.num_bins;
	framebuffer.height = 1;

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
		
		/*set blending according*/
		this.reduceFunction(gl);
		
		manager.enableBufferForName(this.program,  "index", "index");	
		manager.enableFilterTexture(this.program);	
	//	manager.bindRasterMatrix(this.program);
		gl.uniform1f(this.program.numfilters, 	manager.trasholds.allsum );	
		//gl.finish();
		//console.log("Filter num "+manager.filternum);
			
		manager.enableBufferForName(this.program, meta.name, "attr");
	
		
	    /*bind value buffer if defined*/ 
	    if (valueMetadata!=undefined){
	    	manager.enableBufferForName(this.program, valueMetadata.name, "value");
	    }
		
		gl.drawArrays(gl.POINTS, 0, manager.num_rec);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);

	}


	this.setToOrdinal = function( ){
		valcalc = function(i){ 
			return meta.domain[i];
			}	
	}

	this.setToLinear = function() {
			valcalc = function(i){ 
			return (i + meta.min ) * (meta.max -meta.min) / (meta.num_bins)
			}	
	}
	this.readPixels = function() {

		/* console.time("reading filter"); */
		gl.useProgram(this.program);

		
		//gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer); var readout = new
		//Float32Array(framebuffer.width * framebuffer.height * 4);
		// gl.readPixels(0, 0, framebuffer.width, framebuffer.height, gl.RGBA,
		// gl.FLOAT, readout); 
		//console.log(readout);

		this.floatReader.setup()
		this.floatReader.render();
		var readout = this.floatReader.readPixels();
		
		//console.log(readout);

		var res;

		
		res = new Array(meta.num_bins);
		res.max = {0:0,1:0,2:0,3:0};
		res.sum_selected = 0;
	
		

		for (var i = 0; i < meta.num_bins; i++) {								
					
				var count =  readout[i + 3 *  meta.num_bins];
				
				var sel   = valcalcMeta(readout[i], valueMetadata);
				var unsel = valcalcMeta(readout[i + 1 *  meta.num_bins], valueMetadata);
				var out   = valcalcMeta(readout[i + 2 *  meta.num_bins], valueMetadata);	

				var d = {					
					val : valcalc(i) ,
					selected : this.valFunction(sel,count),
					unselected :this.valFunction(unsel,count),
					out : this.valFunction(out,count)						
				};
				
				if (d.selected > res.max[0]){res.max[0] = d.selected};
				if (d.unselected+d.selected > res.max[1]){res.max[1] = d.unselected+d.selected};
				if (d.out+d.unselected+d.selected > res.max[2]){res.max[2] = d.out+d.unselected+d.selected};	

				res.sum_selected = res.sum_selected + d.selected;			
				res[i] = d;
			}
		
		return res;

	}

}