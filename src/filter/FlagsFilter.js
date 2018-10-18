/**
 *
 * @param {string} dimension_id dimension ID
 * @param {string} filter_id filter ID
 * @param {string} [operator=OR] logical operator for flags, "OR" or "AND". (e.g animal OR/AND flower)
 * @constructor
 */
WGL.filter.FlagsFilter = function(dimension_id, filter_id, operator){
  var manager = WGL.getManager();
  var GLU = WGL.internal.GLUtils;
  this.isspatial = 2.0;
  this.id = filter_id;
  this.operator = operator || "OR";

  var filters_fa;
  var height = WGL.getDimension(dimension_id).flags.length;
  var width = 2;

  // for creating filter texture for this filter
  this.filterProgram = GLU.compileShaders("histFilter_vShader",  "histFilter_fShader", this);
  this.filterProgram.name ="HistFilter";

  // for writing to the index texture
  this.filterProgramFT = GLU.compileShaders("filterflags2_vShader", "filterflags2_fShader", this);
  this.filterProgramFT.name ="FlagsFilter";

  // store uniform for 'filterid' and 'indexText'
  manager.storeUniformLoc(this.filterProgramFT, "filterid");
  manager.storeUniformLoc(this.filterProgramFT, 'indexText');

  /***
   * Buffers
   */
  var posBuffer = gl.createBuffer();
  posBuffer.attr="FilterLines";

  var framebuffer = gl.createFramebuffer();
  var renderbuffer = gl.createRenderbuffer();

  this.filterTexture = gl.createTexture();
  this.filterTexture.name = "flags filter texture";
  this.selected_flags = [];


  /*Initialise offscreen buffer*/

  /** Framebuffer */
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  /** Texture*/
  gl.bindTexture(gl.TEXTURE_2D, this.filterTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width,
    height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);


  /** Render buffer*/
  gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
    width, height);

  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D, this.filterTexture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
    gl.RENDERBUFFER, renderbuffer);


  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);


  this.renderFilter = function(){
    gl.useProgram(this.filterProgram);
    gl.bindTexture(gl.TEXTURE_2D, this.filterTexture);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    gl.viewport(0, 0, width, height);

    this.bindFilters();
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

    if (this.filterProgram[posBuffer.attr] == null){
      this.filterProgram[posBuffer.attr] = gl.getAttribLocation(this.filterProgram, posBuffer.attr);
    }
    if (this.filterProgram[posBuffer.attr] >= 0){
      gl.enableVertexAttribArray(this.filterProgram[posBuffer.attr]);
      gl.vertexAttribPointer(this.filterProgram[posBuffer.attr], 2, gl.FLOAT, false, 0, 0);
    } else {
      console.error("Error binding buffer: "+posBuffer);
      return;
    }

    gl.drawArrays(gl.LINES, 0, pointsSize);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);

  };

  /**
   *
   * @param {int[]} selected_flags flags for selection (indexes)
   */
  this.createFilteringData = function(selected_flags){
    this.selected_flags = selected_flags;
    var allfilters = [];
    var m = 0;

    for (var i = 0;i < this.selected_flags.length; i++){
      allfilters[m++] = 0.1;
      allfilters[m++] = 2*((this.selected_flags[i]+0.5)/height)-1;
      allfilters[m++] = 1.;
      allfilters[m++] = 2*((this.selected_flags[i]+0.5)/height)-1;
    }

    filters_fa = new Float32Array(allfilters);
  };

  this.bindFilters = function(){
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, filters_fa, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    pointsSize =filters_fa.length/2;
  };

  this.readPixels = function() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    var readout = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, readout);
    console.log(readout);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };

  /**
   *
   * @param dim
   * @param framebuffer
   * @param filterTexture
   */
  this.writeToThatTexture = function (dim, framebuffer, filterTexture) {

    gl.useProgram(this.filterProgramFT);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    gl.viewport(0, 0, framebuffer.width, framebuffer.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE);

    manager.enableBufferForName(this.filterProgramFT, "index", "index");

    /* Activate filtering texture*/
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.filterTexture);
    gl.uniform1i(this.filterProgramFT.histLoc, 0);

    /*Activate index texture*/
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, filterTexture);
    gl.uniform1i(this.filterProgramFT.indexText, 1);

    // activate 'filterid'
    //console.log("index", this.index);
    gl.uniform1f(this.filterProgramFT.filterid, this.index);

    for (var i = 0; i < dim.flags.length; i++){
      //console.log(dim.name + "_" + dim.flags[i], manager.num_rec);
      manager.enableBufferForName(this.filterProgramFT, dim.name + "_" + dim.flags[i], "attr1");
      gl.drawArrays(gl.POINTS, 0, manager.num_rec);
    }

    gl.useProgram(null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  }

};