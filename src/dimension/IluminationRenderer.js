
WGL.dimension.IluminationRenderer = function(){
  //Phong reflection model variables
  this.ph_alpha = 0.1;
  this.ph_lightDir = [-1.0, 1.0, 5.0];
  this.ph_materialShininess = 1.0;
  this.ph_ambient = 0.01;

  var manager = WGL.getManager();
  var GLU = WGL.internal.GLUtils;

  this.glProgram = GLU.compileShaders("ilumination_renderer_vShader",  "ilumination_renderer_fShader");
  gl.useProgram(this.glProgram);
  var texCoordLocation = gl.getAttribLocation(this.glProgram, "v_texCoord");
  var rasterLoc = 	   gl.getUniformLocation(this.glProgram, "heatmap_raster" );

  manager.storeUniformLoc(this.glProgram, "colors");
  manager.storeUniformLoc(this.glProgram, "reduceSelection");
  manager.storeUniformLoc(this.glProgram, "rsize");

  // uniform loc for ph
  manager.storeUniformLoc(this.glProgram, "ph_alpha");
  manager.storeUniformLoc(this.glProgram, "ph_lightDir");
  manager.storeUniformLoc(this.glProgram, "ph_materialShininess");
  manager.storeUniformLoc(this.glProgram, "ph_ambient");



  this.colors =  new Float32Array(16);
  this.colors.set([ 1, 0, 0, 1.6,
                  1, 1, 0, 0.6,
                  0, 1, 0, 0.1,
                  0, 0, 0, 1 ]);

  this.unselcolors =  new Float32Array(16);
  this.unselcolors.set([  49/256, 130/256, 189/256, 0.8,
                         158/256, 202/256, 225/256, 0.4,
                         222/256, 235/256, 247/256, 0.1,
                         0, 0, 0, 1 ]);
  //var legend = new HeatMapLegend('legend');

    // provide texture coordinates for the rectangle.
    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
         1.0,  1.0,
         1.0, -1.0,
        -1.0,  1.0]), gl.STATIC_DRAW);

    gl.useProgram(this.glProgram);
    gl.uniformMatrix4fv(this.glProgram.colors, false, this.colors);
    gl.uniformMatrix4fv(this.glProgram.unselcolors, false, this.unselcolors);
    gl.useProgram(null);


  this.setup = function() {
    gl.useProgram(this.glProgram);
    gl.uniformMatrix4fv(this.glProgram.colors, false, this.colors);
    gl.uniform2f(this.glProgram.rsize,  manager.w, manager.h);

    // ph variables
    gl.uniform1f(this.glProgram.ph_alpha, this.ph_alpha);
    gl.uniform3f(this.glProgram.ph_lightDir, this.ph_lightDir[0], this.ph_lightDir[1], this.ph_lightDir[2]);
    gl.uniform1f(this.glProgram.ph_materialShininess, this.ph_materialShininess);
    gl.uniform1f(this.glProgram.ph_ambient, this.ph_ambient);

    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
    //gl.useProgram(this.glProgram);
    /** add specific buffer and uniforms */
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.uniform1i(rasterLoc , 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.heatTexture);


    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    gl.viewport(manager.l, manager.b, manager.w, manager.h);
  //	gl.clearColor(0.0, 0.0, 0.0, 0.0);
  //	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //	gl.disable(gl.DEPTH_TEST);
  //	gl.disable(gl.BLEND);
  //	gl.enable(gl.BLEND);
  //	gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA  );
  //	gl.blendFunc( gl.ONE, gl.ONE  );

  }


  this.render = function(min, max, min_f, max_f, reduceSelection) {
    this.setup();

    gl.uniform1f(this.glProgram.reduceSelection, reduceSelection);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.useProgram(null);
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



}
