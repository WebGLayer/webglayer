WGL.dimension.LineDimension = function(id){

  var manager = WGL.getManager();
  var GLU = WGL.internal.GLUtils;

  this.id = id;
  this.isSpatial = true;
  this.glProgram = GLU.compileShaders('fatline_vShader', 'fatline_fShader', this);

  this.name = "map";
  var zoom = 'zoom';
  var drawselect = 'drawselect';
  var numfilters = 'numfilters';
  var uInverseTextureSize = 'uInverseTextureSize';

  gl.useProgram(this.glProgram);
  //manager.storeUniformLoc(this.glProgram, zoom);
  //manager.storeUniformLoc(this.glProgram, drawselect);
  manager.storeUniformLoc(this.glProgram, numfilters);
  manager.storeUniformLoc(this.glProgram, uInverseTextureSize);

  gl.useProgram(null);

  var visible = true;
  this.setVisible = function(v){
    visible = v;
  }

  this.setup = function() {

    //gl.useProgram(this.glProgram);
    /** add specific buffer and uniforms */
    gl.useProgram(this.glProgram);

    gl.uniform1f(this.glProgram.numfilters, manager.trasholds.allsum );

    var size = new Float32Array(2);
    size.set([ 1/manager.w, 1/manager.h]);
    gl.uniform2fv(this.glProgram.uInverseTextureSize,  size);



    manager.bindMapMatrix(this.glProgram);
    manager.enableBufferForName(this.glProgram, "wPoint", "wPoint");
    manager.enableBufferForName(this.glProgram, "normals", "normals");
    manager.enableBufferForName(this.glProgram, "miter", "miter");

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, manager.databuffers['indicies']);
    //manager.enableBufferForName(this.glProgram, "index", "index");
  //	manager.bindRasterMatrix(this.glProgram);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(manager.l, manager.b, manager.w, manager.h);
    //gl.clearColor(0.0, 0.0, 0.0, 0.0);
    //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.disable(gl.DEPTH_TEST);

    //gl.disable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    //gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA  );
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);

    /*set point size*/
  //	console.log( map.getZoom());

  //	gl.uniform1f(this.glProgram.zoom, manager.zoom);


  }
  this.render = function(num) {

    if (visible == false){
      return;
    }

    this.setup();
    //manager.enableFilterTexture(this.glProgram);
    //gl.useProgram(this.glProgram);

    //gl.uniform1f(this.glProgram.drawselect, 0);

    //gl.drawArrays(gl.TRIANGLES, 0, this.num);
    gl.drawElements(gl.TRIANGLES,this.num,gl.UNSIGNED_SHORT,0);

    //gl.uniform1f(this.glProgram.drawselect, 1);

    //gl.drawArrays(gl.TRIANGLES, 0, num);
     // gl.useProgram(null);


  }

  this.tearDown = function(){
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.useProgram(null);
  }


  this.setMatrix = function(matrix){
    manager.matrices.push(matrix);
    manager.mapMatrix=matrix;
  }

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
    var manager = WGL.getManager();
    manager.cleanBuffer("normals");
    manager.cleanBuffer("miter");
    gl.deleteProgram(this.glProgram);
  }

}