function DataLoader() {
	
	var that = this;

	/**
	 * Load text file
	 */
	 $("#speed_chart").text("Please wait... data are being loaded. This may take a while.");
	
	this.loadPosData = function(file) {

			var pts = [];
			var ndvi_2016 = [];
			var ndvi_20161 = [];
			
			
			
		
				
		var j = 0;				
		/**
		 * load data
		 */
		d3.csv(file, function(error, data) {
		
		var dateminmax ;

			data.forEach(function(val, i) {
							
					pts[j++] = parseFloat(val.x);
					pts[j++] = parseFloat(val.y);
												
					ndvi_2016[i]  = val.ndvi_2016_;	
					ndvi_20161[i] = val.ndvi_20161;	
				
				});
		
			
			
			visualize({pts: pts, 
				ndvi_2016  : ndvi_2016, 
				ndvi_20161 : ndvi_20161,
				num : data.length
			});			
		});
	};
	
	
	function getMinMax(val, minmax){
		if (typeof(minmax)=='undefined'){
			minmax = [];
			minmax.min = Number.MAX_VALUE;
			minmax.max = Number.MIN_VALUE;
		}
		if (val < minmax.min) {minmax.min = val};
		if (val > minmax.max) {minmax.max = val};
		return minmax;
		
	}
	
}
