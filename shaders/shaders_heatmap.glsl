<script id="heatmap_vShader" type="x-shader/x-vertex">
      attribute vec4 wPoint;  
      attribute vec2 index;
      
      uniform mat4 mapMatrix;
      uniform mat4 rasterMatrix;
      
      uniform float radius;  
     
       
      uniform sampler2D filter;
      uniform float numfilters;
      uniform float renderResolution;
      
      uniform float spatsum;
       
      varying vec4 aPos;  
      varying float selected;
            
      void main() {
		  	  
  		float p_size = radius;
  	    	 
  		vec4 p =  mapMatrix * wPoint;
  		p[0] = p[0]/renderResolution - (1. - 1./renderResolution);
  		p[1] = p[1]/renderResolution - (1. - 1./renderResolution);
  		  		
  		vec4 rp = rasterMatrix * vec4(index[0],index[1],0.,1.);
  		vec4 fdata = texture2D(filter, vec2(rp[0],rp[1]));  		
  		
  		gl_Position = p; //vec4(-0.,-2.,0.,0.);    	
		gl_PointSize = p_size;
		
  		// if data are selected  
  		if ( fdata[0]>= ( numfilters / 256.)  || numfilters==0.){
  				selected = 1.;  			  
  			  /*test if the data are selected without considering spatial index*/	
   		} else if ( fdata[0]>=  (numfilters - spatsum) / 256. ){
  				selected = 0.;  			
			}
  		else {
  			gl_Position = vec4(-0.,-2.,0.,0.);    	
			gl_PointSize = 0.;
  		 	selected = 0.;
  		}
  		
		
		aPos = wPoint;	
				
 		
      }
</script>
    
<script id="heatmap_fShader" type="x-shader/x-fragment">
precision mediump float;
varying vec4 aPos;
varying float selected;

// kernel wight coeficient
uniform float grad;

float length(vec2 a, vec2 b){
    return sqrt(pow((abs(a[0]-b[0])),2.)+pow((abs(a[1]-b[1])),2.));
}
float gauss(float dis){
    return pow(2.71828, -dis*dis/0.05555)/(1.77245385*0.166666);
}

void main() {

    float dist =  length(gl_PointCoord.xy, vec2(0.5,0.5));

    if (dist <= 0.5  ) {
        float val;
        if (grad < 0.0){
            val = gauss(dist);
        }
        else{
            val = 1. - pow(dist*2.,grad);
        }
        if (selected == 1.){
            gl_FragColor = vec4(val, val , selected, 1.);
        } else {
            gl_FragColor = vec4(0., val, selected, 1.);
        }
    }
    else {
        gl_FragColor = vec4(0., 0. ,0.,0.);
    }

}
</script>