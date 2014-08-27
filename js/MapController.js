var MapController = function() {
	
	this.layers = [];
	
	var matrix;
	var width;
	var height;
	
	this.resize = function(w, h){
		canvas.setAttribute("width", w);
		canvas.setAttribute("height", h);
		width = w;
		height = h;

		matrix = new Float32Array([ 2 / w, 0, 0, 0, 0, -2 / h, 0, 0,
		                			0, 0, 0, 0, -1, 1, 0, 1 ]);
			
		this.updateLayers();
	}
	
	this.zoommove = function(zoom, offset){		

		// Scale to current zoom (worldCoords * 2^zoom)
		var scale = Math.pow(2, zoom);
		scaleMatrix(matrix, scale, scale);

		// translate to current view (vector from topLeft to 0,0)
		translateMatrix(matrix, -offset.x, -offset.y);			

		this.updateLayers();
		
		
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
	
	this.updateLayers = function(){		
		for (i = 0; i < this.layers.length; i++) {
			this.layers[i].width=width;
			this.layers[i].height=height;
			this.layers[i].matrix=matrix;	
		}
	}
}