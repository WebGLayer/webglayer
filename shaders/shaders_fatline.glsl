<script id="fatline_vShader" type="x-shader/x-vertex">
      attribute vec4 wPoint;
      attribute vec2 normals;   
      attribute float miter;
     
      uniform mat4 mapMatrix;
      uniform mat4 rasterMatrix;
 
      
      varying vec2 norm;
      varying float edge;
      void main() {
	
		edge = sign(miter);
  	 	vec2 pointPos = wPoint.xy + vec2(normals * 1./1000.0 * abs(miter));
  	    //vec4 mp = vec4(wPoint[0] +normals[0]/5., wPoint[1] + normals[1]/5.,0,1.); 
  		vec4 p =  mapMatrix *  vec4(pointPos,0.,1.);//mp; //wPoint;
  		//float n_speed = (speed+1.)/2.;
  		
  	  			
  			gl_Position = p;   
  			if (miter < 0.){
  				norm = normals;
  			}
  			else {
  				norm = vec2(0.);
  			}
  			edge = sign(miter);
  		
		
      }
    </script>
    
    <script id="fatline_fShader" type="x-shader/x-fragment">
      precision mediump float;  
 	
	
     varying vec2 norm;
  	 varying float edge;
  	 
   	 float length(vec2 a, vec2 b){
        	return sqrt(pow((abs(a[0]-b[0])),2.)+pow((abs(a[1]-b[1])),2.));
      	}
           
      void main() {


      	//float dist =  abs(length(norm, vec2(0.0))-0.5) ;
      	float dist = abs(edge);        
   
     	if ( dist < 0.2  ) {     		
     		//gl_FragColor = vec4(1., 1. / pow(0.01+dist*10.,grad),selected, 0.);//col;
     		
     		//gl_FragColor = vec4(dist, 0. , 0.,1.);  
     		gl_FragColor = vec4(1., 0. ,0.,1.);
     	} else {
     		gl_FragColor = vec4(0., 0. ,0.,1.);//col; 
     	}
     	
     	gl_FragColor = vec4(0.1*(1.-pow(dist,3.)), 0. ,0.,1.-dist+0.1);//col; 
     //	float v = abs(edge);
 	//	v = smoothstep(0.65, 0.7, 0.6); 
  	//	gl_FragColor = mix(vec4(1.,0.,0., 1.0), vec4(0.0, 0.,1.,1.), v);
    	
       //gl_FragColor = vec4(sqrt(pow((abs(gl_PointCoord.xy[0]-0.5)),2.)), 0. ,0.,1.);//col; 
      }
      
   
    </script>