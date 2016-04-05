function DataLoader() {
	
	var that = this;

	/**
	 * Load text file
	 */
	 $("#speed_chart").text("Please wait... data are being loaded. This may take a while.");
	
	this.loadPosData = function(file) {

			var lines = [];
			var days = [];
			var hours = [];
			var date = [];
			var sev = [];
			var road_type = [];
			var speed_limit = [];
			
			
			var weekday = new Array(7);
			weekday[0]=  "Sun";
			weekday[1] = "Mon";
			weekday[2] = "Tue";
			weekday[3] = "Wed";
			weekday[4] = "Thu";
			weekday[5] = "Fri";
			weekday[6] = "Sat";
			var weekarray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri","Sat"];
	
		
			var j = 0;		
		/**
		 * load data
		 */
		//d3.csv(file, function(error, data) {
		var d = d3.dsv(";", "text/plain");
		d(file, function(error, data){
		var dateminmax ;

		/*set timezone shift. The data are GMT +1 */
		var dt = (new Date()).getTimezoneOffset()*60*1000 +60000;
			data.forEach(function(val, k) {
							
					var line = val.geom.split(",")
					var numpoints = line.length;					
					lines[k] = [];
					var  i = 0;
						for (var m = 0; m < line.length; m++){
							var p = line[m].split(" ");	
							var point = [];
							point.x = parseFloat(p[0]);
							point.y = parseFloat(p[1]);

							lines[k][m] = point;												    						    	
					}		
					//pts[j++] = parseFloat(val.x);
					//pts[j++] = parseFloat(val.y);
					
				
				});
		
			
			
			visualize({lines: lines, 
				num : lines.length});
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
