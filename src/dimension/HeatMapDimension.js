/** @constructor */
WGL.dimension.HeatMapDimension = function(id) {

  var manager = WGL.getManager();
  var GLU = WGL.internal.GLUtils;
  this.id = id;

  /*indicate if the point has a value or just 1 should be used for every point*/
  this.hasValues = false;
  // this.manager = manager;
  // Dimension.call(this, manager);
  this.isSpatial = true;
  this.lockScale = false;


  this.maxcal = new WGL.internal.MaxCalculator(Math.floor(manager.w / 5),
    Math.floor(manager.h / 5));
  var framebuffer = gl.createFramebuffer();
  var last_num;

  var visible = true;
  var illumination = false;
  var doGetMax = true;
  var legend;

  this.setVisible = function(v) {
    visible = v;
  };

  this.renderIllumination = function(v) {
    illumination = v;
  };

  this.setDoGetMax = function(m) {
    doGetMax = m;
  };

  /* default radiusFunc */
  this.radiusFunction = function(r, z) {
    return Math.pow(z, 2) / 10;
  };

  /* default getMax function */
  this.maxFunction = function(max) {
    if (max == undefined) {
      return 99999999;
    }
    return max;
  };
  /* default getMin function */
  this.minFunction = function(min) {
    return 0;
  };

  this.gradFunction = function() {
    return 1/4;
  };


  this.addLegend = function(thelegend) {
    legend = thelegend;
    legend.setDimension(this);
  };

  this.createMapFramebuffer = function() {
    framebuffer.width = manager.w;
    framebuffer.height = manager.h;

    var renderbuffer = gl.createRenderbuffer();

    this.heatTexture = gl.createTexture();
    this.heatTexture.name = "heat map texture";

    if (!gl.getExtension("OES_texture_float")) {
      console.log("OES_texture_float not availble -- this is legal");
    }
    /** Framebuffer */
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    /** Texture */
    gl.bindTexture(gl.TEXTURE_2D, this.heatTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // Prevents
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebuffer.width,
      framebuffer.height, 0, gl.RGBA, gl.FLOAT, null);

    /** Render buffer */
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
      framebuffer.width, framebuffer.height);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D, this.heatTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER, renderbuffer);

    gl.bindTexture(gl.TEXTURE_2D, null);
  };

  /**
   * init Programs
   */
  this.initProgram = function() {
    this.createMapFramebuffer();

    /**
     * program uniforms
     */
    gl.useProgram(this.glProgram);
    manager.storeUniformLoc(this.glProgram, radius);
    manager.storeUniformLoc(this.glProgram, grad);
    manager.storeUniformLoc(this.glProgram, drawselect);
    manager.storeUniformLoc(this.glProgram, numfilters);
    manager.storeUniformLoc(this.glProgram, spatsum);

    gl.useProgram(null);

  };
  var drawselect = 'drawselect';
  var numfilters = 'numfilters';
  var spatsum = 'spatsum'

  var radius = 'radius';

  var radiusWordVal = 5;
  var heatMapMaximim = 0;
  var heatMapMinimum = 0;

  var grad = 'grad';

  this.glProgram = GLU.compileShaders('heatmap_vShader', 'heatmap_fShader',
    this);

  this.initProgram();
  this.renderer2 = new WGL.dimension.IluminationRenderer(manager);
  this.renderer = new WGL.dimension.HeatMapRenderer(manager);
  // var maxcal = new
  // MaxCalculator(Math.floor(manager.w/6),Math.floor(manager.h/6));
  var the_filter;


  this.setFilter = function(f) {
    the_filter = f;
  };

  this.setRadius = function(r){
    radiusWordVal = r;
  };

  this.setValues = function(val){
    this.glProgram = GLU.compileShaders('heatmap_val_vShader', 'heatmap_val_fShader',
      this);
    this.glProgram.name='hetampwithvalues';
    manager.addDataBuffer(WGL.utils.array2TA(val), 1, 'hmValues');
    this.initProgram();
    this.hasValues = true;
  };
  this.setup = function() {
    // this.createFramebuffer();
    // gl.useProgram(this.glProgram);
    /** add specific buffer and uniforms */
    gl.useProgram(this.glProgram);

    manager.bindMapMatrix(this.glProgram);
    manager.enableBufferForName(this.glProgram, "wPoint", "wPoint");
    manager.enableBufferForName(this.glProgram, "index", "index");

    if (this.hasValues){
      manager.enableBufferForName(this.glProgram, "hmValues", "values" );
    }
    manager.bindRasterMatrix(this.glProgram);

    gl.bindTexture(gl.TEXTURE_2D, this.heatTexture);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    gl.viewport(0, 0, manager.w, manager.h);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.disable(gl.DEPTH_TEST);
    // gl.disable(gl.BLEND);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);

    manager.enableFilterTexture(this.glProgram);
  };

  this.renderData = function(num) {
    last_num = num;
    this.setup();

    gl.useProgram(this.glProgram);
    gl.uniform1f(this.glProgram[numfilters], manager.trasholds.allsum);
    // console.log(manager.filternum);

    this.radiusValue =  this.radiusFunction(radiusWordVal, manager.zoom);
    //legend.circle.attr("r", this.radiusValue);

    gl.uniform1f(this.glProgram[radius], this.radiusValue*2 );
    gl.uniform1f(this.glProgram[grad], this.gradFunction());
    gl.uniform1f(this.glProgram[spatsum], manager.trasholds.spatsum);
    //console.log("spatsum "+manager.trasholds.spatsum) ;
    //console.log("allsum "+manager.trasholds.allsum) ;
    // gl.uniform1f(this.glProgram[drawselect], 0);
    // gl.drawArrays(gl.POINTS, 0, num);

    // gl.uniform1f(this.glProgram[drawselect], 1);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.drawArrays(gl.POINTS, 0, num);
    gl.useProgram(null);

    gl.bindTexture(gl.TEXTURE_2D, null);

    this.renderer.heatTexture = this.heatTexture;
    this.renderer2.heatTexture = this.heatTexture;

    manager.heatTexture = this.heatTexture;
  };

  var renderMin;
  var renderMax;
  this.render = function(num) {

    if (visible == false) {
      return;
    }

    this.renderer.colorScheme = WGL.colorSchemes.getSchemeSelected();

    this.renderData(num);

    // var max = maxcale.getMax(this.heatTexture);

    if (!this.lockScale) {

      if (doGetMax) {
        this.maxall = this.maxcal.getMax(this.heatTexture, 1);
        if (manager.trasholds.spatsum > 0) {
          this.maxsel = this.maxcal.getMax(this.heatTexture, 0);
        }
      }
      renderMax = this.maxFunction(this.maxall);
      renderMin = this.minFunction(this.maxall);
      this.maxVal = this.maxall;
      this.minVal= 0;
    }

    renderMax = this.maxFunction(this.maxVal);
    renderMin = this.minFunction(this.minVal);




    // if (typeof(the_filter) !='undefined') {
    if (manager.trasholds.spatsum > 0) {
      // var maxsel = this.maxcal.getMax(this.heatTexture, 0);
      if (typeof (the_filter) != 'undefined') {
        /* there is a color filter applied */
        this.renderer.render(renderMin, renderMax, the_filter[0],
          the_filter[1], this.maxsel);


        if(illumination) {
          this.renderer2.render(renderMin, renderMax, the_filter[0], the_filter[1], this.maxsel);
        }

        legend.updateMaxAll(this.maxall);
        legend.drawWithFilter(this.maxsel);
      } else {
        this.renderer.render(renderMin, renderMax, renderMin, renderMax,
          this.maxsel);

        if(illumination) {
          this.renderer2.render(renderMin, renderMax, renderMin, renderMax, this.maxsel);
        }


      }

      if (legend != undefined) {
        legend.drawWithoutFilter();
        legend.updateMaxAll(this.maxsel );
      }
      // legend.updateMaxSel(this.maxall);
    } else {
      // this.renderer.render( renderMin, renderMax, 0, 0);
      this.renderer.render(renderMin, renderMax, renderMin, renderMax,
        renderMax);

      if(illumination) {
        this.renderer2.render(renderMin, renderMax, renderMin, renderMax,	renderMax);
      }

      if (legend != undefined) {
        legend.drawWithoutFilter();
        legend.updateMaxAll(this.maxall);
      }

    }

    //this.renderer2.render(renderMin, renderMax, renderMin, renderMax,	renderMax);


  };

  this.update = function() {
    this.renderData(last_num);
  };

  this.reRender = function() {
    this.render(last_num);
  };
  this.tearDown = function() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.useProgram(null);
  };

  this.setMatrix = function(matrix) {
    manager.matrices.push(matrix);
    manager.mapMatrix = matrix;
  };

  this.readPixels = function(x,y, mode) {
    mode = mode || "";
    var readout;

    if (mode === 'float'){
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      readout = new Float32Array(4);
      gl.readPixels(x,y, 1, 1, gl.RGBA, gl.FLOAT, readout);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      readout = new Uint8Array(4);
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, readout);
      console.log(readout, x, y);
    }

    return readout;

  };
  this.clean = function () {
    gl.deleteTexture(this.heatTexture);
    gl.deleteProgram(this.glProgram);
    this.renderer.clean();
    if(illumination) {
      this.renderer2.clean();
    }
  };

};
