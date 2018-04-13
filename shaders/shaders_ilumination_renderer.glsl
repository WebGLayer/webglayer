<script id="ilumination_renderer_vShader" type="x-shader/x-vertex">
		
	attribute vec4 v_texCoord;
		
	//uniform sampler2D inter_raster;
	
	
	varying vec4 var_texCoord;

	void main() {
		
		gl_Position = v_texCoord;
		var_texCoord =  v_texCoord;

	}
</script>
    
<script id="ilumination_renderer_fShader" type="x-shader/x-fragment">
    precision mediump float;
	  
 	// uniform mat4 rasterMatrix;	
	uniform sampler2D heatmap_raster;
	  
	 
	uniform float reduceSelection;
	uniform vec2 rsize;
	  
	varying vec4 var_texCoord;

	uniform mat4 colors;

	// ph variables
	uniform float ph_alpha;
    uniform vec3 ph_lightDir;
    uniform float ph_materialShininess;
    uniform float ph_ambient;
	  
	//const vec3 lightPos = vec3(0.5, 0.5, 2.);
	//const vec4 ambientColor = vec4(.0, .0, .0,1.);
	//const vec4 diffuseColor = vec4(0.9, 0.9, 0.9,1.);
	//const vec4 specColor =    vec4(0.0, 0.0, 0.0, 1.);
	
	//const vec3 ambientColor = vec3(1., 1., 1.);
    //const vec3 diffuseColor = vec3(1., 1., 1.);
    //const vec3 specColor    = vec3(1., 1., 1.);
    const vec3 ambientColor = vec3(1., 1., 1.);
    const vec3 diffuseColor = vec3(1., 1., 1.);
    const vec3 specColor    = vec3(1., 1., 1.);
	 
	
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
        float width = rsize[0];
        float height = rsize[1];
        
          	      
	 	float xc = (var_texCoord[0] + 1.)/2.;
	 	float yc = (var_texCoord[1] + 1.)/2.;
	 	
	 	float xt = (var_texCoord[0] + 1.)/2.;
	 	float yt = (var_texCoord[1] + 1.)/2. + 1./height*5.;
	 	
	 	float xd = (var_texCoord[0] + 1.)/2.;
	 	float yd = (var_texCoord[1] + 1.)/2. - 1./height*5.;
	 	
	 	float xr = (var_texCoord[0] + 1.)/2. + 1./width*5.;
	 	float yr = (var_texCoord[1] + 1.)/2.;
	 	
	 	float xl = (var_texCoord[0] + 1.)/2. - 1./width*5.;
	 	float yl = (var_texCoord[1] + 1.)/2.;
	 	
  		float fc =  texture2D(heatmap_raster, vec2(xc, yc))[0] / reduceSelection ;
  		float ft =  texture2D(heatmap_raster, vec2(xt, yt))[0] / reduceSelection ;
  		float fr =  texture2D(heatmap_raster, vec2(xr, yr))[0] / reduceSelection ;
  		float fl =  texture2D(heatmap_raster, vec2(xl, yl))[0] / reduceSelection ;
  		float fd =  texture2D(heatmap_raster, vec2(xd, yd))[0] / reduceSelection ;
  		
  		vec3 tt = vec3(xt -xc , yt -yc, ft - fc);
  		vec3 td = vec3(xd -xc , yd -yc, fd - fc);
  		vec3 tl = vec3(xl -xc , yl -yc, fl - fc);
  		vec3 tr = vec3(xr -xc , yr -yc, fr - fc);
  		
  		vec3 norm1 =(cross(tt,tl));
  		vec3 norm2 = (cross(td,tr));
  		
  		
  		/*PHONG SHADING here*/
  		//vec3 vertPos = vec3(xc ,yc, fc);
  		vec3 normal = normalize((norm2 + norm1) /2.);//normalize(-(cross(vec3(xt -xc , yt -yc, ft - fc), vec3(xr - xc , yr - yc, fr - fc) )));
  		vec3 lightDir = normalize(ph_lightDir);//normalize(vec3(-1.0, 1.0, 5.0));//normalize(lightPos - vertPos);
    	vec3 reflectDir = reflect(-lightDir, normal);
    	vec3 viewDir = normalize(vec3(0.0, 0.0,1.0));//normalize(-vertPos);
  		
  		float lambertian = max(dot(lightDir,normal), 0.0);
  		float specular = 0.0;
  		
  		if(lambertian > 0.0) {
       		float specAngle = max(dot(reflectDir, viewDir), 0.0);
      		 specular = pow(specAngle, ph_materialShininess);
    	}
   		
  		
  		
  		vec4 col;
  		float r = 0.;
		float val;

	
 		//val =  normal[1] / reduceSelection; 
  		//col =   getColor(val, colors);//col1*rangeval + col2*(1.-rangeval);//vec4(val, 1.-val , 0. , 0.0+val*2.);//vec4(1.,0.,0.,0.);

	 if (fc > 0.){
			 gl_FragColor = vec4(
			 			ph_ambient * ambientColor
			 		  + lambertian*diffuseColor
			 		  + specular*specColor, fc/1.5+ph_alpha); //fc/1.5+0.1
			 //vec4(ambientColor + lambertian*diffuseColor + specular*specColor, 1.0);
			//  gl_FragColor[3] = fc*reduceSelection;
	} else {
		
		 gl_FragColor = vec4( 0., 0., 0., 0. );
  		
	}
  		

		
      }
</script>