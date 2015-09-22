<script id="filter_vShader" type="x-shader/x-vertex">
  	  attribute vec4 wPoint;
      attribute float attr1;   
      attribute vec2 index;

         
      uniform float filterid;   
      uniform mat4 mapMatrix;
      uniform mat4 rasterMatrix;
   
      uniform sampler2D histFilter;
      uniform sampler2D mapFilter;
      
      
      varying vec4 col;
      
      void main() {	
  			
		vec4 p =  mapMatrix * wPoint;
  		   	     	
		 // if data are in the map window 
		if (-1. <= p[0] && p[0]<=1. && -1. <= p[1] && p[1]<=1.){
			vec4 rp = rasterMatrix * p;
  			vec4 at1   = texture2D(histFilter, vec2(attr1, 0.5));
  			vec4 polyb = texture2D(mapFilter , vec2((p[0]+1.)/2., (p[1]+1.)/2.));    
  					
			// if data are selected  			
  			if ( at1[0] > 0. &&  polyb[0] > 0.){
  				col = vec4( pow(2.,filterid)/256., 0., 0., 0.);
  			} else {  	
  				// data are not selected  		   
  		    	col = vec4(0., 1./256., 0., 0.); 	  		  
  			}
  		} else {
  			//data are out of the window
  			col = vec4(0., 0. , 1./256., 0.);
  		}
  	
		gl_PointSize = 	1.;
		gl_Position = vec4(index[0], index[1], 0., 1.);

      }
    </script>
    
    <script id="filter_fShader" type="x-shader/x-fragment">    
       precision mediump float;  
       
		varying vec4 col;

      	void main() {
			gl_FragColor = col;
      }
    </script>