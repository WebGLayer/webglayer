<script id="lineChart_vShader" type="x-shader/x-fragment">

      attribute float attr;
      attribute float findex;     
      varying float this_att;         
     
      void main() {
		  	
  		gl_Position = vec4(findex,0.,0.,1.);		  		       
		gl_PointSize = 1.0;
		this_att = attr;
 		
      }
  </script>
    
  <script id="lineChart_fShader" type="x-shader/x-vertex">
          precision mediump float;  
 		
 		varying float this_att;         
     	 
      void main() {     
		gl_FragColor = vec4(this_att,1.,0.,0); 		
      }
  </script>