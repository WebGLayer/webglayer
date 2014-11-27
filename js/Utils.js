Utils = function(){}
Utils.prototype.loadShaders = function(vs, fs){	
	var vertexSrc = document.getElementById(vs).text;
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexSrc);
	gl.compileShader(vertexShader);

	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		alert("An error occurred compiling the shaders: "
				+ gl.getShaderInfoLog(vertexShader));
		return null;
	}
	// create fragment shader
	var fragmentSrc = document.getElementById(fs).text;
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fragmentSrc);
	gl.compileShader(fragmentShader);

	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		alert("An error occurred compiling the shaders: "
				+ gl.getShaderInfoLog(vertexShader));
		return null;
	}
	// link shaders to create our program
	var pointProgram = gl.createProgram();
	gl.attachShader(pointProgram, vertexShader);
	gl.attachShader(pointProgram, fragmentShader);
	gl.linkProgram(pointProgram);
	return pointProgram;
}

Utils.prototype.bindUniform = function(prog, u_name, value){
	gl.useProgram(prog);
	var matrixLoc = gl.getUniformLocation(prog, u_name);
	if (matrixLoc instanceof WebGLUniformLocation && value!=null){
		gl.uniformMatrix4fv(matrixLoc, false, value);
	} else {
		console.error("Uniform set failed, uniform: "+u_name + " value "+value);
		return;
	}
	gl.useProgram(null);
}

Utils.prototype.enableAttribute = function(prog, buf){	
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	
	if (prog[buf.attr] == null){
		prog[buf.attr] = gl.getAttribLocation(prog, buf.attr);
	}
	
	if (prog[buf.attr] >= 0){
		gl.enableVertexAttribArray(prog[buf.attr]);
		gl.vertexAttribPointer(prog[buf.attr], 2, gl.FLOAT, false, 0, 0);
	} else {
		console.error("Error binding buffer: "+buf);
		return;
	}
	
Utils.prototype.bindTexture = function(prog, name, texture) {	  
		gl.useProgram(prog);
	    var i = gl.getUniformLocation(prog, name); 
	    if (i!= null){
	    	gl.uniform1i(i , 0);
	    } else {
	    	console.error("Error uniform "+ name+ " uSampler does not exist.");
	    	gl.useProgram(null);
	    	return;
	    }
	    gl.activeTexture(gl.TEXTURE0);
	    gl.bindTexture(gl.TEXTURE_2D, texture);	
	    
	}
	

	

}


