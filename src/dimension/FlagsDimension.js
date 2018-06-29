/**
 *
 * @param {string} name ID of dimension
 * @param {array[]} data input data
 * @param {string[]} flags list of all used flags
 * @constructor
 */
WGL.dimension.FlagsDimension = function (name, data, flags){
  //properties
  this.isSpatial = false;
  this.name = name;
  this.flags = flags;
  this.num = data.length;
  this.filters = [];
  this.filtersids = [];

  this.visible = true;
  this.setVisible = function(v){
      this.visible = v;
  }

  // manager and GLU
  var manager = WGL.getManager();
  var GLU = WGL.internal.GLUtils;

  var float_reader = new WGL.internal.FloatRasterReader(2, flags.length);


  // GPU
  // load GLSL program
  this.program = GLU.compileShaders("flags_vShader", "flags_fShader", this);

  // store uniform 'numfilters'
  gl.useProgram(this.program);
  manager.storeUniformLoc(this.program, "numfilters");
  gl.useProgram(null);

  // create framebuffer
  var framebuffer = gl.createFramebuffer();
  framebuffer.width = 2; // only 0 and 1
  framebuffer.height = flags.length;

  this.texture = gl.createTexture();
  this.texture.name = "flags_texture";

  // get extension for float
  if (!gl.getExtension("OES_texture_float")) {
    throw "OES_texture_float not availble";
  }

  /** bind Framebuffer */
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  /** bind Texture */
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);



  // merge texture with framebuffer
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebuffer.width,
    framebuffer.height, 0, gl.RGBA, gl.FLOAT, null);


  /** Render buffer */
  var renderbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
    framebuffer.width, framebuffer.height);

  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D, this.texture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
    gl.RENDERBUFFER, renderbuffer);

  gl.bindTexture(gl.TEXTURE_2D, null);


  // methods
  this.render = function (num_rec) {
    //console.log("flags render");
    gl.useProgram(this.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    gl.viewport(0, 0, framebuffer.width, framebuffer.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);

    // blend function 1*a + 1*b
    gl.blendFunc(gl.ONE, gl.ONE);

    manager.enableBufferForName(this.program,  "index", "index");
    manager.enableFilterTexture(this.program);

    gl.uniform1f(this.program.numfilters, 	manager.trasholds.allsum);

    for (var i = 0; i < flags.length; i++){
      manager.enableBufferForName(this.program, name+"_"+flags[i], "attr");
      gl.drawArrays(gl.POINTS, 0, num_rec);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);

  };
  /**
   *
   * @param {number} band pixel chanel available values are 0,1,2,3
   * @return {Float32Array}
   */
  this.readPixels = function (band) {
    /*var readout = new Float32Array(4*2*flags.length);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE){
      gl.flush();
      gl.readPixels(0, 0, 2, flags.length, gl.RGBA, gl.FLOAT, readout);
    }
    else {
      throw "Framebuffer is not complete!";
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    console.log(readout);
    //return readout;*/

    float_reader.render(this.texture, band);
    return float_reader.readPixels();
  };

  /**
   * @typedef {Object} FlagsPixels
   * @property {number} selected
   * @property {number} unselected
   * @property {number} out
   */
  /**
   *
   * @return {FlagsPixels}
   */
  this.getCounts = function () {
    var pix_sel = this.readPixels(0);
    var pix_uns = this.readPixels(1);
    var pix_out = this.readPixels(2);
    var res = {};
    for (var i = 0; i < flags.length; i++){
      var l = {};
      l.selected = pix_sel[2*i + 1];
      l.unselected = pix_uns[2*i + 1];
      l.out = pix_out[2*i + 1];
      res[flags[i]] = l;
    }
    return res;
  };

  this.makeArrays = function () {
    let dims = {};
    for (let i = 0; i < flags.length; i++){
      dims[flags[i]] = new Float32Array(data.length*2);
    }
    for (let i = 0; i < data.length; i++){
      for (let j = 0; j< flags.length; j++){
        if (data[i].indexOf(flags[j]) !== -1){
          dims[flags[j]][2*i] = 0.75;
          dims[flags[j]][2*i + 1] = (j + 0.5)/flags.length;
        }
        else{
          dims[flags[j]][2*i] = 0.25;
          dims[flags[j]][2*i + 1] = (j + 0.5)/flags.length;
        }
      }
    }
    //console.log(dims);
    this.addArraysToGPU(dims);
  };

  this.addArraysToGPU = function (dims) {
    for (var k in dims){
      manager.addDataBuffer(dims[k], 2, name+"_"+k);
    }
  };

  this.makeArrays();

  /**
   *
   * @return {WGL.filter.FlagsFilter}
   */
  this.getFilter = function () {
    for (var k in this.filters){
      return this.filters[k];
    }
    return null;
  }

};