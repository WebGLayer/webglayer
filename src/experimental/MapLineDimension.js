WGL.experimental.MapLineDimension = function(id){
	
	var manager = WGL.getManager();
	var GLU = WGL.internal.GLUtils;
	
	this.id = id;
	this.isSpatial = true;
	this.glProgram = GLU.compileShaders('mapline_vShader', 'mapline_fShader', this);
	
	this.name = "map";
	
	var zoom = 'zoom';
	var drawselect = 'drawselect';
	var numfilters = 'numfilters';
	
	var heatMapMaximim = 0;
	var heatMapMinimum = 0;
	
	gl.useProgram(this.glProgram);
	manager.storeUniformLoc(this.glProgram, zoom);
	manager.storeUniformLoc(this.glProgram, drawselect);
	manager.storeUniformLoc(this.glProgram, numfilters);
	var framebuffer = gl.createFramebuffer();
	
	this.renderer2 = new WGL.dimension.IluminationRenderer(manager);
	this.renderer = new WGL.dimension.HeatMapRenderer(manager);
	
	/*indicate if the point has a value or just 1 should be used for every point*/
	this.hasValues = true;
	// this.manager = manager;
	// Dimension.call(this, manager);
	this.isSpatial = true;
	this.lockScale = false;

	
	this.maxcal = new WGL.internal.MaxCalculator(Math.floor(manager.w / 5),
			Math.floor(manager.h / 5));
	var framebuffer = gl.createFramebuffer();
	var last_num;

	var visible = true;
	var doGetMax = true;
	var legend;
	this.setVisible = function(v) {
		visible = v;
	}

	this.setDoGetMax = function(m) {
		doGetMax = m;
	}

	/* default radiusFunc */
	this.radiusFunction = function(r, z) {
		return Math.pow(z, 2) / 10;
	};

	/* default getMax function */
	this.maxFunction = function(max) {
		if (max == undefined) {
			return 99999999;
		}
		return max;
	}
	/* default getMin function */
	this.minFunction = function(min) {
		return 0;
	}

	this.setValuesBuffer = function(buffername){
						
		this.valueBufferName = buffername;
	}
	
	this.addLegend = function(thelegend) {
		legend = thelegend;
		legend.setDimension(this);
	}
	this.createMapFramebuffer = function() {
		framebuffer.width = manager.w;
		framebuffer.height = manager.h;

		var renderbuffer = gl.createRenderbuffer();

		this.heatTexture = gl.createTexture();
		this.heatTexture.name = "line heat map texture";

		if (!gl.getExtension("OES_texture_float")) {
			console.log("OES_texture_float not availble -- this is legal");
		}
		/** Framebuffer */
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

		/** Texture */
		gl.bindTexture(gl.TEXTURE_2D, this.heatTexture);
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
				gl.TEXTURE_2D, this.heatTexture, 0);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
				gl.RENDERBUFFER, renderbuffer);

		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	this.createMapFramebuffer();
	gl.useProgram(null);
	
	var visible = true;
	this.setVisible = function(v){
		visible = v;
	}

	/* default getMax function */
	this.maxFunction = function(max) {
		if (max == undefined) {
			return 99999999;
		}
		return max;
	}
	/* default getMin function */
	this.minFunction = function(min) {
		return 0;
	}
	
	this.setup = function() {
		
		//gl.useProgram(this.glProgram);
		/** add specific buffer and uniforms */
		gl.useProgram(this.glProgram);
		
		gl.uniform1f(this.glProgram.numfilters, manager.trasholds.allsum );		
		manager.bindMapMatrix(this.glProgram);
		manager.enableBufferForName(this.glProgram, "wPoint", "wPoint");
		manager.enableBufferForName(this.glProgram, "normals", "normals");
		manager.enableBufferForName(this.glProgram, "index", "index");	
		manager.bindRasterMatrix(this.glProgram);
		
		if (this.valueBufferName!=undefined){
			manager.enableBufferForName(this.glProgram, this.valueBufferName, "values" );
		}	
		manager.bindRasterMatrix(this.glProgram);

		gl.bindTexture(gl.TEXTURE_2D, this.heatTexture);
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

		gl.viewport(0, 0, manager.w, manager.h);
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.disable(gl.DEPTH_TEST);
		// gl.disable(gl.BLEND);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);

		manager.enableFilterTexture(this.glProgram);
	
		/*set point size*/		
	//	console.log( map.getZoom());
		
		gl.uniform1f(this.glProgram.loc, manager.zoom);				
		
				
	}	
	
	var renderMin;
	var renderMax;
	
	this.render = function(num) {
		if (visible == false) {
			return;
		}
		this.renderData(num);
		// var max = maxcale.getMax(this.heatTexture);
		if (!this.lockScale) {
			if (doGetMax) {
				this.maxall = this.maxcal.getMax(this.heatTexture, 1);
				if (manager.trasholds.spatsum > 0) {
					this.maxsel = this.maxcal.getMax(this.heatTexture, 0);
				}
			}
			renderMax = this.maxFunction(this.maxall);
			renderMin = this.minFunction(this.maxall);
			this.maxVal = this.maxall;
			this.minVal= 0;
		} 			
		renderMax = this.maxFunction(this.maxVal);
		renderMin = this.minFunction(this.minVal);
			// if (typeof(the_filter) !='undefined') {
			if (manager.trasholds.spatsum > 0) {
				// var maxsel = this.maxcal.getMax(this.heatTexture, 0);
				if (typeof (the_filter) != 'undefined') {
					/* there is a color filter applied */
					this.renderer.render(renderMin, renderMax, the_filter[0],
							the_filter[1], this.maxsel);
					legend.updateMaxAll(this.maxall);
					legend.drawWithFilter(this.maxsel);
				} else {
					this.renderer.render(renderMin, renderMax, renderMin, renderMax,
							this.maxsel);
					legend.drawWithoutFilter();
					legend.updateMaxAll(this.maxsel );
				}
				if (legend != undefined) {
					// legend.drawWithFilter(maxsel);
				}
				// legend.updateMaxSel(this.maxall);
			} else {
				// this.renderer.render( renderMin, renderMax, 0, 0);
				this.renderer.render(renderMin, renderMax, renderMin, renderMax,
						renderMax);
				if (legend != undefined) {
					legend.drawWithoutFilter();
					legend.updateMaxAll(this.maxall);
				}
			}
			
			//this.renderer2.render(renderMin, renderMax, renderMin, renderMax,	renderMax);
	}
	this.renderData = function(num) {
		
		if (visible == false){		
			return;
		}

		this.setup();	
		manager.enableFilterTexture(this.glProgram);
		//gl.useProgram(this.glProgram);	
		if (this.glProgram.drawselect == null){
			this.glProgram.drawselect = gl.getUniformLocation(this.glProgram, "drawselect");
			if (!this.glProgram.drawselect instanceof WebGLUniformLocation) {
				console.error("Uniform set failed, uniform");
				return;
			}
		}
		gl.uniform1f(this.glProgram.drawselect, 0);
		gl.lineWidth(5);
		//gl.drawArrays(gl.LINES, 0, num);	
		
		gl.uniform1f(this.glProgram.drawselect, 1);
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		gl.drawArrays(gl.LINES, 0, num);	
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	    gl.useProgram(null);
	    this.renderer.heatTexture = this.heatTexture;
		//this.renderer2.heatTexture = this.heatTexture;
		
	}
	
	this.tearDown = function(){
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.useProgram(null);
	}
	

	this.setMatrix = function(matrix){
		manager.matrices.push(matrix);	
		manager.mapMatrix=matrix;
	}

	this.readPixels = function() {
		
	//	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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

	this.calcNormals = function(data){
		var normals = new Float32Array(data.length);
		var j= 0;
		for (var i = 0; i< data.length; i=i+4){
			var sx=data[i];
			var sy=data[i+1];
			var tx=data[i+2];
			var ty=data[i+3];
			var l = Math.sqrt(Math.pow(tx-sx, 2) + Math.pow(ty-sy,2));
			var nx = (ty-sy) / l;
			var ny= -(tx-sx) / l;
			// repeat twice for both points
			normals[j++]=nx;
			normals[j++]=ny;
			normals[j++]=nx;
			normals[j++]=ny;
			
		}
		return normals;		
	}
	
}