<script id="filter2d_vShader" type="x-shader/x-vertex">
  	 
     
      attribute vec2 index;
      attribute vec4 wPoint; 
               
      uniform float filterid;
      
      /*flag for spatial filter*/      
      uniform mat4 mapMatrix;
 
   
      uniform sampler2D histFilter;    
      uniform sampler2D indexText;
      
      
      varying vec4 col;
      
      void main() {	
  		bool fil[4];
		vec4 p =  mapMatrix * wPoint;  		
  		// value in the filter texture before this filter is applied   	     
  		vec4 thatval = texture2D(indexText , vec2((index[0] +1.)/2. , (index[1]+1.)/2.));     		 
  		//float val =  thatval[0];	  			
		vec4 at1;
			
  			/*consider map filter*/
  			at1   = texture2D(histFilter, vec2((p[0]+1.)/2., (p[1]+1.)/2.));  				
  			
			// if data are selected  			
  			if ( at1[0] > 0. ){ 	  			
				//calculates final value, third number indicates if it is selected by spatial filter or not  																	
  				//col = vec4(thatval[0] + pow(2.,(filterid))/256., 0., 0., thatval[3]);
  				col = vec4(thatval[0] + pow(2.,(filterid))/256., 0., 0., 0.);
  			} else {  	
  				// data are not selected by this filter   
  		    	col = vec4(thatval[0] , 0., 0., 0.); 	  		  
  			}
  			
  		//} else {
  		//	//data are out of the window
  		//	col = vec4(0. , 0. , 1./256., 0.);
  		//}
  	
		gl_PointSize = 	1.;
		gl_Position = vec4(index[0], index[1], 0., 1.);

      }
    </script>
    
    <script id="filter2d_fShader" type="x-shader/x-fragment">    
       precision mediump float;  
       
		varying vec4 col;

      	void main() {
			gl_FragColor = col;
      }
