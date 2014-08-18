	
	setupSpeed = function() {
		bin_count = 4;			
		
		if (!gl.getExtension("OES_texture_float")) {
		      console.log("OES_texture_float not availble -- this is legal");
		}
		
		//canvas.setAttribute("width", bin_count);
		//canvas.setAttribute("height",1);
		//var w = canvas.width;
		//var h = canvas.height;
		gl.viewport(0, 0, bin_count, 1);
	
		matrix = new Float32Array(16);
		matrix.set([ 4/bin_count, 0, 0, 0, 	0, 1, 0, 0, 
		                0, 0, 0, 0, 	-1, 0, 0, 1 ]);

		gl.useProgram(this.glProgram);
		var matrixLoc = gl.getUniformLocation(this.glProgram, 'mapMatrix');
		gl.uniformMatrix4fv(matrixLoc, false, matrix);
		
		gl.disable(gl.DEPTH_TEST);		
		gl.enable(gl.BLEND);
		
		gl.blendFunc(gl.ONE, gl.ONE);	
		initOfscreenBuffer();
		
		/*
		t = create1DTexture(Math.pow(2,2));		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, t);
		gl.uniform1i(gl.getUniformLocation(this.glProgram, "uSampler"), 0);*/
		
		
	}
	initOfscreenBuffer = function(){
		    rttFramebuffer = gl.createFramebuffer();
		    gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
		    rttFramebuffer.width = 4;
		    rttFramebuffer.height = 1;
		    
		    rttTexture = gl.createTexture();
		    gl.bindTexture(gl.TEXTURE_2D, rttTexture);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		   
		    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rttFramebuffer.width, rttFramebuffer.height, 0, gl.RGBA, gl.FLOAT, null);

		    var renderbuffer = gl.createRenderbuffer();
		    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
		    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, rttFramebuffer.width, rttFramebuffer.height);
		    
		    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rttTexture, 0);
		    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

		   

	}

	create1DTexture = function(size) {
		 var data = new Uint8Array(size*4);
		for (kk = 0 ; kk<data.length ;  ){
			data[kk++]=5;
			data[kk++]=5;
			data[kk++]=130;
			data[kk++]=255;
		}
	   
	    var texture = gl.createTexture();
	    gl.bindTexture(gl.TEXTURE_2D, texture);
	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	    gl.bindTexture(gl.TEXTURE_2D, null);
	    
	    return texture;
	}
	
	readFloatPixels = function(){	
		
		console.time("reading");	
		var readout = new Float32Array(4 * 1 * 1*4);		
		gl.readPixels(0, 0, 4 ,1, gl.RGBA, gl.FLOAT, readout);
				
		console.timeEnd("reading");

		sum = 0;
		for(i=0;i< readout.length; i++){
			sum=sum+readout[i];
		}
		console.log(sum);
		console.log(readout);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	readPixels = function(){	
		
		console.time("reading");	
		var readout = new Uint8Array(4 * 1 * 1*4);		
		gl.readPixels(0, 0, 4 ,1, gl.RGBA, gl.UNSIGNED_BYTE, readout);
				
		console.timeEnd("reading");

		sum = 0;
		for(i=0;i< readout.length; i++){
			sum=sum+readout[i];
		}
		console.log(sum);
		console.log(readout);
	}
