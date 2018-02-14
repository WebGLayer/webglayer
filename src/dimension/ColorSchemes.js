WGL.dimension.ColorSchemes = function(){

  var schemes = {};

  schemes['blue'] = {
    'rgba': [44, 0, 222,
      0, 207, 178,
      0, 92, 242
    ],
    'bg': 'light',
      'alpha': [1.0, 0.9, 0.4]
  };

  schemes['red'] = {
    'rgba': [251, 48, 41,
      155, 11, 232,
        26, 29, 255
    ],
    'bg': 'light',
      'alpha': [1.4, 0.9, 0.4]
  };

  schemes['fire'] = {
    'rgba': [256, 256, 228,
      253, 154, 41,
      255, 0, 72
    ],
    'bg': 'dark',
    'alpha': [1.4, 0.9, 0.1]
  };

  schemes['icy'] = {
    'rgba': [256, 256, 256,
      120, 187, 236,
      36, 28, 95
    ],
    'bg': 'dark',
      'alpha': [1.4, 0.9, 0.2]
  };

  schemes['gamma'] = {
    'rgba': [
      256, 0, 0,
      256, 256, 0,
      0, 256, 0
    ],
    'bg': 'dark',
      'alpha': [1.4, 0.9, 0.05]
  };

  var schemeSelected = "fire";
  var matrixSelected = schemes[schemeSelected]['rgba'];
  var alphaSelected = schemes[schemeSelected]['alpha'];
  var bgSelected = schemes[schemeSelected]['bg'];

  this.setSchemeSelected = function(s) {
    schemeSelected = s;
    matrixSelected = schemes[schemeSelected]['rgba'];
    bgSelected = schemes[schemeSelected]['bg'];
    alphaSelected = schemes[schemeSelected]['alpha'];
  };

  this.getSchemeSelected = function() {
    return schemeSelected;
  };

  this.setCustomMatrixSelected = function(m) {
    schemeSelected = 'custom';
    matrixSelected = m;
    bgSelected = 'dark';
    alphaSelected = [1.4, 0.9, 0.3];
  };

  this.getSchemeMatrixSelected = function() {
    return matrixSelected;
  };

  this.getSchemeBgSelected = function () {
    return bgSelected;
  };

  this.getSchemeAlphaSelected = function() {
    return alphaSelected;
  };

};