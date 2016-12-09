<script id="kdeline_vShader" type="x-shader/x-vertex">
      attribute vec4 wPoint;
      attribute float angles;   
      attribute float lengths;
           
      uniform mat4 mapMatrix;
      uniform mat4 rasterMatrix;
      uniform float kernel;
      
     varying float length_val;
  	 varying float kernel_val;
  	 varying float k_x;
  	 varying float k_y;
      
    
      
      void main() {
	
		float PI = 3.1415926535897932384626433832795;		
		float edge = sign(lengths);
		float dx = 0.;
		float dy = 0.;
		float an = abs(angles);
		float dir = sign(angles);
		float an_shift;
				
		float ks = sqrt(2.* pow(kernel,2.));
		
		if (dir == 1.){
			an_shift = 	PI/4.*3.;
		} else {
			an_shift = 	PI/4.;
		}
		
		if (edge == 1.){
			dy = sin(an + an_shift ) * ks;
			dx = cos(an + an_shift ) * ks;  
		} else if (edge == -1.) {
			dy = sin(an - an_shift ) * ks;
			dx = cos(an - an_shift ) * ks;  
		} 
		
  	 	vec2 pointPos = wPoint.xy + vec2(dx, dy);
  	    //vec4 mp = vec4(wPoint[0] +normals[0]/5., wPoint[1] + normals[1]/5.,0,1.); 
  		vec4 p =  mapMatrix *  vec4(pointPos,0.,1.);//mp; //wPoint;
  		//float n_speed = (speed+1.)/2.;
  		 
  		kernel_val = kernel;
  		length_val = abs(lengths) / kernel_val;
  		
  		
  		// k_x from line center in kernels
  		k_x = dir * (length_val/2.+ 1.); // legnth from center + 2 * half kernels at the begining and end
  		
  		// k_y goes form -1 to 1 kernel
  		k_y = edge ;	
  			
  		gl_Position = p;   

      }
    </script>
    
    <script id="kdeline_fShader" type="x-shader/x-fragment">
      precision mediump float;  
 	
	     
  	 varying float length_val;
  	 varying float kernel_val;
  	 varying float k_x;
  	 varying float k_y;
  
  
  	 
   	 float length(vec2 a, vec2 b){
        	return sqrt(pow((abs(a[0]-b[0])),2.)+pow((abs(a[1]-b[1])),2.));
      	}
      	
     vec2 intersect(vec2 a, vec2 b){
     	vec2 res = vec2(0.,0.);   
        if ( (a[0] >= b[0]) && (a[1] <= b[1]) ){
     		res = a;
     	} else if (a[0]<b[0] && a[1] < b[1]){
     		res = vec2(b[0],a[1]);
     	} else if (a[1]>b[1] && a[0]> b[0]){
     		res = vec2(a[0],b[1]);
     	} else if (a[0] < b[0] && a[1] > b[1]){
     		res = b;
     	}
     	else {
     		res = vec2(0.,0.);     		
     	}
     	return res;
     }
               
     
     float intesectD(float y){
     	if (abs(y) > 0.9 ){
     		return 1.;
     	} else {
     		return 0.;
     	}     	
     }
     
     
      void main() {


      	//float dist =  abs(length(norm, vec2(0.0))-0.5) ;
      	//float dist = abs(k_y) /(length_val+kernel_val*2.);        
     	
     	// evaluate if the kernel is bigger then the line and 
     	vec2 interval = intersect(vec2(k_x-1., k_x+1.), vec2(-length_val/2., length_val/2.));     	
     		
     	float v = abs(interval[1] - interval[0])/2. ;
     	
     	float dist =  tan( pow((1.-abs(k_y)),1.));
     	
     	float fv = v*dist /5.;
     	if (v < 1.){
     	//	fv =0.;
     	}
     	
     	//float fv = v;//abs(k_y / kernel_val);
     
     	
     	float pom;
  
     	gl_FragColor = vec4(fv, fv ,1.,1.);//col; 
     //	float v = abs(edge);
 	//	v = smoothstep(0.65, 0.7, 0.6); 
  	//	gl_FragColor = mix(vec4(1.,0.,0., 1.0), vec4(0.0, 0.,1.,1.), v);
    	
       //gl_FragColor = vec4(sqrt(pow((abs(gl_PointCoord.xy[0]-0.5)),2.)), 0. ,0.,1.);//col; 
      }
      
   
    </script>