/**
 * Class identify objects in the map
 * @param id {String} ID of the dimension
 * @param properties_path {String} path to folder with files for identify
 * @constructor
 */
WGL.dimension.IdentifyDimension = function (id, properties_path) {
  // ID of dim
  this.id = id;
  this.isSpatial = true;
  this.dataPath = properties_path;
  // identify point size
  this.pointSize = 5;
  this.debug = false;
  this.onlySelected = true;
  this.enabled = true;

  var framebuffer;
  var texture;
  var manager = WGL.getManager();
  var GLU = WGL.internal.GLUtils;

  this.glProgram = GLU.compileShaders('identify_vShader', 'identify_fShader');

  this.setEnabled = function(v) {
      this.enabled = v;
  };

  this.getEnabled = function() {
    return this.enabled;
  };

  this.init = function () {
    // allow FLOT extension
    if (!gl.getExtension("OES_texture_float")){
        throw "OES_texture_float GL extension is not available";
    }
    // create framebuffer
    framebuffer = gl.createFramebuffer();
    framebuffer.width = manager.canvas.width;
    framebuffer.height = manager.canvas.height;

    // texture
    texture = gl.createTexture();
    texture.name = "identify";

    // bind framebuffer and texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // properties of actual texture
    console.log(framebuffer.width, framebuffer.height);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebuffer.width,
        framebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    // attaches a texture to framebuffer
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D, texture, 0);

    // bind screen texture
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // enable program
    gl.useProgram(this.glProgram);
    manager.storeUniformLoc(this.glProgram, 'pointsize');
    manager.storeUniformLoc(this.glProgram, 'numfilters');
    manager.storeUniformLoc(this.glProgram, 'all');

    // disable program
    gl.useProgram(null);

  };
  this.init();

  this.createMapFramebuffer = function () {
    this.init();
  };

  /**
   *
   * @param {int} num number of item in WGL
   */
  this.render = function (num) {
    gl.useProgram(this.glProgram);
    manager.bindMapMatrix(this.glProgram);
    gl.uniform1f(this.glProgram['numfilters'], manager.trasholds.allsum);
    manager.enableBufferForName(this.glProgram, "wPoint", "wPoint");
    manager.enableBufferForName(this.glProgram, "pts_id", "pts_id" );
    manager.enableBufferForName(this.glProgram, "index", "index");
    manager.bindRasterMatrix(this.glProgram);

    if(!this.debug){
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.bindTexture(gl.TEXTURE_2D, texture);
    }

    gl.viewport(manager.l, manager.b, manager.w, manager.h);

    // blending strategy
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.ONE, gl.ZERO, gl.ONE, gl.ONE);

    gl.uniform1f(this.glProgram['pointsize'], this.pointSize);
    if (this.onlySelected){
        gl.uniform1f(this.glProgram['all'], 0.);
    }else {
        gl.uniform1f(this.glProgram['all'], 1.);
    }



    manager.enableFilterTexture(this.glProgram);

    // clean previous result
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // draw
    gl.drawArrays(gl.POINTS, 0, num);

    gl.useProgram(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  };

  /**
   * Read one pixel form Identity texture on position x,y
   * @param x {int} pageX
   * @param y {int} pageY
   * @returns {Float32Array} RGBA pixel
   */
  this.readPixels = function (x, y) {
    var readout = new Uint8Array(4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE){
        gl.readPixels(x, manager.canvas.height - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, readout);
    }
    else {
        throw "Framebuffer is not complete!";
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return readout;

  };

  /**
   *
   * @param x {int} pageX
   * @param y {int} pageY
   * @returns {Array} [point ID, number of points on pixel]
   */
  this.identify = function (x, y) {
    const pix = this.readPixels(x, y);
    // convert from 3x unsigned_byte to int
    var b, num_zero;
    var final_bin = "";
    for (var i = 0; i < 3; i++){
      b = pix[i].toString(2);
      num_zero = 8 - b.length;
      var str_zero = "";
      for (var j = 0; j < num_zero; j++){
        str_zero += "0";
      }
      final_bin += str_zero + b;
    }
    const point_id = parseInt(final_bin, 2);
    return [point_id, pix[3]];
  };

  /**
   * Delete program, texture and framebuffer.
   */
  this.clean = function () {
    gl.deleteProgram(this.glProgram);
    gl.deleteTexture(texture);
    gl.deleteFramebuffer(framebuffer);
  };

  /**
   * Returns properties of the point on position x,y (require jquery.js and jquery.csv.js)
   * @param x {int} pageX
   * @param y {int} pageY
   * @param callback callback function
   */
  this.getProperties = function (x, y, callback) {
    var idt = this.identify(x, y);
    var id = idt[0];
    var num =idt[1];
    if (num != 0){
      var file = Math.floor(id/10) + '.txt';
      $.get(this.dataPath + file, function (data) {
        var dataArray = $.csv.toObjects(data,{
          delimiter:"'",
          separator:','
        });
        dataArray.forEach(function (t) {
          if (t['ID'] == id){
            t['webgl_num_pts'] = num;
            callback(t)
          }
        })
      });
    }
  }
};