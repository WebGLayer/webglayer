<script id="pc_render_vShader" type="x-shader/x-vertex">
		
	attribute vec4 v_texCoord;
		
	//uniform sampler2D inter_raster;
	
	varying vec4 var_texCoord;

	void main() {
		
		gl_Position = v_texCoord;
		var_texCoord =  v_texCoord;

	}
</script>
    
<script id="pc_render_fShader" type="x-shader/x-fragment">
      precision mediump float;  
	  
 	// uniform mat4 rasterMatrix;	
	  uniform sampler2D heatmap_raster;
	  
	  //min max for whole data
	  uniform float max;
	  uniform float min;
	  
	  //min max for selected data
	  uniform float max_filter;
	  uniform float min_filter;
	  
	  varying vec4 var_texCoord;
	// varying vec2 v_texCoord;
	  uniform mat4 colors;
	  uniform mat4 unselcolors;		
	
	  vec4 getColor(float val, mat4 colors){
        	vec4 col1;
  			vec4 col2; 
  			vec4 col; 
  			float rangeval;
  			
  			if (val >= 0.5){
  				col1 = colors[0];
  				col2 = colors[1];
  				rangeval = (val - 0.5)*2.;
  				
  			} else {
  				col1 = colors[1];
  				col2 = colors[2];
  				rangeval = val *2.;
  			
  			}			
  			col =  col1*rangeval + col2*(1.-rangeval);//vec4(val, 1.-val , 0. , 0.0+val*2.);//vec4(1.,0.,0.,0.);
  			return col;
      	}
      	
      			
      void main() {
          	      
	 	float x = (var_texCoord[0] + 1.)/2.;
	 	float y = (var_texCoord[1] + 1.)/2.;
  		vec4 fdata = texture2D(heatmap_raster, vec2(x, y));
  		vec4 col;
  		float r = 0.;
		float val;
		if (fdata[0] == 0.) {
			col = vec4(0.,0.,0.,0.);
		} else {
			col =  getColor(fdata[0] /4000., colors);  		
			col[3] =  fdata[0] /4000. +.1;	
		}
		
  			
		gl_FragColor = col;//vec4(fdata[0] / 256.,0.,0.,fdata[0] /256.);//col;//fdata;//vec4(1.,0.,0.,1.);
		
      }
</script>