<script id="heatmap_render_vShader" type="x-shader/x-vertex">
		
	attribute vec4 v_texCoord;
		
	//uniform sampler2D inter_raster;
	
	
	varying vec4 var_texCoord;

	void main() {
		
		gl_Position = v_texCoord;
		var_texCoord =  v_texCoord;

	}
</script>
    
<script id="heatmap_render_fShader" type="x-shader/x-fragment">
precision mediump float;

uniform sampler2D heatmap_raster;

//min max for whole data
uniform float max;
uniform float min;

//min max for selected data
uniform float max_filter;
uniform float min_filter;
uniform float reduceSelection;

varying vec4 var_texCoord;

uniform mat4 colors;
uniform mat4 unselcolors;

uniform int light_bg;

// (size X, size Y, renderResolution)
uniform vec3 rasterSize;

vec4 getColor(float val, mat4 colors){
    vec4 col1;
    vec4 col2;
    vec4 col;
    vec4 black = vec4(0.0,0.0,0.0,0.4);
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
    col =  col1*rangeval + col2*(1.-rangeval);

    return col;
}

vec4 interpolate2(vec2 pos){
    vec4 fdata = texture2D(heatmap_raster, pos);
    float fdata_sum = 0.;
    vec2 onePixel = vec2(1.,1.)/vec2(rasterSize[0], rasterSize[1]);

    for (int i = -1; i <= 1; i++){
        for (int j = -1; j <= 1; j++){
            fdata_sum += texture2D(heatmap_raster, pos + vec2(float(i) * onePixel[0],float(j) * onePixel[1]))[1];
        }
    }
    fdata_sum = fdata_sum / 9.0;
    if (fdata[0] != 0.){
        fdata[0] = fdata_sum;
    }
    fdata[1] = fdata_sum;

    return fdata;
}
vec4 interpolate4(vec2 pos){
    vec4 fdata = texture2D(heatmap_raster, pos);
    vec4 fdata_sum = vec4(0., 0., 0., 0.);
    vec2 onePixel = vec2(1.,1.)/vec2(rasterSize[0], rasterSize[1]);

    for (int i = -2; i <= 2; i++){
        for (int j = -2; j <= 2; j++){
            fdata_sum += texture2D(heatmap_raster, pos + vec2(float(i) * onePixel[0],float(j) * onePixel[1]));
        }
    }
    fdata_sum = fdata_sum/25.0;

    return fdata_sum;
}
      	
      			
void main() {
    float x = (var_texCoord[0] + 1.)/2.;
    float y = (var_texCoord[1] + 1.)/2.;
    vec4 fdata;

    if (rasterSize[2] == 2.0){
        fdata = interpolate2(vec2(x, y));
    }
    else if (rasterSize[2] == 4.0){
        fdata = interpolate4(vec2(x, y));
    }
    else{
        fdata = texture2D(heatmap_raster, vec2(x, y));
    }

    vec4 col;
    float r = 0.;
    float val;

    float t =min_filter/6. ;
    float tx =max_filter/6. ;
    //val = (fdata[0]-min_filter)/(max_filter-min_filter);

    // fdata[1]
    if ( fdata[2] > 0. && (fdata[1] < (min_filter) && fdata[1]>= (min_filter - t) ) || (fdata[1] > (max_filter) && fdata[1] <= (max_filter+tx  ))){
        // orange color to create the selection border
        col = vec4(1.,0.549019608,0.,1.);
    }

    else if (fdata[2] > 0. && fdata[3]>0. && fdata[1] >= min_filter && fdata[1]<= max_filter) {
        //data are selected including spatial filter
         //= floor(val*4./4.);
        //val =  	(fdata[0] -	min_filter)  / (max_filter - min_filter);
        val =  	fdata[0] / reduceSelection;
        col =   getColor(val, colors);//col1*rangeval + col2*(1.-rangeval);//vec4(val, 1.-val , 0. , 0.0+val*2.);//vec4(1.,0.,0.,0.);

    }
    else if ( fdata[3]>0. ) {
        //data are seleted but not with spatial filter
        val = (fdata[1]-min)/(max-min);
        col =  getColor(val, unselcolors);
    }	else {

        col = vec4(0.,0.,0.,0.);
    }


    gl_FragColor = col;
}
</script>
