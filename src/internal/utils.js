WGL.utils = {
  /**
   * calculates the value to max pixels between -1 -1;
   */
  normaliseByMax : function(value, max_all, this_min, this_max, this_num) {
    /* reduced value to 0-1 */
    // var c = value/ this_max;
    var s = (2/max_all) * ((this_max-this_min) / this_num);
    //var c_size = (this_max-this_min) / (this_num);
    //var v = (value / c_size) / max_all * 2 - 1;mainFilter.
    var v = s * (value - this_min) - 1 ;
    return v;
    // return 0.5;
  },

  array2TANormOrdinal : function(m) {
    var pts_ar = new Float32Array(m.data.length);
    var i = 0;
    m.num_bins = m.domain.length;
    m.min = 0.;
    m.max = m.num_bins;
    for (var i in m.data) {

      var bin = m.domain.indexOf(m.data[i]);
        if (bin == -1){
          console.warn('data out of range ' +(m.data[i]));
          val = -1;
        } else {
          val =  (bin+0.5) / m.num_bins ;
        }

      pts_ar[i] = val;
      //pts[i] = null;
    }
    return pts_ar;
  },

  array2TANormLinear : function(m, max_bins) {
    var pts_ar = new Float32Array(m.data.length);
    var i = 0;
    for (var i in m.data) {
      if (isNaN(m.data[i])) {
        val = 0.//-99999.
        }
      else {
        val =  ( (m.data[i] - m.min) / (m.max - m.min) ) *  m.num_bins /max_bins ;//+  (1 /(2*max_bins)) ;
      }
      pts_ar[i] = val;
      //pts[i] = null;
    }
    return pts_ar;
  },


  array2TANorm : function(m, max_bins) {
    var pts_ar = new Float32Array(m.data.length);
    var i = 0;
    for (var i in m.data) {
      if (isNaN(m.data[i])) {
        val = 0.//-99999.
        }
      else {
        val =  ( (m.data[i] - m.min) / (m.max - m.min) ) *  m.num_bins /max_bins ;//+  (1 /(3*max_bins)) ;
      }
      pts_ar[i] = val;
      //pts[i] = null;
    }
    return pts_ar;
  },

  array2TA2D : function(pts) {

    var pts_ar = new Float32Array(pts.length * 2);
    var i = 0;
    var j = 0;
    for (var i = 0; i < pts.length; i++) {
      pts_ar[j++] = pts[i][0];
      pts_ar[j++] = pts[i][1];
      //pts[i] = null;
    }

    return pts_ar;
  },

  array2TA : function(pts) {
    var pts_ar = new Float32Array(pts.length);
    var i = 0;
    for (var i = 0; i < pts.length; i++) {
      pts_ar[i] = pts[i];
      //pts[i] = null;
    }
    return pts_ar;
  },


  /* converts lines to array renderable as triangles*/
  array2TALines : function(lines) {

    this.getLength = function(a,b){
      return Math.sqrt(Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y,2))	;
    }

    this.getAngleCos = function(a,b){
      var numerator   = (a.x*b.x + a.y*b.y);
      var denominator = Math.sqrt(a.x*a.x + a.y*a.y) * Math.sqrt(b.x*b.x + b.y*b.y);

      return denominator / numerator   	;
    }
    //pts_ar = new Float32Array(pts.length);
    //var trLines = [];

    /*count the points*/
    var point_num = 0;
    for (var i = 1; i < lines.length; i++) {
      point_num = lines[i].length + point_num;
    }

    var pts_ar = new Float32Array(point_num * 4);
    var normals_ar = new Float32Array(point_num *4 );
    var linenormals_ar = new Float32Array(point_num *4 );
    var miter_ar =  new Float32Array(  point_num*2);
    var indicies=[];

    var m = 0;
    var p = 0;
    var k = 0;
    var edge_num = 0;
    for (var i = 1; i < lines.length; i++) {
      var theline = lines[i];
      /*calculate normals*/
      var normals = [];
      var miter=[];
      var linenormals = [];

      edge_num = edge_num + theline.length-1;
      for (var j = 0; j < theline.length; j++){
        if (j == 0){
          /*first point*/
          var a = theline[j];
          var b = theline[j+1];
          var l = this.getLength(a,b);
          normals[j] = [];
          normals[j].y = -(a.x-b.x) / l;
          normals[j].x = (a.y-b.y) / l;
          miter[j] = 1.;

        }

        else if ( j== (theline.length-1)){
          /*last point*/
          var a = theline[j-1];
          var b = theline[j];
          var l = this.getLength(a,b);
          normals[j] = [];
          normals[j].y = -(a.x-b.x) / l;
          normals[j].x = (a.y-b.y) / l;
          miter[j] = 1.;

        } else {

          var a = theline[j-1];
          var b = theline[j];
          var c = theline[j+1];
          var lab = this.getLength(a,b);
          var lac = this.getLength(b,c);
          // first normalized vector
          var v_ab_x = (a.x-b.x) / lab;
          var v_ab_y = (a.y-b.y) / lab;
          // second normalized vector
          var v_bc_x = (b.x-c.x) / lac;
          var v_bc_y = (b.y-c.y) / lac;


          var res_x =  v_ab_x + v_bc_x;
          var res_y =  v_ab_y + v_bc_y;

          var lres  = this.getLength({x:0,y:0}, {x:res_x, y:res_y});
          var angle =  this.getAngleCos({x: v_ab_x,y: v_ab_y}, {x:res_x, y:res_y});
          if (angle< 1.2) {
          miter[j] = angle;
          } else {
            miter[j] = 1.2;
          }

          normals[j] = [];
          normals[j].y = - (res_x / lres) // /angle;
          normals[j].x =   (res_y / lres) // /angle;
        }
      }

      /*order to triangles*/

      for (var j = 0; j < theline.length; j++){
        var a = theline[j];
        var n_a = normals[j];
        var m_a = miter[j];


        pts_ar[m++] = a.x;
        pts_ar[m++] = a.y;
        normals_ar[p++] = n_a.x;
        normals_ar[p++] = n_a.y;


          miter_ar[k++]= m_a;



        pts_ar[m++] = a.x;
        pts_ar[m++] = a.y;
        normals_ar[p++] = -n_a.x;
        normals_ar[p++] = -n_a.y;

          miter_ar[k++]= -m_a;


        var ii = m /2-2;
        if (j <theline.length-1){
          indicies.push(ii, ii+1,ii+2 , ii+1, ii+2, ii+3);
        }

      }
    }

    return {pts:pts_ar , norm: normals_ar, miters: miter_ar, indicies:new Uint16Array(indicies), num: indicies.length};
  },



  Rasterer : function(max){
      this.size = Math.ceil(Math.sqrt(max));
      this.calc = function(value) {
        var y = Math.floor(value / this.size);
        var x = value - (this.size * y);
        return [ normalise(x, this.size), normalise(y, this.size) ];
        }
      var normalise =  function(value, max) {
        return value / max * 2 - 1 + (2 / (max * 2));
      }
  },

  rgbaToMatrix: function(m) {

    var alpha = WGL.colorSchemes.getSchemeAlphaSelected();
    var matrix = new Float32Array(16);

    matrix[0] = m[0]/256;
    matrix[1] = m[1]/256;
    matrix[2] = m[2]/256;
    matrix[3] = alpha[0];

    matrix[4] = m[3]/256;
    matrix[5] = m[4]/256;
    matrix[6] = m[5]/256;
    matrix[7] = alpha[1];

    matrix[8] = m[6]/256;
    matrix[9] = m[7]/256;
    matrix[10] = m[8]/256;
    matrix[11] = alpha[2];

    matrix[12] = 0;
    matrix[13] = 0;
    matrix[14] = 0;
    matrix[15] = 1;

    return matrix;
  }

};