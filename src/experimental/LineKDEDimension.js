WGL.dimension.LineKDEDimension = function(id){

  var manager = WGL.getManager();
  var GLU = WGL.internal.GLUtils;

  this.id = id;
  this.isSpatial = true;
  this.glProgram = GLU.compileShaders('kdeline_vShader', 'kdeline_fShader', this);

  this.name = "map";
  var zoom = 'zoom';
  var drawselect = 'drawselect';
  var numfilters = 'numfilters';
  var kernel = 'kernel';

  this.maxcal = new WGL.internal.MaxCalculator(Math.floor(manager.w / 5),
      Math.floor(manager.h / 5));
  var framebuffer = gl.createFramebuffer();

  this.renderer2 = new WGL.dimension.HeatMapRenderer(manager);
  this.renderer = new WGL.dimension.IluminationRenderer(manager);

  var visible = true;
  this.setVisible = function(v){
    visible = v;
  }
  var radius = 0.002
  this.setRadius = function(r){
    radius =r;
  }

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
  }

  /**
   * init Programs
   */
  this.initProgram = function() {
    this.createMapFramebuffer();

    /**
     * program uniforms
     */
    gl.useProgram(this.glProgram);
    manager.storeUniformLoc(this.glProgram, kernel);

    gl.useProgram(null);

  }

  this.initProgram();


  this.setup = function() {

    //gl.useProgram(this.glProgram);
    /** add specific buffer and uniforms */
    gl.useProgram(this.glProgram);

    gl.uniform1f(this.glProgram.numfilters, manager.trasholds.allsum );

    //var size = new Float32Array(2);
    ///size.set([ 1/manager.w, 1/manager.h]);
    //gl.uniform2fv(this.glProgram.uInverseTextureSize,  size);


    manager.bindMapMatrix(this.glProgram);
    manager.enableBufferForName(this.glProgram, "wPoint", "wPoint");
    manager.enableBufferForName(this.glProgram, "lengths", "lengths");
    manager.enableBufferForName(this.glProgram, "angles", "angles");

    gl.uniform1f(this.glProgram[kernel], radius);

    //manager.enableBufferForName(this.glProgram, "index", "index");
  //	manager.bindRasterMatrix(this.glProgram);

    gl.bindTexture(gl.TEXTURE_2D, this.heatTexture);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    gl.viewport(0, 0, manager.w, manager.h);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.disable(gl.DEPTH_TEST);

  //	gl.disable(gl.BLEND);
  //	gl.blendFunc(gl.ONE, gl.ONE);
    ///gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA  );
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    this.renderer.heatTexture = this.heatTexture;
    this.renderer2.heatTexture = this.heatTexture;
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
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, manager.databuffers['indicies']);
    gl.drawElements(gl.TRIANGLES,this.num,gl.UNSIGNED_SHORT,0);
    this.maxall = this.maxcal.getMax(this.heatTexture, 1);
    this.renderer2.render(0,this.maxall, 0, this.maxall,this.maxall);
    this.renderer.render(0,this.maxall, 0, this.maxall,this.maxall);

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

  }
}



WGL.dimension.LineKDEDimension.array2TALines = function(lines) {

  this.getLength = function(a,b){
    return Math.sqrt(Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y,2))	;
  }

  this.getAngleCos = function(a,b){
    var numerator   = (a.x*b.x + a.y*b.y);
    var denominator = Math.sqrt(a.x*a.x + a.y*a.y) * Math.sqrt(b.x*b.x + b.y*b.y);

    return denominator / numerator   	;
  }

  this.getAngle = function(a,b){
    var an = Math.atan2((b.y-a.y) , (b.x - a.x));
    if  (an < 0) {
      an = an + Math.PI*2;
    }
    return an;
  }

  //pts_ar = new Float32Array(pts.length);
  //var trLines = [];

  /*count the points*/
  var point_num = 0;


  for (var i = 1; i < lines.length; i++) {
    try {
    var segments = lines[i].length -1;
    } catch(err) {
      console.warn(err);
    }
    point_num = segments*4 + point_num ;
  }

  var pts_ar = new Float32Array(point_num * 2);
  var lengths_ar =  new Float32Array(  point_num);
  var angles_ar=  new Float32Array(  point_num);

  var indicies=[];


  var pt_i = 0;
  var a_i =0;
  var l_i =0;
  var s_i = 0;
  for (var i = 1; i < lines.length; i++) {
    var theline=lines[i];

    for (var j = 0; j < theline.length-1; j++){

      var angle;
      var length;

        var a = theline[j];
        var b = theline[j+1]
        var angleab  = this.getAngle(a, b);
        var length = this.getLength(a, b);

        pts_ar[pt_i++] = a.x;
        pts_ar[pt_i++] = a.y;
        angles_ar[a_i++] = angleab;
        lengths_ar[l_i++] = length;
        pts_ar[pt_i++] = a.x;
        pts_ar[pt_i++] = a.y;
        angles_ar[a_i++] = angleab;
        lengths_ar[l_i++] = -length;


        pts_ar[pt_i++] = b.x;
        pts_ar[pt_i++] = b.y;
        angles_ar[a_i++] = -angleab;
        lengths_ar[l_i++] = length;
        pts_ar[pt_i++] = b.x;
        pts_ar[pt_i++] = b.y;
        angles_ar[a_i++] = -angleab;
        lengths_ar[l_i++] = -length;


        var start = s_i *4;
        indicies.push(start, start+1, start+2 , start +1, start+2, start+3);
        s_i++;
    }
  }

  return {pts:pts_ar , angles: angles_ar, lengths: lengths_ar, indicies:new Uint16Array(indicies), num: indicies.length};
}