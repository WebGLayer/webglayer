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
  		 
  		  	
  		  			
  		float val = fdata[0] / fdata[1];
  		if (fdata[0] != 0. && fdata[3] >4.) {
  			if (val>=0. && val <=0.2){ col = 		vec4(254./256.,240./256.,217./256.,.8);}
  			else if (val>0.2 && val <=0.4)  { col = vec4(253./256.,204./256.,138./256.,.8);}  		
  			else if (val>0.4 && val <=0.6)  { col = vec4(252./256.,141./256.,89./256.,.8);}
  			else if (val>0.6 && val <=0.8)  { col = vec4(227./256.,74./256.,51./256.,.8);}  		
  			else if (val>0.8 && val <=1.)  { col = vec4(179./256.,0.,0.,.8);}
  			else {col = vec4(179./256.,0.,0.,.8);}
  			//col = vec4(.1,val+0.1,1.-val,1.);
  		}	else {
  			col = vec4(0.,0.,0.,0.);
  		}
  			
	
		gl_FragColor = col;
	//	gl_FragColor = fdata;
      }
</script>