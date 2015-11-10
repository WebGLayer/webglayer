/**
 * @license
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Renders a specified content into the canvas derived form a map div.
 * @author Jan Jezek
 */
 var gl;

function WebglLayer(canvasid) {

   

	
	canvas = document.getElementById(canvasid);
	div = document.getElementById("canvasContainer");	
	gl = canvas.getContext('webgl');		
	

	canvas.setAttribute("width",  div.offsetWidth);
	canvas.setAttribute("height", div.offsetHeight);

	var w = canvas.width;
	var h = canvas.height;

	gl.viewport(0, 0, w, h);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	matrix = new Float32Array(16);
	matrix.set([ 1, 0, 0, 0, 0, 1, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 1 ]);
	
	
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	
	var that = this;

	getShader();
	var prog = createShaderProgram('map_fShader', 'wPoint' ,'map_vShader');	
	var prog2 = createShaderProgram('pointFragmentShader2', 'wLine','pointVertexShader2');
	
	var arr = [];
	var b = [];
	jmax = 1;
	imax=1000;
	setMatrix(prog, matrix);
	gl.useProgram(prog);		
	for (var j=0; j < jmax; j++){	
		
		for (var i = 0; i < imax; i++) {		
	    arr.push(Math.random()*2-1);
	    //
		}
		b[j] = createBuffer(arr);
		arr = [];		
	}
		
	for(i=1;i< 10;i++){
		
	
	console.time("drawing")
	for (var j=0; j < jmax; j++){	
		gl.bindBuffer(gl.ARRAY_BUFFER, b[j]);
		gl.vertexAttribPointer(prog.vertexPositionAttribute, b[j].itemSize, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.POINTS, 0, b[j].numItems);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);				
	}
	console.timeEnd("drawing")
	}
	
	
	var vertices2 = [ -1,  0,  0.5, 0.5, 0.3,-0.3 , 0.5, -0.5];	
	b2 = createBuffer(vertices2);

	/**
	 * Draw!!
	 */
	
	
	
	
	/**
	 * Draw2!!
	 */
/*	setMatrix(prog2, matrix);
	gl.useProgram(prog2);

	gl.bindBuffer(gl.ARRAY_BUFFER, b2);
	gl.vertexAttribPointer(prog.vertexPositionAttribute, b1.itemSize, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, b2.numItems);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);	*/
	
	

	

	
	//this._gl.drawArrays(this._gl.POINTS, 2, 3);
	function createBuffer(data){
	    buffer = gl.createBuffer();  
	    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data),gl.STATIC_DRAW);
		buffer.itemSize = 2;
		buffer.numItems = data.length/2;
		return buffer;
	}
	
	function addToBuffer(buf, vert){
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vert));
		//buf.numItems = buf.numItems + vert.length/2;
	}
	
	function setMatrix(prog, m){
		gl.useProgram(prog);
		var matrixLoc = gl.getUniformLocation(prog, prog.mapMatrix);
		gl.uniformMatrix4fv(matrixLoc, false, m);
		gl.useProgram(null);
	}

	
	function createShaderProgram(fid, vAttr, vid) {
		// create vertex shader
		

		
		var vertexSrc = document.getElementById(vid).text;
		var vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexShader, vertexSrc);
		gl.compileShader(vertexShader);
		
		
		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
			alert("An error occurred compiling the shaders: "
					+ gl.getShaderInfoLog(vertexShader));
			return null;
		}
		// create fragment shader
		var fragmentSrc = document.getElementById(fid).text;
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
		gl.useProgram(pointProgram);
		
		pointProgram.vertexPositionAttribute = gl.getAttribLocation(pointProgram, vAttr);
	        gl.enableVertexAttribArray(pointProgram.vertexPositionAttribute);
		
	    pointProgram.mapMatrix = 'mapMatrix';
		
		return pointProgram;
		//gl.useProgram(pointProgram);
	}
	/**
	 * Loads the shaders from the file and adds it to DOM
	 */
	function getShader() {
		$.ajaxSetup({
			async : false
		});

		$.get('shaders/fragmentShader.txt', function(data) {
			$("head").append(data);
		});

		$.get('shaders/vertexShader.txt', function(data) {
			$("head").append(data);
		});
		
		$.get('shaders/fragmentShader2.txt', function(data) {
			$("head").append(data);
		});

		$.get('shaders/vertexShader2.txt', function(data) {
			$("head").append(data);
		});
		$.ajaxSetup({
			async : true
		});
	}
}




WebglLayer.prototype.clear = function() {
	this._gl.clear(this._gl.COLOR_BUFFER_BIT);
}

WebglLayer.prototype.render = function() {
	this._gl.clear(this._gl.COLOR_BUFFER_BIT);
	this._gl.drawArrays(this._gl.POINTS, 0, 4);
}



