
function ParallelCoordinates(manager, div, data){
	
	var pcdiv =  document.getElementById(div);
	var maximum = 500;

	var viewport = [];		
	var margin = {
			top : 50,
			right : 120,
			bottom : 20,
			left : 60
			};
	
	this.setViewport = function(){
		var elRect = pcdiv.getBoundingClientRect();
		var w = pcdiv.clientWidth;
		var h =pcdiv.clientHeight;
		viewport.width = w - margin.left - margin.right;
		viewport.height = h - margin.top - margin.bottom;
		viewport.tlx = elRect.left+margin.left;
		viewport.tly = manager.body_height- elRect.bottom+margin.bottom;			
	}
	
	this.setViewport();

	var svg = d3.select("#" + div).append("svg").attr("id", "pc_svg").attr("width",
			viewport.width + margin.left + margin.right).attr("height",
			viewport.height + margin.top + margin.bottom).append("g").attr(
			"transform",
			"translate(" + margin.left + "," + margin.top + ")").attr("z-index",3000)		
			.append("g");
	
	var offset = viewport.width / (data.length-1);   
	var axis = [];

	for (var i in data){
		var d = data[i];
		axis[i] = new ParallelAxis(d, i);
	}

	
		
	this.glProgram = GLU.compileShaders('pc_vShader', 'pc_fShader', this);
		
	var	renderer = new ParallelCoordinatesRenderer(manager);
	var numfilters ="numfilters";
	
	
	var framebuffer = gl.createFramebuffer();
	manager.storeUniformLoc(this.glProgram, numfilters);
	
	

	this.createPCFramebuffer = function(){
		framebuffer.width = viewport.width;	
		framebuffer.height = viewport.height;

		var renderbuffer = gl.createRenderbuffer();

		this.pcTexture = gl.createTexture();
		this.pcTexture.name = "pc texture";

		if (!gl.getExtension("OES_texture_float")) {
			console.log("OES_texture_float not availble -- this is legal");
		}		
		
	
		/** Framebuffer */
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

		/** Texture */
		gl.bindTexture(gl.TEXTURE_2D, this.pcTexture);
		
		if (!gl.getExtension("OES_texture_float_linear")) {
			console.log("OES_texture_float not availble -- this is legal");
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}
		
	
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // Prevents
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebuffer.width,
			framebuffer.height, 0, gl.RGBA, gl.FLOAT, null);

		/** Render buffer */
		gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
			framebuffer.width, framebuffer.height);

		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D, this.pcTexture, 0);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
			gl.RENDERBUFFER, renderbuffer);

		gl.bindTexture(gl.TEXTURE_2D, null);
	}
		

	this.resize = function() {
		this.setViewport();		
		for (var i in axis){
			axis[i].update();			
		}
		this.createPCFramebuffer();
	}
	
	this.createPCFramebuffer(); 

	this.reRender = function(max){
		  
		  maximum = max;
		  renderer.render(viewport, maximum);
	}
	
	this.render = function() {
			
		gl.useProgram(this.glProgram);
		
		manager.enableBuffer(this.glProgram, "indexpc");	
		manager.enableBuffer(this.glProgram, "td");
		manager.enableBuffer(this.glProgram, "ti");	
		
		gl.uniform1f(this.glProgram.numfilters, manager.trasholds.allsum );
		
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		//gl.bindFramebuffer(gl.FRAMEBUFFER, null);	
		//gl.viewport(viewport.tlx, viewport.tly, viewport.width, viewport.height);
		gl.viewport(0,0, framebuffer.width, framebuffer.height);
		
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
	
		gl.blendFunc( gl.ONE, gl.ONE  );		
	
	//	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, manager.databuffers['indicies']);//pcIndexBuffer);
	//	manager.bindElementBuffer("indicies");	
		manager.enableFilterTexture(this.glProgram);

		gl.lineWidth(3);
      //  gl.drawElements(gl.LINES, manager.num_rec*4, gl.UNSIGNED_SHORT,0);
       	gl.drawArrays(gl.LINES, 0, manager.num_rec*(manager.num_of_attrib*2-2));
				
	    gl.useProgram(null);
		renderer.heatTexture = 	this.pcTexture;	
	
	    renderer.render(viewport, maximum);
	   
		
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
	
	function ParallelAxis(d, i){
		var yScale;
		var yAxis;
		var dim = WGL.getDimension(d.name);
		var brush = d3.svg.brush();	 
		if (d.type == "linear"){
			yScale = d3.scale.linear().domain([d.min, d.max]).range(
				[ viewport.height, 0 ]);			
			
			brush.y(yScale).on("brush", function(){	    		    	
		    	var f = d3.event.target;			    					
		    	var of = [];
		    	of[0]= f.extent();
		    	if (of[0][0]==of[0][1]){
		    			/*filter is deleted*/
		    			of = [];
		    	}	
				WGL.filterDim(d.name, dim.filters[dim.filtersids[0]].id,of);	
			  });
		} else if (d.type=="ordinal"){
			yScale = d3.scale.ordinal().domain(d.domain).rangeRoundBands([ viewport.height, 0 ],0.03);
			var l = yScale.domain().length;	
			brush.y(yScale).on("brush", function(){	    		    
		    	var f = d3.event.target.extent();	
		    	
		    	var of = [];						
				of[0] = [];
				of[0][0] =  l- ( f[0] /viewport.height * l); 
				of[0][1] =  l- ( f[1] /viewport.height * l);  
				if (of[0][0]==of[0][1]){
		    			/*filter is deleted*/
		    			of = [];
		    	}									
				WGL.filterDim(d.name, dim.filters[dim.filtersids[0]].id,of);	
			 });
		}
		
		yAxis = d3.svg.axis().scale(yScale).orient("left");

		svg.append("g").attr("class", "axis_pc axis_"+i).call(yAxis).attr("transform","translate("+offset*i+")")	
		.append("text")
			.attr("y", "-2em").attr("x",
					"0em").style("text-anchor", "middle").text(d.label);		
	  
		 svg.append("g").attr("class", "brush brush_"+i).call(brush)
			.selectAll("rect").attr("width", "40").attr("transform","translate("+(offset*i-20)+")");
		
		 
		 this.update = function(){
			 offset = viewport.width / (data.length-1);   
			 svg.select("#pc_svg", viewport.width + margin.left + margin.right);
			 svg.select( '.axis_'+i).attr("transform","translate("+offset*i+")")	
			 svg.select('.brush_'+i).selectAll("rect").attr("transform","translate("+(offset*i-20)+")")	
			
		 }
	}

	
}


	