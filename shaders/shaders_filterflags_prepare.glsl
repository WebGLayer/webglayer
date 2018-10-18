<script id="filterflags_vShader" type="x-shader/x-vertex">
// this shader takes values (> 1) from indexText (THAT) and add filter to the indexText (ACTIVE)
attribute vec2 index;

uniform float filterid;
uniform sampler2D indexText;
uniform float isand;
uniform float num_selected;

varying vec4 col;

void main() {
bool fil[4];

// value in the filter texture before this filter is applied
vec4 thatval = texture2D(indexText , vec2((index[0] +1.)/2. , (index[1]+1.)/2.));

// AND operator
if (isand > 0.0){
    if ( thatval[0] > (num_selected-0.1)/256.){
        col = vec4(pow(2.,(filterid))/256., 0., 0., 0.);
    }
    else {
        col = vec4(0., 0., 0., 0.);
    }
}
// OR operator
else{
    if ( thatval[0] > 0. ){
        col = vec4(pow(2.,(filterid))/256., 0., 0., 0.);
    }
    else {
        col = vec4(0., 0., 0., 0.);
    }
}


gl_PointSize = 1.;
gl_Position = vec4(index[0], index[1], 0., 1.);

}
</script>

<script id="filterflags_fShader" type="x-shader/x-fragment">
precision mediump float;

varying vec4 col;

void main() {
    gl_FragColor = col;
}
</script>

