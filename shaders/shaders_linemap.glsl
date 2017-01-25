<script id="mapline_vShader" type="x-shader/x-vertex">
     attribute vec4 wPoint;
   //  attribute float attr;          
     attribute vec2 index;
     attribute vec4 normals;
      
     uniform mat4 mapMatrix;  
     uniform mat4 rasterMatrix;  
     uniform float zoom;
     uniform float drawselect;                
   
     uniform sampler2D filter;
     varying vec4 col;
          
       
      void main() {
		
  	  	
  	  			
  		vec4 rp = rasterMatrix * vec4(index[0],index[1],0.,1.);
  		vec4 fdata = texture2D(filter, vec2(rp[0],rp[1]));  		
  		vec4 p ;
  		// if data are selected  
  		if (fdata[0]>=1./256. && drawselect>0.5){
  			//col = vec4(1 ,1.-attr,0.,0.8);
  			col = vec4(1 ,0.5,0.,0.5);  	  		
  		} else if (fdata[0] < 1./256. && drawselect<0.5) {
  			//col = vec4(attr ,1.-attr,0.,0.5);  
  			col = vec4(0 ,0.5,0.,0.01);  		
  		
  		}   
  		
  				
  		else  {
  			p =  vec4(-2.,-2.,0.,0.);  	
  			//col = vec4(attr ,1.-attr,0.,0.3);
  		}
  		//col = vec4(1.,0.5,0.,0.01);
  		float dif = 0.0005;
  		vec4 m = 
  		vec4(wPoint[0]+normals[0]*dif,
  		     wPoint[1]+normals[1]*dif,
  		     0.,
  		     1.);
  		p =  mapMatrix * m;  	  	    	
  		  // col = vec4(0.0,0.,0.,0.75);
  		gl_Position = p;   	
		

 		
      }
    </script>
    
    <script id="mapline_fShader" type="x-shader/x-fragment">
      precision mediump float;  
   	  varying vec4 col;
      
      void main() {
   
      gl_FragColor = col; 
       
      }
      
   
    </script>