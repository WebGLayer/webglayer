<script id="mapline_vShader" type="x-shader/x-vertex">
attribute vec4 wPoint;
attribute vec2 index;
attribute float values;
attribute vec4 normals;

uniform mat4 mapMatrix;
uniform mat4 rasterMatrix;
uniform float zoom;
uniform float drawselect;

uniform sampler2D filter;
uniform float numfilters;

uniform float spatsum;
varying float selected;

varying vec4 col;
varying float hmval;

void main() {

	 hmval = values;
	vec4 rp = rasterMatrix * vec4(index[0], index[1], 0., 1.);
	vec4 fdata = texture2D(filter, vec2(rp[0], rp[1]));
	vec4 p;

	// if data are selected
	if (fdata[0] >= (numfilters / 256.) || numfilters == 0.) {
		selected = 1.;
		/*test if the data are selected without considering spatial index*/
	} else if (fdata[0] >= (numfilters - spatsum) / 256.) {
		selected = 0.;
	} else {
		gl_Position = vec4(-0., -2., 0., 0.);
		gl_PointSize = 0.;
		selected = 0.;
	}

	col = vec4(1., 0.5, 0., 0.01);
	float dif = 0.0005;
	vec4 m = vec4(wPoint[0] + normals[0] * dif, wPoint[1] + normals[1] * dif,
			0., 1.);
	p = mapMatrix * m;
	// col = vec4(0.0,0.,0.,0.75);
	gl_Position = p;

}
</script>

<script id="mapline_fShader" type="x-shader/x-fragment">
precision mediump float;
varying vec4 col;

varying float selected;
varying float hmval;

void main() {

	float val =  hmval;
	if (selected == 1.) {
		gl_FragColor = vec4(val, val, selected, 1.); //col;
	} else {
		gl_FragColor = vec4(0., 0., selected, 0.); //col;
	}

}

</script>
