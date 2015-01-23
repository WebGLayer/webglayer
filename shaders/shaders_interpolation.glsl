<script id="interpolation_vShader" type="x-shader/x-vertex">
		
	attribute vec4 v_texCoord;
		
//	uniform sampler2D inter_raster;
	
	varying vec4 var_texCoord;

	void main() {
		
		gl_Position = v_texCoord;
		var_texCoord =  v_texCoord;

	}
</script>
    
<script id="interpolation_fShader" type="x-shader/x-fragment">
      precision mediump float;  
	  
 	// uniform mat4 rasterMatrix;	
	  uniform sampler2D inter_raster;
	  varying vec4 var_texCoord;
	// varying vec2 v_texCoord;
	
      void main() {
	 	float x = (var_texCoord[0]+1.)/2.;
	 	float y =  (var_texCoord[1] +1.)/2.;
  		vec4 fdata = texture2D(inter_raster, vec2(x, y));
  		
  		vec4 col;
  		if (fdata[0] != 0.) {
  			col = vec4(0.0,0.,(fdata[0] / fdata[1]) * 30.,.8);
  		} 	else {
  			col = vec4(0.,0.,0.,0.);
  		}
		gl_FragColor = col;
      }
</script>