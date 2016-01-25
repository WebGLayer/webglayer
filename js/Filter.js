Filter = function(manager) {

	manager.setFilter(this);
	this.rastersize = manager.r_size ;
	
	this.lastDim ="";
	
	this.filterProgram = GLU.compileShaders("filter_vShader", "filter_fShader",
			this);

	var filterid = 'filterid';
	manager.storeUniformLoc(this.filterProgram, filterid);

	var indexText = 'indexText';
	manager.storeUniformLoc(this.filterProgram, indexText);
	
	var isspatial = 'isspatial';
	manager.storeUniformLoc(this.filterProgram, isspatial);
	
	this.filterProgram.name = "Main filter";

	var framebuffer = [];
	var renderbuffer  = [];
	var filterTexture = [];
	framebuffer.width = this.rastersize;
	framebuffer.height = this.rastersize;
	


/*******************************first texture*************************************/
	filterTexture[0] = gl.createTexture();
	filterTexture[1] = gl.createTexture();
	framebuffer[0] = gl.createFramebuffer();  
	framebuffer[1] = gl.createFramebuffer();	
	renderbuffer[0] =  gl.createRenderbuffer();
	renderbuffer[1] =  gl.createRenderbuffer();

	framebuffer[0].width = this.rastersize;
	framebuffer[0].height = this.rastersize;
	framebuffer[0].id = 0;

	framebuffer[1].width = this.rastersize;
	framebuffer[1].height = this.rastersize;
	framebuffer[1].id = 1;
	var activeID =0 ;
	var thatID = 1;
	/** Framebuffer */
	
	//createEmptyTexture(filterTexture[0] );
	
	
	
	confFrameBufferTexture(1);
	confFrameBufferTexture(0);
	
	
	function confFrameBufferTexture(tid){
		/** Texture */
			
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer[tid]);
	
		//filterTexture[tid] = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, filterTexture[tid]);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebuffer.width,
				framebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		

		/** Render buffer */
		//renderbuffer[tid] =  gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer[tid]);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
				framebuffer.width, framebuffer.height);

		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
				gl.TEXTURE_2D,  filterTexture[tid], 0);	

		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
				gl.RENDERBUFFER, renderbuffer[tid]);

		/*set texture to 0*/
		gl.viewport(0, 0, framebuffer.width,framebuffer.height);
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		gl.bindTexture(gl.TEXTURE_2D, null);	 
	    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	   
	}
	

	


	/*evaluate all filters*/
	this.applyFilterAll = function(dimensions) {

		/*update filtering data (important for polybrush filter)*/
		for (var i in dimensions) {
			for (var f in dimensions[i].filters) {
			var d = dimensions[i].filters[f];						
					if(d.isActive){					
						//d.updateFilter(); // update filering texture if needed;
					}	
				
			}
		}
		gl.useProgram(this.filterProgram);			
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer[thatID]);
		gl.viewport(0, 0, framebuffer.width,framebuffer.height);
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		//console.log("binding framebuffer to "+activeID);	
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer[activeID]);
		gl.viewport(0, 0, framebuffer.width,framebuffer.height);
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		
   		//this.readPixels(activeID, 'active');
    	//this.readPixels(thatID, 'pasive');

		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);
		
	//	this.manager.enableBuffersAndCommonUniforms(this.filterProgram);

		manager.bindMapMatrix(this.filterProgram);
		manager.enableBufferForName(this.filterProgram,  "index", "index");	
	
	
		for (var i in dimensions) {
			for (var f in dimensions[i].filters) {
			/* traverse all filters and evalut tham */
			var d = dimensions[i].filters[f];		
			/*Filter texture*/
			if(d.isActive){										
				/* Activate filter texture*/
					gl.activeTexture(gl.TEXTURE0);
					gl.bindTexture(gl.TEXTURE_2D, d.filterTexture);
					gl.uniform1i(this.filterProgram.histLoc , 0);	
									
					/*Activate index texture*/
					gl.activeTexture(gl.TEXTURE1);
					gl.bindTexture(gl.TEXTURE_2D, filterTexture[thatID]);
					gl.uniform1i(this.filterProgram.indexText, 1);	
					
					gl.uniform1f(this.filterProgram.filterid, d.index);
				   	gl.uniform1f(this.filterProgram.isspatial, d.isspatial);
				 //  	console.log("filter num "+manager.filternum);
				
					if (d.isspatial == 0.0){
						/*this fitler is not spatial - bind 1d attribute*/
						manager.enableBufferForName(this.filterProgram, dimensions[i].name, "attr1");
					} else {
						/*this filter is spatial - bind the wPoint*/
						manager.enableBufferForName(this.filterProgram, "wPoint", "wPoint");
						}
		 			gl.drawArrays(gl.POINTS, 0, manager.num_rec);			
					}					
			}							
		}			
		//this.readPixels(activeID, 'active');
    	//this.readPixels(thatID, 'pasive');
		//this.filterTexture = filterTexture[activeID];
		//manager.filterTexture = filterTexture[activeID];
		//console.log("returnunt texture "+activeID);

		//this.readPixels(activeID, 'active');
    	//this.readPixels(thatID, 'pasive');	
				
		gl.useProgram(null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    	gl.bindFramebuffer(gl.FRAMEBUFFER, null);	
	}

/*Render filter for particular dimension*/
	this.applyFilterDim = function(dim,filterId) {
		gl.useProgram(this.filterProgram);					
		//console.log("binding framebuffer to "+activeID);	
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer[activeID]);

		gl.viewport(0, 0, framebuffer.width,framebuffer.height);
		//gl.clearColor(0.0, 0.0, 0.0, 0.0);
		//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFuncSeparate(gl.ONE, gl.ZERO, gl.ONE, gl.ONE
			)
		//gl.blendFunc(gl.ONE, gl.ONE);

	//	this.manager.enableBuffersAndCommonUniforms(this.filterProgram);

		manager.bindMapMatrix(this.filterProgram);		
		manager.enableBufferForName(this.filterProgram,  "index", "index");	

	
		/* Activate filtering texture*/
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, dim.filters[filterId].filterTexture);
		gl.uniform1i(this.filterProgram.histLoc , 0);	

		/*Activate index texture*/
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, filterTexture[thatID]);
		gl.uniform1i(this.filterProgram.indexText, 1);	
				
		//console.log("index "+ dim.filter.index);
		gl.uniform1f(this.filterProgram.filterid, dim.filters[filterId].index);
		
		gl.uniform1f(this.filterProgram.isspatial, dim.filters[filterId].isspatial);
				   
		if (dim.filters[filterId].isspatial == 0.0){
			manager.enableBufferForName(this.filterProgram, dim.name, "attr1");
		} else {
			manager.enableBufferForName(this.filterProgram, "wPoint", "wPoint");
		}
	
		
		gl.drawArrays(gl.POINTS, 0, manager.num_rec);																			
		
		//this.filterTexture = filterTexture[activeID];
		//manager.filterTexture = filterTexture[activeID];
	
				
		gl.useProgram(null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    	gl.bindFramebuffer(gl.FRAMEBUFFER, null);	
    	
    	//this.readPixels();
	
		
	}
	
	this.getActiveTexture = function(){
		return filterTexture[activeID];
	}

	this.getActiveFB = function(){
		return framebuffer[activeID];
	}
	this.getPassiveFB = function(){
		return framebuffer[thatID];
	}
	
	this.switchTextures = function() {		
		if (activeID == 0){
			activeID = 1;
			thatID =  0;
		} else {
			activeID = 0;
			thatID =  1;
		}

		//manager.indexFB = framebuffer[activeID];     		
	}
	this.readPixelsAll = function() {
		this.readPixels(thatID,   "pasive id:");
		this.readPixels(activeID, "active id:")
	}	

	this.readPixels = function(id, label) {
		/**
		 * bind restexture as uniform, render, and read
		 */
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer[id]);
		// console.time("reading_pix");
		var readout = new Uint8Array( framebuffer.width * framebuffer.height* 4);
		gl.readPixels(0, 0, framebuffer.width, framebuffer.height, gl.RGBA,
				gl.UNSIGNED_BYTE, readout);
		// console.timeEnd("reading_pix");
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		//console.log(readout);

		var selected = [];
		for (var i =0; i < readout.length; i=i+1){
			//console.log(readout[i]);
			selected.push(readout[i]);
			//if (readout[i]>1) {selected.push(i/4)};
		}

		console.log(label+" buffer: "+selected);		
		return selected;// readout;
	}
	
}