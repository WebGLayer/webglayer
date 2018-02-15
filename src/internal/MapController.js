WGL.internal.MapController = function() {

  var manager =  WGL.getManager();
  this.layers = [];

  this.matrix;
  this.width;
  this.height;
  this.offset;


  this.resize = function(){
    if (manager.canvasOnlyOnMap){
      manager.canvas.setAttribute("width", manager.w);
      manager.canvas.setAttribute("height", manager.h);
    }
    else{
      manager.canvas.setAttribute("width", manager.body_width);
      manager.canvas.setAttribute("height", manager.body_height);
    }
    this.width = manager.w;
    this.height =  manager.h;

    this.initMatrix();

    this.updateMatrix();
    WGL.updateSizeOfMapDimensions();

  }
  this.initMatrix = function(){
    this.matrix = new Float32Array([ 2 / this.width, 0, 0, 0, 0, -2 / this.height, 0, 0,
                          0, 0, 0, 0, -1, 1, 0, 1 ]);
    this.matrix.name="mapMatrix";


    this.matrix.name="mapMatrix";
  }
  this.zoommove = function(zoom, offset, func){

    manager.zoom = zoom;
    this.offset = offset;

    this.initMatrix();
    // Scale to current zoom (worldCoords * 2^zoom)
    var scale = Math.pow(2, zoom);
    scaleMatrix(this.matrix, scale, scale);


    // translate to current view (vector from topLeft to 0,0)
    translateMatrix(this.matrix, -offset.x, -offset.y);


    //console.log(offset.x * scale);
    manager.setMapMatrix(this.matrix);
    //WGL.filterutils.updateSizeOfMapDimensions();
    //func();
    WGL.filterByExt();


    //func();
    //manager.wgl.render();
    //manager.wgl.updateCharts();

    function scaleMatrix(matrix, scaleX, scaleY) {
      // scaling x and y, which is just scaling first two columns of matrix
      matrix[0] *= scaleX;
      matrix[5] *= scaleY;

    }

    function translateMatrix(matrix, tx, ty) {
      // translation is in last column of matrix
      matrix[12] += matrix[0] * tx ;
      matrix[13] += matrix[5] * ty;
    }

  }


  this.updateMatrix = function(){
    manager.width=this.width;
    manager.height=this.height;
    manager.setMapMatrix(this.matrix);
  }
}