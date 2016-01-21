ExtentFilter = function(manager){	
		
		this.rastersize = manager.r_size ;
		this.manager = manager;	
				
		this.filterProgram = GLU.compileShaders("extent_vShader", "extent_fShader",
				this);

		
	
		this.render = function() {
			var framebuffer = manager.getFilter().getActiveFB();
			
			//this.readPixels();
			gl.useProgram(this.filterProgram);			
			
			gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
			gl.viewport(0, 0, framebuffer.width,framebuffer.height);	

			gl.disable(gl.DEPTH_TEST);
			gl.enable(gl.BLEND);
			gl.blendFuncSeparate(gl.ZERO, gl.ONE, gl.ONE,
			gl.ZERO)
			//gl.blendFunc(gl.ONE, gl.ZERO);

			manager.bindMapMatrix(this.filterProgram);
			manager.enableBufferForName(this.filterProgram, "wPoint", "wPoint");
			manager.enableBufferForName(this.filterProgram,  "index", "index");	
							
			gl.drawArrays(gl.POINTS, 0, manager.num_rec);								
					
			gl.useProgram(null);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	    	gl.bindFramebuffer(gl.FRAMEBUFFER, null);	
	    	//this.readPixels();
		}

	
		this.readPixels = function() {
			/**
			 * bind restexture as uniform, render, and read
			 */
			var framebuffer = manager.indexFB;
			gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
			// console.time("reading_pix");
			var readout = new Uint8Array( framebuffer.width * framebuffer.height* 4);
			gl.readPixels(0, 0, framebuffer.width, framebuffer.height, gl.RGBA,
					gl.UNSIGNED_BYTE, readout);
			// console.timeEnd("reading_pix");
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);

			//console.log(readout);

			var selected = [];
			for (var i = 0; i < readout.length; i=i+1){
				//console.log(readout[i]);
				selected.push(readout[i]);
				//if (readout[i]>1) {selected.push(i/4)};
			}

			console.log("extent buffer: "+selected);		
			return selected;// readout;
		}	
}