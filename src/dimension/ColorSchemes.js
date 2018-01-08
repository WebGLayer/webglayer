WGL.dimension.ColorSchemes = function(){

  var schemes = {};

  schemes['blue'] = {
    'rgba': [8, 28, 90,
      46, 182, 194,
      237, 248, 177
    ],
    'bg': 'light'
  };

  schemes['red'] = {
    'rgba': [223, 49, 31,
      169, 136, 228,
      23, 97, 154
    ],
    'bg': 'light'
  };

  schemes['fire'] = {
    'rgba': [256, 256, 228,
      253, 154, 41,
      102, 38, 5
    ],
    'bg': 'dark'
  };

  schemes['icy'] = {
    'rgba': [256, 256, 256,
      120, 187, 236,
      36, 28, 95
    ],
    'bg': 'dark'
  };

  var schemeSelected = "blue";
  var bgSelected = "light";
  var matrixSelected = schemes[schemeSelected]['rgba'];

  this.setSchemeSelected = function(s) {
    schemeSelected = s;
    matrixSelected = schemes[schemeSelected]['rgba'];
    bgSelected = schemes[schemeSelected]['bg'];
  };

  this.getSchemeSelected = function() {
    return schemeSelected;
  };

  this.setCustomMatrixSelected = function(m) {
    schemeSelected = 'custom';
    matrixSelected = m;
    bgSelected = 'dark';
  };

  this.getSchemeMatrixSelected = function() {
    return matrixSelected;
  };

  this.getSchemeBgSelected = function () {
    return bgSelected;
  }

};