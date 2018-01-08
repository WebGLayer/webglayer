
WGL.dimension.HeatMapRenderer = function(){

  var manager = WGL.getManager();
  var GLU = WGL.internal.GLUtils;

  this.glProgram = GLU.compileShaders("heatmap_render_vShader",  "heatmap_render_fShader");
  gl.useProgram(this.glProgram);
  var texCoordLocation = gl.getAttribLocation(this.glProgram, "v_texCoord");
  var rasterLoc = 	   gl.getUniformLocation(this.glProgram, "heatmap_raster" );
  manager.storeUniformLoc(this.glProgram, "max");
  manager.storeUniformLoc(this.glProgram, "min");
  manager.storeUniformLoc(this.glProgram, "max_filter");
  manager.storeUniformLoc(this.glProgram, "min_filter");
  manager.storeUniformLoc(this.glProgram, "colors");
  manager.storeUniformLoc(this.glProgram, "unselcolors");
  manager.storeUniformLoc(this.glProgram, "reduceSelection");

  this.colors =  new Float32Array(16);

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
       gl.uniformMatrix4fv(this.glProgram.unselcolors, false, this.unselcolors);
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

    gl.disable(gl.DEPTH_TEST);
  //	gl.disable(gl.BLEND);
    gl.enable(gl.BLEND);
    gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA  );
  //	gl.blendFunc( gl.ONE, gl.ONE  );

  }

  this.render = function(min, max, min_f, max_f, reduceSelection) {
    //legend.updateMax(max);

    this.colors.set(convertRgbaToMatrix(WGL.colorSchemes.getSchemeMatrixSelected()));

    this.setup();

    //console.log(max);
      gl.uniform1f(this.glProgram.max, max);
      gl.uniform1f(this.glProgram.min, min);
      gl.uniform1f(this.glProgram.max_filter, max_f);
      gl.uniform1f(this.glProgram.min_filter, min_f);
      gl.uniform1f(this.glProgram.reduceSelection, reduceSelection);


     //console.log("max a min filter " +  min_f + " " +max_f )
     //console.log("max a min        " +  min + " " +max )

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
  this.clean = function () {
    gl.deleteBuffer(texCoordBuffer);
  }

  function convertRgbaToMatrix(m) {
    var matrix = new Float32Array(16);

    matrix[0] = m[0]/256;
    matrix[1] = m[1]/256;
    matrix[2] = m[2]/256;
    matrix[3] = 1.4;

    matrix[4] = m[3]/256;
    matrix[5] = m[4]/256;
    matrix[6] = m[5]/256;
    matrix[7] = 0.9;

    matrix[8] = m[6]/256;
    matrix[9] = m[7]/256;
    matrix[10] = m[8]/256;
    matrix[11] = 0.05;

    matrix[12] = 0;
    matrix[13] = 0;
    matrix[14] = 0;
    matrix[15] = 1;

    return matrix;
  }

}
