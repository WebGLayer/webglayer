
function ParallelCoordinates(manager, div, data){

		//WGL.addMultiDim(data);
	this.elRect = this.mapdiv = document.getElementById(div).getBoundingClientRect();
	
	var margin = this.elRect.margin;
	
	var margin = {
			top : 20,
			right : 20,
			bottom : 50,
			left : 40
			};

	
	var top_margin =30;
	
	
	var svg = d3.select("#" + div).append("svg").attr("width",
			this.elRect.width).attr("height",
			this.elRect.height).attr("z-index",3000).append("g");

	var yScale = d3.scale.linear().domain([ 0, 10]).range(
			[ this.elRect.height, 0 ]);
	var yAxis = d3.svg.axis().scale(yScale).orient("left");

	svg.append("g").attr("class", "y axis").call(yAxis).attr("transform","translate("+margin.left+")").append("text")
			.attr("transform", "rotate(270)").attr("y", "-4.5em").attr("x",
					"-2em").style("text-anchor", "end").text("number of items [1000]");

	   
	    
	

		
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
		gl.viewport(this.elRect.left+margin.left, manager.body_height-this.elRect.bottom, this.elRect.width, this.elRect.height);
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

	