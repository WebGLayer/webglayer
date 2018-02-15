
/**
 * Stores and manage common objects for WebGL such as data buffers, common uniforms and matrixes
 */
WGL.internal.Manager = function(mapid, small_canvas, mapcontainer) {

  // if true, canvas cover only map window (required for Mapbox)
  this.canvasOnlyOnMap = small_canvas || false;
  this.trasholds = {allsum: 0, spatsum:0};
  let filter = null;

  this.setFilter = function(f){
    filter = f;
  };

  this.getFilter = function(){
    return filter;
  };

  this.updateMapSize = function(){
    this.mapdiv = document.getElementById(mapid);
    let z = this.mapdiv.style.zIndex;
    z == "" ? z = 300 : z = parseInt(z) + 1;

    if (!this.canvasOnlyOnMap) {
      let body = document.getElementsByTagName('body')[0];

      //var mapparentdiv = document.getElementById(mapid).parentElement;
      this.b = body.offsetHeight - (this.mapdiv.offsetTop + this.mapdiv.offsetHeight);
      /* lower (bottom)left corner for webgl*/
      this.l = this.mapdiv.offsetLeft;
      /* lower left corner for webgl*/
      this.w = this.mapdiv.offsetWidth;
      this.h = this.mapdiv.offsetHeight;

      this.body_width = body.offsetWidth;
      this.body_height = body.offsetHeight;

      this.canvas.setAttribute('id', canvasid);
      this.canvas.setAttribute("width", this.body_width);
      this.canvas.setAttribute("height", this.body_height);
      this.canvas.setAttribute("style", "position:fixed ; " +
        "top:" + 0 + "px ; " +
        "left:" + 0 + "px; " +
        "pointer-events: none;" +
        "z-index: " + z + "; " +
        "width: " + this.body_width + "px; " +
        "height: " + this.body_height + "px"
      )
    }
    else{ // this.canvasOnlyOnMap === true
      this.w = this.mapdiv.offsetWidth;
      this.h = this.mapdiv.offsetHeight;
      this.b = 0;
      this.l = 0;

      this.canvas.setAttribute('id', canvasid);
      this.canvas.setAttribute("width", this.w);
      this.canvas.setAttribute("height", this.h);

      this.canvas.setAttribute("style", "position:fixed ; " +
        "top:" + this.mapdiv.offsetTop + "px ; " +
        "left:" + this.mapdiv.offsetLeft + "px; " +
        "pointer-events: none;" +
        "z-index: " + z + "; " +
        "width: " + this.w + "px; " +
        "height: " + this.h + "px"
      );
    }
  };

  /**
   * Global variables
   */
  const canvasid = 'webglayer';
  this.mapdiv = document.getElementById(mapid);
  const mapparentdiv = document.getElementById(mapid).parentElement;
  this.canvas = document.createElement('canvas');
  this.updateMapSize();

  if (mapcontainer!= null){
     let element = document.getElementById(mapcontainer); // -- SSU enable to append into id or object
          (element ? element : mapcontainer).appendChild(this.canvas);
  } else {
    mapparentdiv.appendChild(this.canvas);
  }

  gl = this.canvas.getContext('webgl',
      {preserveDrawingBuffer: true}) || this.canvas.getContext('experimental-webgl',
      {preserveDrawingBuffer: true}
      );

  if (!gl) {
    alert("Could not initialise WebGL");
  }


  /**
   * Common databuffers for all dimensions
   */
  this.databuffers = [];
  this.matrices = [];


  this.update = function(){
    /**
     * Global variables
     */
    //canvas = document.getElementById(canvasid);

    //div = canvas.parentElement;

    gl = this.canvas.getContext('webgl', {preserveDrawingBuffer: true, antialias: true}) || this.canvas.getContext('experimental-webgl', {preserveDrawingBuffer: true});

      if (!gl) {
        alert("Could not initialise WebGL, sorry :-(. Are you using Chrome?");
        }

  }

  this.resetWebGL = function(){
    gl = null;
    gl = this.canvas.getContext('webgl', {preserveDrawingBuffer: true, antialias: true}) || this.canvas.getContext('experimental-webgl', {preserveDrawingBuffer: true});

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




  /**
   * Creates a data buffer object. itemSize is a dimension of the data
   */
  this.addDataBuffer = function(data, itemSize, name, min, max) {

    if (typeof(this.databuffers[name])!='undefined'){
      throw 'buffer '+name+' already exists';
    }

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    buffer.itemSize = itemSize;
    buffer.numItems = data.length / itemSize;
    buffer.name = name;
    buffer.min = min;
    buffer.max = max;
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    this.databuffers[name] = buffer;
  }

  this.addElementBuffer = function(data, itemSize, name) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
    buffer.itemSize = itemSize;
    buffer.numItems = data.length / itemSize;
    buffer.name = name;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    this.databuffers[name] = buffer;
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
    }	else {
      console.log("warning - uniform "+name+" already set.")
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
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

  }


  this.bindElementBuffer = function(id){
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.databuffers[id]);
  }

  this.enableBufferForName = function(prog, buff, name){
    //	gl.useProgram(prog);
      var buf = this.databuffers[buff];
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);

      if (prog[name]==null){
        if (gl.getAttribLocation(prog, name) >= 0) {
          prog[name] = gl.getAttribLocation(prog, name);
        } else {
          throw "Error: attribute " +  name + " does not exist in program."+prog.name ;
        }
      }

      if (typeof(buf)=='undefined'){
        throw 'Buffer for ' +name + ' is not deffined.';
      }

        gl.enableVertexAttribArray(prog[name]);
        gl.vertexAttribPointer(prog[name], buf.itemSize, gl.FLOAT,
            false, 0, 0);

    }



  this.enableFilterTexture = function(prog){
  //	gl.useProgram(prog);
    //this.readPixels();
    if (prog.rasterLoc == null){
      prog.rasterLoc = this.getUniformLoc(prog, 'filter');
    }

    gl.uniform1i(prog.rasterLoc , 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, filter.getActiveTexture());

  }


  this.getUniformLoc = function(prog, name){
    var loc = gl.getUniformLocation(prog, name);
    if (loc==null){
      console.error("Error setting common uniform "+name+" for program "+ prog.name);
    } else {
      return loc;
    }
  }
  /**
   * Delete buffer
   * @param bufname buffer name
   */
  this.cleanBuffer = function (bufname) {
    var buf = this.databuffers[bufname];
    gl.deleteBuffer(buf);
    delete this.databuffers[bufname];
  }

}
