WGL.internal.Filter = function() {

  var manager = WGL.getManager();
  var GLU = WGL.internal.GLUtils;

  manager.setFilter(this);
  this.rastersize = manager.r_size ;

  this.lastDim ="";

  this.filterProgram1d = GLU.compileShaders("filter1d_vShader", "filter1d_fShader",
      this);

  this.filterProgram2d = GLU.compileShaders("filter2d_vShader", "filter2d_fShader",
      this);

  // for Flags Dimension
  this.filterProgramFT = GLU.compileShaders("filterflags_vShader", "filterflags_fShader", this);
  this.filterProgramFT.name ="FlagsFilter";



  var filterid = 'filterid';
  manager.storeUniformLoc(this.filterProgram1d, filterid);
  manager.storeUniformLoc(this.filterProgram2d, filterid);
  manager.storeUniformLoc(this.filterProgramFT, filterid);

  var indexText = 'indexText';
  manager.storeUniformLoc(this.filterProgram1d, indexText);
  manager.storeUniformLoc(this.filterProgram2d, indexText);
  manager.storeUniformLoc(this.filterProgramFT, indexText);

  manager.storeUniformLoc(this.filterProgramFT, 'isand');
  manager.storeUniformLoc(this.filterProgramFT, 'num_selected');


  //var isspatial = 'isspatial';
  //manager.storeUniformLoc(this.filterProgram, isspatial);

  //this.filterProgram.name = "Main filter";

  var framebuffer = [];
  var renderbuffer  = [];
  var filterTexture = [];
  framebuffer.width = WGL.getRasterSize();
  framebuffer.height = WGL.getRasterSize();

/*******************************first texture*************************************/
  filterTexture[0] = gl.createTexture();
  filterTexture[1] = gl.createTexture();
  framebuffer[0] = gl.createFramebuffer();
  framebuffer[1] = gl.createFramebuffer();
  renderbuffer[0] =  gl.createRenderbuffer();
  renderbuffer[1] =  gl.createRenderbuffer();

  framebuffer[0].width = this.rastersize;
  framebuffer[0].height = this.rastersize;
  framebuffer[0].id = 0;

  framebuffer[1].width = this.rastersize;
  framebuffer[1].height = this.rastersize;
  framebuffer[1].id = 1;
  var activeID =0 ;
  var thatID = 1;
  /** Framebuffer */

  confFrameBufferTexture(1);
  confFrameBufferTexture(0);

  function confFrameBufferTexture(tid){
    /** Texture */

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer[tid]);

    //filterTexture[tid] = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, filterTexture[tid]);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebuffer.width,
        framebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    /** Render buffer */
    //renderbuffer[tid] =  gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer[tid]);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
        framebuffer.width, framebuffer.height);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,  filterTexture[tid], 0);

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
        gl.RENDERBUFFER, renderbuffer[tid]);

    /*set texture to 0*/
    gl.viewport(0, 0, framebuffer.width,framebuffer.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  }

  /*evaluate all filters*/
  this.applyFilterAll = function(dimensions) {

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer[thatID]);
    gl.viewport(0, 0, framebuffer.width,framebuffer.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer[activeID]);
    gl.viewport(0, 0, framebuffer.width,framebuffer.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);

    for (var i in dimensions) {



      for (var f in dimensions[i].filters) {
        /* traverse all filters and evaluate them */
        var d = dimensions[i].filters[f];
        /*Filter texture*/
        if(d.isActive){
          /* Activate filter texture*/
          if (d.isspatial === 2.0){
            d.writeToThatTexture(dimensions[i], framebuffer[thatID]);
            // enable back Active ID
            gl.useProgram(this.filterProgramFT);
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer[activeID]);

            // enable buffer for index
            manager.enableBufferForName(this.filterProgramFT,  "index", "index");

            /*Activate index texture*/
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, filterTexture[thatID]);
            gl.uniform1i(this.filterProgramFT.indexText, 1);

            // filter ID
            gl.uniform1f(this.filterProgramFT.filterid, d.index);
            // if 1.0 use AND operator 0.0 use OR operator
            if (d.operator === "OR"){
              gl.uniform1f(this.filterProgramFT.isand, 0.);
            }
            else{
              gl.uniform1f(this.filterProgramFT.isand, 1.);
            }
            // number of selected flags
            gl.uniform1f(this.filterProgramFT.num_selected, d.selected_flags.length);

            gl.drawArrays(gl.POINTS, 0, manager.num_rec);

            // clear thatID
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer[thatID]);
            gl.viewport(0, 0, framebuffer.width,framebuffer.height);
            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            // enable back activeID
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer[activeID]);
            continue;
          }
          else if (d.isspatial === 0.0){
            this.filterProgram=this.filterProgram1d;
            gl.useProgram(this.filterProgram);
          }
          else {
            this.filterProgram=this.filterProgram2d;
            gl.useProgram(this.filterProgram);
            manager.bindMapMatrix(this.filterProgram);
          }
          manager.enableBufferForName(this.filterProgram,  "index", "index");
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, d.filterTexture);
          gl.uniform1i(this.filterProgram.histLoc , 0);

          /*Activate index texture*/
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, filterTexture[thatID]);
          gl.uniform1i(this.filterProgram.indexText, 1);

          gl.uniform1f(this.filterProgram.filterid, d.index);
          gl.uniform1f(this.filterProgram.isspatial, d.isspatial);
          //console.log("filter num "+manager.filternum);
          if (d.isspatial === 0.0){
            /*this fitler is not spatial - bind 1d attribute*/
            manager.enableBufferForName(this.filterProgram, dimensions[i].name, "attr1");
            gl.drawArrays(gl.POINTS, 0, manager.num_rec);
          } else {
            /*this filter is spatial - bind the wPoint*/
            manager.enableBufferForName(this.filterProgram, "wPoint", "wPoint");
            gl.drawArrays(gl.POINTS, 0, manager.num_rec);

          }
        }
      }
    }
    //this.readPixels(activeID, 'active');
      //this.readPixels(thatID, 'pasive');
    //this.filterTexture = filterTexture[activeID];
    //manager.filterTexture = filterTexture[activeID];
    //console.log("returnunt texture "+activeID);

    //this.readPixels(activeID, 'active');
      //this.readPixels(thatID, 'pasive');

    gl.useProgram(null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };

/*Render filter for particular dimension*/
  this.applyFilterDim = function(dim, filterId) {

    if (dim.filters[filterId].isspatial === 2.0){
      console.error('This operation in not supported for FlagsFilter');
      return;
    }
    else if (dim.filters[filterId].isspatial === 0.0){
      this.filterProgram=this.filterProgram1d;
      gl.useProgram(this.filterProgram);
      manager.enableBufferForName(this.filterProgram, dim.name, "attr1");
    } else {
      this.filterProgram=this.filterProgram2d;
      gl.useProgram(this.filterProgram);
      manager.bindMapMatrix(this.filterProgram);
      manager.enableBufferForName(this.filterProgram, "wPoint", "wPoint");
    }

    //console.log("binding framebuffer to "+activeID);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer[activeID]);

    gl.viewport(0, 0, framebuffer.width,framebuffer.height);
    //gl.clearColor(0.0, 0.0, 0.0, 0.0);
    //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.ONE, gl.ZERO, gl.ONE, gl.ONE);
  //	gl.blendFunc(gl.ONE, gl.ONE);

  //	this.manager.enableBuffersAndCommonUniforms(this.filterProgram);

    manager.enableBufferForName(this.filterProgram,  "index", "index");

    /* Activate filtering texture*/
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, dim.filters[filterId].filterTexture);
    gl.uniform1i(this.filterProgram.histLoc , 0);

    /*Activate index texture*/
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, filterTexture[thatID]);
    gl.uniform1i(this.filterProgram.indexText, 1);

    //console.log("index "+ dim.filter.index);
    gl.uniform1f(this.filterProgram.filterid, dim.filters[filterId].index);
    //gl.uniform1f(this.filterProgram.isspatial, dim.filters[filterId].isspatial);

    gl.drawArrays(gl.POINTS, 0, manager.num_rec);

    gl.useProgram(null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };

  this.getActiveTexture = function(){
    return filterTexture[activeID];
  }

  this.getActiveFB = function(){
    return framebuffer[activeID];
  }
  this.getPassiveFB = function(){
    return framebuffer[thatID];
  }

  this.switchTextures = function() {
    if (activeID == 0){
      activeID = 1;
      thatID =  0;
    } else {
      activeID = 0;
      thatID =  1;
    }

    //manager.indexFB = framebuffer[activeID];
  }
  this.readPixelsAll = function() {
    this.readPixels(thatID,   "pasive id:");
    this.readPixels(activeID, "active id:")
  }

  this.readPixels = function(id, label) {
    /**
     * bind restexture as uniform, render, and read
     */
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer[id]);
    // console.time("reading_pix");
    var readout = new Uint8Array( framebuffer.width * framebuffer.height* 4);
    gl.readPixels(0, 0, framebuffer.width, framebuffer.height, gl.RGBA,
        gl.UNSIGNED_BYTE, readout);
    // console.timeEnd("reading_pix");
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    //console.log(readout);

    var selected = [];
    for (var i =0; i < readout.length; i=i+1){
      //console.log(readout[i]);
      selected.push(readout[i]);
      //if (readout[i]>1) {selected.push(i/4)};
    }

    console.log(label+" buffer: "+selected);
    return selected;// readout;
  }

}