function DataLoader() {
	
	var that = this;

	/**
	 * Load text file
	 */
	 $("#speed_chart").text("Please wait... data are being loaded. This may take a while.");
	
	this.loadPosData = function(file) {

			var pts = [];		
			var route_type= [];
			var built_up_buffer = [];
			var departure_hour = [];
			var route_short_name = [];
			
			
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
		d3.csv(file, function(error, data) {
		
		var dateminmax ;

		/*set timezone shift. The data are GMT +1 */
		var dt = (new Date()).getTimezoneOffset()*60*1000 +60000;
			data.forEach(function(val, i) {
							
					pts[j++] = parseFloat(val.x);
					pts[j++] = parseFloat(val.y);
									
					departure_hour[i] =  val.departure_hour;																								
					route_type[i] = val.route_type;
					built_up_buffer[i]= val.built_up__buffer;
					if (val.route_type =="0"){
						route_short_name[i] = val.route_short_name;
					} else {
						route_short_name[i] = "99";
					}
					
					//if (typeof(days[i]) == 'undefined' || typeof(hours[i]) == 'undefined' )  {
					//	console.error('error id data');
					//}
				
				});
		
			
			
			visualize({pts: pts, 
				departure_hour: departure_hour, 
				route_type :route_type, 
				built_up_buffer:built_up_buffer, 			
				num : data.length,
				route_short_name : route_short_name
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
