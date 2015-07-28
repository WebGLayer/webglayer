var MapController = function(manager) {
	this.manager = manager;
	this.layers = [];
	
	this.matrix;
	this.width;
	this.height;
	
	
	this.resize = function(w, h){
		manager.canvas.setAttribute("width", w);
		manager.canvas.setAttribute("height", h);
		this.width = w;
		this.height = h;
		
		this.initMatrix();
			
		this.updateMatrix();
	}
	this.initMatrix = function(){
		this.matrix = new Float32Array([ 2 / this.width, 0, 0, 0, 0, -2 / this.height, 0, 0,
		                			0, 0, 0, 0, -1, 1, 0, 1 ]);
		this.matrix.name="mapMatrix";
		
	
		this.matrix.name="mapMatrix";
	}
	this.zoommove = function(zoom, offset, render_func){		
		manager.zoom = zoom;
		this.initMatrix();
		// Scale to current zoom (worldCoords * 2^zoom)
		var scale = Math.pow(2, zoom);
		scaleMatrix(this.matrix, scale, scale);

		// translate to current view (vector from topLeft to 0,0)
		translateMatrix(this.matrix, -offset.x, -offset.y);			

		this.updateMatrix();
		
		render_func();
		
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