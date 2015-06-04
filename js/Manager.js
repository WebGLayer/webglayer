function Manager(mapid) {
	/**
	 * Global variables
	 */
	//canvas = document.getElementById(canvasid);
	var canvasid = 'webglayer';
	this.mapdiv = document.getElementById(mapid);
	var mapparentdiv = document.getElementById(mapid).parentElement;

	var t = this.mapdiv.clientTop;
	var l = this.mapdiv.clientLeft;	
	this.w = this.mapdiv.offsetWidth;
	this.h = this.mapdiv.offsetHeight;
	var z = this.mapdiv.style.zIndex;
	
	z == "" ? z=1000 :z = z+1;
		 
	this.canvas = document.createElement('canvas');
	this.canvas.setAttribute('id','webglayer');
	this.canvas.setAttribute("width", this.w);
	this.canvas.setAttribute("height",this.h);
	this.canvas.setAttribute("style", "position:absolute ; " +
						"top:"+t+"px ; " +
						"left:"+l+"px; " +
						"pointer-events: none;" +
						"opacity: 1;" +
						"z-index: " + z);
	
	
	mapparentdiv.appendChild(this.canvas);
	
	

	gl = this.canvas.getContext('webgl', {preservedrawingbuffer: true}) || this.canvas.getContext('experimental-webgl', {preservedrawingbuffer: true});

	  if (!gl) {
          alert("Could not initialise WebGL, sorry :-(. Are you using Chrome?");
      }

	
	this.dimensions = [];
	
	/**
	 * Common databuffers for all dimensions
	 */
	this.databuffers = [];
	this.matrices = [];
	
	this.filters = [];
	
	
	this.update = function(){
		/**
		 * Global variables
		 */
		//canvas = document.getElementById(canvasid);
		
		//div = canvas.parentElement;
		
		gl = this.canvas.getContext('webgl', {preservedrawingbuffer: true}) || this.canvas.getContext('experimental-webgl', {preservedrawingbuffer: true});

		  if (!gl) {
			  alert("Could not initialise WebGL, sorry :-(. Are you using Chrome?");
	      }

	}
	
	
	this.setMapMatrix = function(matrix){
		this.mapMatrix = matrix;		
	}
	
	this.rMatrix = new Float32Array(16);
	this.rMatrix.set([ 0.5, 0, 0, 0, 
	             0, 0.5, 0, 0, 
	             0, 0,    0, 0,
	             0.5, 0.5, 0, 1 ]);
	this.rMatrix.name = "rasterMatrix";
	this.matrices[this.rMatrix.name]= this.rMatrix;


	
	this.addDimension = function(d){
		this.dimensions.push(d);
	}

	/**
	 * Creates a data buffer object. itemSize is a dimension of the data
	 */
	this.addDataBuffer = function(data, itemSize, name) {
		var buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
		buffer.itemSize = itemSize;
		buffer.numItems = data.length / itemSize;
		buffer.name = name;
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		this.databuffers[name] = buffer;		
	}
	
	

	
	/**
	 * traverse all dimensions and renders them
	 */

	this.render = function() {
		/* bind array buffers */
		 
		for (var i = 0; i < this.dimensions.length; i++) {
			d = this.dimensions[i];
			d.setup();
			this.enableBuffersAndCommonUniforms(d.glProgram);
			this.enableFilterTexture(d.glProgram);			
			d.render(this.num_rec);
			d.tearDown();
		}
		
	}
	
	/**
	 * 
	 */
	this.enableBuffersAndCommonUniforms = function(prog) {
		
		/**
		 * Bind matrices
		 */
		for (var i in this.matrices){
			var m = this.matrices[i];
			if (prog[m.name]== null){
				
				prog[m.name] = 	this.getUniformLoc(prog, m.name);
			}
		
			gl.uniformMatrix4fv(prog[m.name], false, m);			
		}
		
		this.enableBufferForName(prog, this.index, "index");		
					
	}

	this.storeUniformLoc = function(program, name){
		if (program[name] == null ){
			program[name] = gl.getUniformLocation(program, name);
			if (!program[name] instanceof WebGLUniformLocation) {				
				console.error("Uniform set failed, uniform: " + name
						+ " value " + value);
				return;
			}
		}		
	}
	
	this.bindMapMatrix = function(prog){
	//	gl.useProgram(prog);
		if (prog.matrixLoc == null){
			prog.matrixLoc = this.getUniformLoc(prog, this.mapMatrix.name);	
		}
		
		gl.uniformMatrix4fv(prog.matrixLoc, false,  this.mapMatrix);		
	}
	
	this.bindRasterMatrix = function(prog){
		//	gl.useProgram(prog);
			if (prog.rmatrixLoc == null){
				prog.rmatrixLoc = this.getUniformLoc(prog, this.rMatrix.name);	
			}
			
			gl.uniformMatrix4fv(prog.rmatrixLoc, false,  this.rMatrix);		
		}
	
	this.enableBuffer = function(prog, name){
	//	gl.useProgram(prog);
		var buf = this.databuffers[name];
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		
		if (buf==undefined){
			console.error("Error: " +  name + " is not registered in manager.");			
			return;
		}

		if (prog[name]==null){
			if (gl.getAttribLocation(prog, buf.name) >= 0) {
				prog[name] = gl.getAttribLocation(prog, buf.name);
			} else {
				console.log("Error: attribute " +  buf.name + " does not exist in program "+prog.name);
			}
		}
				
			gl.enableVertexAttribArray(prog[name]);
			gl.vertexAttribPointer(prog[name], buf.itemSize, gl.FLOAT,
					false, 0, 0);
		
	}
	
	this.enableBufferForName = function(prog, buff, name){
		//	gl.useProgram(prog);
			var buf = this.databuffers[buff];
			gl.bindBuffer(gl.ARRAY_BUFFER, buf);

			if (prog[name]==null){
				if (gl.getAttribLocation(prog, name) >= 0) {
					prog[name] = gl.getAttribLocation(prog, name);
				} else {
					console.log("Error: attribute " +  name + " does not exist in program "+prog.name);
				}
			}
					
				gl.enableVertexAttribArray(prog[name]);
				gl.vertexAttribPointer(prog[name], buf.itemSize, gl.FLOAT,
						false, 0, 0);
			
		}
	
	
	
	this.enableFilterTexture = function(prog){
	//	gl.useProgram(prog);
		
		if (prog.rasterLoc == null){
			prog.rasterLoc = this.getUniformLoc(prog, 'filter'); 	
		}
			 
		gl.uniform1i(prog.rasterLoc , 0);		   
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.filterTexture);
	}
	
	this.getUniformLoc = function(prog, name){
		var loc = gl.getUniformLocation(prog, name)
		if (loc==null){
			console.error("Error setting common uniform "+name+" for program "+ prog.name);
		} else {
			return loc;
		}			
	}
	
	
	
}
