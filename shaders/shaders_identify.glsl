<script id="identify_vShader" type="x-shader/x-vertex">
attribute vec4 wPoint;
attribute float pts_id;
attribute vec2 index;

uniform mat4 mapMatrix;
uniform mat4 rasterMatrix;
uniform float pointsize;
uniform float numfilters;
uniform float all;


uniform sampler2D filter;

varying float col;

void main() {
    float p_size = pointsize;

    vec4 p =  mapMatrix * wPoint;

    vec4 rp = rasterMatrix * vec4(index[0],index[1],0.,1.);
    vec4 fdata = texture2D(filter, vec2(rp[0],rp[1]));

    if (fdata[0]>= ( numfilters / 256.) || numfilters == 0. || all > 0.5){
        gl_Position = p;
        gl_PointSize =  p_size;
        col = pts_id;
    }
    else {
        gl_Position = vec4(0.,0.,0.,0.);
        gl_PointSize = 0.;
    }
}

</script>

<script id="identify_fShader" type="x-shader/x-fragment">
precision mediump float;
varying float col;

float length(vec2 a, vec2 b){
    return sqrt(pow((abs(a[0]-b[0])),2.)+pow((abs(a[1]-b[1])),2.));
}
vec4 int_to_3byte(float k){
    float col = k;
    float byte0, byte1, byte2;
    int j = 0;
    int l = 0;
    float sum = 0.;
    float jedna = 0.;
    for (int i = 0; i < 24; i++){
        float ex = exp2(float(23-i));
        if (col/ex >= 1.0){
            sum += exp2(float(7-j));
            col -= ex;
        }
        if (j == 7){
            if (l == 0) byte0 = sum;
            if (l == 1) byte1 = sum;
            if (l == 2) byte2 = sum;
            j = -1;
            sum = 0.;
            l++;
            jedna++;
        }
        j++;
    }
    return vec4(byte0/255.0, byte1/255.0, byte2/255.0, 1.0/255.0);
}
void main() {
    float dist =  length(gl_PointCoord.xy, vec2(0.5,0.5));

    if (dist < 0.5 && dist!= 0. ) {
        gl_FragColor = int_to_3byte(col);
    }
    else {
        gl_FragColor = vec4(0., 0. ,0.,0.);
    }
}
</script>