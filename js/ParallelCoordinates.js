
function ParallelCoordinates(manager, div, data){

		//WGL.addMultiDim(data);
	this.elRect = this.mapdiv = document.getElementById(div).getBoundingClientRect();
		
	var w = document.getElementById(div).clientWidth;
	var h =document.getElementById(div).clientHeight;
	
	var margin = {
			top : 50,
			right : 20,
			bottom : 20,
			left : 60
			};

	
	var width = w - margin.left - margin.right;
	var height = h - margin.top - margin.bottom;
	
	
	var svg = d3.select("#" + div).append("svg").attr("width",
			width + margin.left + margin.right).attr("height",
			height + margin.top + margin.bottom).append("g").attr(
			"transform",
			"translate(" + margin.left + "," + margin.top + ")").attr("z-index",3000).append("g");
	
	

	

	var offset = width / data.length;    
	for (var i in data){
		var d = data[i];
		var yScale;
		
		if (d.type == "linear"){
			var yScale = d3.scale.linear().domain([d.min, d.max]).range(
				[ height, 0 ]);
			
		} else if (d.type=="ordinal"){
			yScale = d3.scale.ordinal().domain(d.domain).rangeRoundBands([ height, 0 ],0.03);
		}
		var yAxis = d3.svg.axis().scale(yScale).orient("left");

		svg.append("g").attr("class", "y axis").call(yAxis).attr("transform","translate("+offset*i+")").append("text")
			.attr("y", "-2em").attr("x",
					"0em").style("text-anchor", "middle").text(d.label);
		
		var brush = d3.svg.brush()
	    .y(yScale)
	    .on("brushend", function(){console.log("brushed")});
		
		 svg.append("g").attr("class", "brush").call(brush)
			.selectAll("rect").attr("width", width);
		
	}

		
	this.glProgram = GLU.compileShaders('pc_vShader', 'pc_fShader', this);
		
	var numfilters ="numfilters";
	manager.storeUniformLoc(this.glProgram, numfilters);
	

	this.render = function() {
			
		gl.useProgram(this.glProgram);
		
		manager.enableBuffer(this.glProgram, "indexpc");	
		manager.enableBuffer(this.glProgram, "td");
		manager.enableBuffer(this.glProgram, "ti");	
		
		gl.uniform1f(this.glProgram.numfilters, manager.trasholds.allsum );			
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);	
		//gl.viewport(this.elRect.left+margin.left, manager.body_height-this.elRect.bottom, this.elRect.width, this.elRect.height);
		gl.viewport(this.elRect.left+margin.left, manager.body_height-this.elRect.bottom+margin.bottom, width, height);
		
		//gl.clearColor(0.0, 0.0, 0.0, 0.0);
		//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
	
		gl.blendFunc( gl.ONE, gl.ONE  );		
	
	//	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, manager.databuffers['indicies']);//pcIndexBuffer);
	//	manager.bindElementBuffer("indicies");	
		manager.enableFilterTexture(this.glProgram);

		gl.lineWidth(1);
      //  gl.drawElements(gl.LINES, manager.num_rec*4, gl.UNSIGNED_SHORT,0);
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

	