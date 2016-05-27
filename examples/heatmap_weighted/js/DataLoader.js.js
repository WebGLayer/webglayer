function DataLoader() {
	
	var that = this;

	/**
	 * Load text file
	 */
	 $("#speed_chart").text("Please wait... data are being loaded. This may take a while.");
	
	this.loadPosData = function(file) {

			var pts    = [];
			var values = [];
		
								
		
			var j = 0;		
		/**
		 * load data
		 */
		d3.csv(file, function(error, data) {
		
		var dateminmax ;

		/*set timezone shift. The data are GMT +1 */
		var dt = (new Date()).getTimezoneOffset()*60*1000 +60000;
			data.forEach(function(val, i) {
							
					pts[j++] = parseFloat(val.x);
					pts[j++] = parseFloat(val.y);
					values[i] = parseFloat(val.v);			
				
					
					
				
				});
		
			
			
			visualize({pts: pts, 
				val:values,
				num : data.length
				});
			});
	}
	
	
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
