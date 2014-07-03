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


function WebglLayer(canvasid, parentdiv, points, attributes) {



	
	this.canvas = document.getElementById(canvasid);
	this.map = parentdiv;

	this._gl = this.canvas.getContext('webgl');
	this._pixelsToWebGLMatrix = new Float32Array(16);
	this._mapMatrix = new Float32Array(16);
	
	this.leftFilter = new Float32Array(9);
	this.rightFilter = new Float32Array(9);
	
	this._num_pts = 0;
	this._num_pt_atts = 0;

	var pixelsToWebGLMatrix = new Float32Array(16);
	var that = this;

	getShader();
	createShaderProgram();
	
	this.loadCoordinates(points);
	this.loadAttributes(attributes);
	this.resize();	
	this.resetfilter();
	
	function createShaderProgram() {
		// create vertex 0shader
		var gl = that._gl;
		var vertexSrc = document.getElementById('pointVertexShader').text;
		var vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexShader, vertexSrc);
		gl.compileShader(vertexShader);

		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
			alert("An error occurred compiling the shaders: "
					+ gl.getShaderInfoLog(vertexShader));
			return null;
		}
		// create fragment shader
		var fragmentSrc = document.getElementById('pointFragmentShader').text;
		var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragmentShader, fragmentSrc);
		gl.compileShader(fragmentShader);

		// link shaders to create our program
		pointProgram = gl.createProgram();
		gl.attachShader(pointProgram, vertexShader);
		gl.attachShader(pointProgram, fragmentShader);
		gl.linkProgram(pointProgram);

		gl.useProgram(pointProgram);
	}
	/**
	 * Loads the shaders from the file and adds it to DOM
	 */
	function getShader() {
		$.ajaxSetup({
			async : false
		});

		$.get('js/fragmentShader.txt', function(data) {
			$("head").append(data);
		});

		$.get('js/vertexShader.txt', function(data) {
			$("head").append(data);
		});
		$.ajaxSetup({
			async : true
		});
	}
}

WebglLayer.prototype.resetfilter = function(){
	fil = new Array(this._num_pt_atts);
	for (i=0; i< this._num_pt_atts; i++){
		f = [-Number.MAX_VALUE,Number.MAX_VALUE];
		fil[i]=f;
	}
	this.filter(fil);
}

WebglLayer.prototype.filter = function(filter) {
	/* var start = Date.now() ;*/
	console.time("filter") ; 
	
	for (i=0; i<filter.length;i++){
		this.leftFilter[i]=  filter[i][0];
		this.rightFilter[i] = filter[i][1];
	}	
	var matrixLoc = this._gl.getUniformLocation(pointProgram, 'leftFilter');
	this._gl.uniformMatrix3fv(matrixLoc, false, this.leftFilter);
	
	var matrixLoc = this._gl.getUniformLocation(pointProgram, 'rightFilter');
	this._gl.uniformMatrix3fv(matrixLoc, false, this.rightFilter);
	
	this.render();
	console.timeEnd("filter");
	
}


WebglLayer.prototype.resize = function() {

	this.canvas.setAttribute("width", this.map.offsetWidth);
	this.canvas.setAttribute("height", this.map.offsetHeight);

	var width = this.canvas.width;
	var height = this.canvas.height;

	this._gl.viewport(0, 0, width, height);

	// matrix which maps pixel coordinates to WebGL coordinates
	this._pixelsToWebGLMatrix.set([ 2 / width, 0, 0, 0, 0, -2 / height, 0, 0,
			0, 0, 0, 0, -1, 1, 0, 1 ]);
 
}


WebglLayer.prototype.move = function(zoom, offset) {	
	mapMatrix = this._mapMatrix
	mapMatrix.set(this._pixelsToWebGLMatrix);

	// Scale to current zoom (worldCoords * 2^zoom)
	var scale = Math.pow(2, zoom);
	scaleMatrix(mapMatrix, scale, scale);

	// translate to current view (vector from topLeft to 0,0)
	translateMatrix(mapMatrix, -offset.x, -offset.y);
	var matrixLoc = this._gl.getUniformLocation(pointProgram, 'mapMatrix');
	this._gl.uniformMatrix4fv(matrixLoc, false, mapMatrix);

	function scaleMatrix(matrix, scaleX, scaleY) {
		// scaling x and y, which is just scaling first two columns of matrix
		matrix[0] *= scaleX;
		matrix[1] *= scaleX;
		matrix[2] *= scaleX;
		matrix[3] *= scaleX;

		matrix[4] *= scaleY;
		matrix[5] *= scaleY;
		matrix[6] *= scaleY;
		matrix[7] *= scaleY;
	}

	function translateMatrix(matrix, tx, ty) {
		// translation is in last column of matrix
		matrix[12] += matrix[0] * tx ;
		matrix[13] += matrix[5] * ty;

	}
}

WebglLayer.prototype.clear = function() {
	this._gl.clear(this._gl.COLOR_BUFFER_BIT);
}

WebglLayer.prototype.render = function() {
	this._gl.clear(this._gl.COLOR_BUFFER_BIT);
	this._gl.drawArrays(this._gl.POINTS, 0, this._num_pts);
}




WebglLayer.prototype.loadCoordinates = function(data) {
	var gl = this._gl;
	this._num_pts=data.length/2;
	pointArrayBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, pointArrayBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	// enable the 'worldCoord' attribute in the shader to receive buffer
	var attributeLoc = gl.getAttribLocation(pointProgram, 'worldCoord');
	gl.enableVertexAttribArray(attributeLoc);
	// tell webgl how buffer is laid out (pairs of x,y coords)
	gl.vertexAttribPointer(attributeLoc, 2, gl.FLOAT, false, 0, 0);
}

WebglLayer.prototype.loadAttributes = function(data) {
	var that = this;
	var data_v = new Array();	
	this._num_pt_atts  = data.length/this._num_pts;
	createData.call(that,data);
	var gl = this._gl;

	for (j = 0; j < data_v.length; j++) {
	
		var attributeLoc = gl.getAttribLocation(pointProgram, 'attr') + j;
		gl.enableVertexAttribArray(attributeLoc);
		pointArrayBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, pointArrayBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, data_v[j], gl.STATIC_DRAW);
		gl.vertexAttribPointer(attributeLoc, data_v[j].length / this._num_pts,
				gl.FLOAT, false, 0, 0);
	}

	/**
	 * converts the array to t number of arrays as the webgl can accept the vector v3.
	 * @param source
	 * @returns {Array}
	 */
	function createData(source) {
		t = Math.floor(this._num_pt_atts  / 3);
		m = this._num_pt_atts  % 3;
		for (i = 0; i < t; i++) {
			data_v[i] = new Float32Array(3 * this._num_pts);
		}
		if (m > 0) {
			data_v[t] = new Float32Array(m * this._num_pts)
		}

		pp=0;
		for (i = 0; i < this._num_pts; i++) {
			for (j = 0; j < data_v.length; j++) {
				for (k = 0; k < data_v[j].length / this._num_pts; k++) {
					h = pp++;
					data_v[j][i * data_v[j].length / this._num_pts + k] = source[h];
					source[h]=null;
				}
			}
		}
		return data_v;
	}

}
