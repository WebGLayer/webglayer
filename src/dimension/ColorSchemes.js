WGL.dimension.ColorSchemes = function(){

  var schemes = {};

    schemes['blue'] = {
   'rgba': [
        171, 3, 208,
        0, 92, 255,
        81, 255, 155
    ],
    'bg': 'light-v9',
        'bg-color': 'light',
    'alpha': [1.0, 0.9, 0.4]
  };

    schemes['red'] = {
    'rgba': [
        255, 134, 0,
        182, 0, 125,
        0, 120, 255
    ],
    'bg': 'light-v9',
        'bg-color': 'light',
    'alpha': [1.0, 0.9, 0.4]
    };

  schemes['fire'] = {
    'rgba': [256, 256, 228,
      253, 154, 41,
      255, 0, 72
    ],
    'bg': 'dark-v9',
      'bg-color': 'dark',
    'alpha': [1.4, 0.9, 0.1]
  };

  schemes['icy'] = {
    'rgba': [256, 256, 256,
      120, 187, 236,
      36, 28, 95
    ],
    'bg': 'dark-v9',
      'bg-color': 'dark',
      'alpha': [1.4, 0.9, 0.2]
  };

  schemes['gamma'] = {
    'rgba': [
      256, 0, 0,
      256, 256, 0,
      0, 256, 0
    ],
    'bg': 'dark-v9',
      'bg-color': 'dark',
      'alpha': [1.4, 0.9, 0.05]
  };

  var schemeSelected = "fire";
  var matrixSelected = schemes[schemeSelected]['rgba'];
  var alphaSelected = schemes[schemeSelected]['alpha'];
  var bgSelected = schemes[schemeSelected]['bg'];
  var bgColorSelected = schemes[schemeSelected]['bg-color'];

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

    this.getSchemeBgColorSelected = function () {
        return bgColorSelected;
    };

  this.getSchemeAlphaSelected = function() {
    return alphaSelected;
  };

};