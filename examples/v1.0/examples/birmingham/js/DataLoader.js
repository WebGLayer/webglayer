function DataLoader() {
	
	var that = this;

	/**
	 * Load text file
	 */
	 $("#speed_chart").text("Please wait... data are being loaded. This may take a while.");
	
	this.loadPosData = function(file) {

			var pts = [];
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
		d3.csv(file, function(error, data) {
		
		var dateminmax ;

			data.forEach(function(val, i) {
							
					pts[j++] = parseFloat(val.x);
					pts[j++] = parseFloat(val.y);
									
					var d =  (new Date(val.timestamp*1000));																				
					//index[i] = rasterer.calc(i);	
					days[i] =  weekday[d.getDay()]; //d.getDay();		
										
					
					hours[i] = d.getHours() + d.getMinutes()/60;		
					date[i] = Math.round(d.getTime()/(1000*60*60));						
					dateminmax = getMinMax(date[i], dateminmax);
					
					sev[i] = val.accident_severity;
					road_type[i] = val.road_type;
					speed_limit[i] = val.speed_limit;
					
					if (typeof(days[i]) == 'undefined' || typeof(hours[i]) == 'undefined' || typeof(sev[i]) == 'undefined')  {
						console.error('error id data');
					}
				
				});
		
			
			
			visualize({pts: pts, 
				days: days, 
				hours :hours, 
				sev : sev, 
				road_type: road_type, 
				speed_limit: speed_limit,
				date:date, 
				dmm :dateminmax , 
				num : data.length,
				daysarray: weekarray});
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
