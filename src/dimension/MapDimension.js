WGL.dimension.MapDimension = function(id){

  var manager = WGL.getManager();
  var GLU = WGL.internal.GLUtils;

  this.id = id;
  this.isSpatial = true;
  this.glProgram = GLU.compileShaders('map_vShader', 'map_fShader', this);

  this.name = "map";

  var drawselect = 'drawselect';
  var numfilters = 'numfilters';
  var point_size = 'pointsize';
  var select_psk = 'select_psk';
  // coeficient for selected point size
  this.selectPointSizeCoef = 1.0;

  gl.useProgram(this.glProgram);
  manager.storeUniformLoc(this.glProgram, drawselect);
  manager.storeUniformLoc(this.glProgram, numfilters);
  //pointsize
  manager.storeUniformLoc(this.glProgram, point_size);
  // point size coeficient for selected points (pointsize * select_psk)
  manager.storeUniformLoc(this.glProgram, select_psk);

  gl.useProgram(null);

  var visible = true;
  this.setVisible = function(v){
    visible = v;
  };

  this.setup = function() {

    //gl.useProgram(this.glProgram);
    /** add specific buffer and uniforms */
    gl.useProgram(this.glProgram);

    gl.uniform1f(this.glProgram.numfilters, manager.trasholds.allsum );
    manager.bindMapMatrix(this.glProgram);
    manager.enableBufferForName(this.glProgram, "wPoint", "wPoint");
    manager.enableBufferForName(this.glProgram, "index", "index");
    manager.bindRasterMatrix(this.glProgram);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(manager.l, manager.b, manager.w, manager.h);
    //gl.clearColor(0.0, 0.0, 0.0, 0.0);
    //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.disable(gl.DEPTH_TEST);

    gl.enable(gl.BLEND);
    //gl.blendFunc(gl.ONE, gl.ONE);
    gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA  );
    //gl.enable(gl.BLEND);
    //gl.blendFunc(gl.ONE, gl.ONE);
    if (this.glProgram.loc == null ){
      this.glProgram.loc = gl.getUniformLocation(this.glProgram, "zoom");
      if (!this.glProgram.loc instanceof WebGLUniformLocation) {
        console.error("Uniform set failed, uniform: " + u_name
            + " value " + value);
        return;
      }
    }
    /*set point size and selected point size*/
    gl.uniform1f(this.glProgram[point_size], this.pointSize(manager.zoom));
    gl.uniform1f(this.glProgram[select_psk], this.selectPointSizeCoef);
  };
  /**
   * Compute point size from zoom level
   * @param zoom zoom level (1 to 19)
   * @returns {number} point size in px
   */
  this.pointSize = function (zoom) {
    return Math.pow(2, zoom)/Math.pow(zoom,3);
  };
  this.render = function(num) {

    if (visible == false){
      return;
    }

    this.setup();
    manager.enableFilterTexture(this.glProgram);
    //gl.useProgram(this.glProgram);
    if (this.glProgram.drawselect == null){
      this.glProgram.drawselect = gl.getUniformLocation(this.glProgram, "drawselect");
      if (!this.glProgram.drawselect instanceof WebGLUniformLocation) {
        console.error("Uniform set failed, uniform");
        return;
      }
    }
    gl.uniform1f(this.glProgram.drawselect, 0);

    gl.drawArrays(gl.POINTS, 0, num);

    gl.uniform1f(this.glProgram.drawselect, 1);

    gl.drawArrays(gl.POINTS, 0, num);
      gl.useProgram(null);


  };

  this.tearDown = function(){
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.useProgram(null);
  };


  this.setMatrix = function(matrix){
    manager.matrices.push(matrix);
    manager.mapMatrix=matrix;
  };

  this.readPixels = function() {

  //	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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

  };

  this.clean = function () {
    gl.deleteProgram(this.glProgram);
  }
};