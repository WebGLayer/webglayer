<script id="filterflags2_vShader" type="x-shader/x-vertex">
  // this shader render all flags (sub-dimension) to the raster (THAT)
  attribute vec2 index;
  attribute vec2 attr1;

  uniform float filterid;

  uniform sampler2D histFilter;

  varying vec4 col;

  void main() {
    bool fil[4];
    vec4 at1;

        /*consider one row fitler*/
        at1  = texture2D(histFilter, vec2(attr1[0], attr1[1]));

        // if data are selected
        if ( at1[0] > 0. ){
            //calculates final value, third number indicates if it is selected by spatial filter or not
            col = vec4(1./256., 0., 0., 0.);
        } else {
            // data are not selected by this filter
            col = vec4(0, 0., 0., 0.);
        }

    gl_PointSize = 	1.;
    gl_Position = vec4(index[0], index[1], 0., 1.);

  }
</script>

<script id="filterflags2_fShader" type="x-shader/x-fragment">
   precision mediump float;

    varying vec4 col;

    void main() {
        gl_FragColor = col;
  }
</script>

