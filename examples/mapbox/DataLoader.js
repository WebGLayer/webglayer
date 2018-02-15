function DataLoader() {
	this.loadPosData = function(file) {

			let pts = [];
			let days = [];
			let hours = [];
			let date = [];
			let sev = [];
			let road_type = [];
			let speed_limit = [];
			let pts_id = [];
			
			
			let weekday = new Array(7);
			weekday[0]=  "Sun";
			weekday[1] = "Mon";
			weekday[2] = "Tue";
			weekday[3] = "Wed";
			weekday[4] = "Thu";
			weekday[5] = "Fri";
			weekday[6] = "Sat";
			//let weekarray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri","Sat"];
	
		
			let sevEnum = new Array(3);
			sevEnum[0] = "Fatal";
			sevEnum[1] = "Serious";
			sevEnum[2] = "Slight";

			let rtEnum = new Array();
			rtEnum[1] = "Roundabout";
			rtEnum[2] = "One way street";
			rtEnum[3] = "Dual carriageway";
			rtEnum[6] = "Single carriageway";
			rtEnum[7] = "Slip road";
			rtEnum[9] = "Unknown";
			rtEnum[12] = "One way street/Slip road";
			rtEnum[-1] = "Data missing or out of range";
			
			rtDom = new Array();
			let i = 0;
			for(let key in rtEnum) {
 			   rtDom[i] = rtEnum[key];
 			   i++;
			}
			rtDom[8] = "No data";
				
		let j = 0;
		/**
		 * load data
		 */
		d3.csv(file, function(error, data) {
		
		let dateminmax ;

			data.forEach(function(val, i) {
							
					pts[j++] = parseFloat(val.x);
					pts[j++] = parseFloat(val.y);
									
					let d =  (new Date(val.timestamp*1000));
					//index[i] = rasterer.calc(i);	
					days[i] =  weekday[d.getDay()]; //d.getDay();		
										
					
					hours[i] = d.getHours() + d.getMinutes()/60;		
					date[i] = Math.round(d.getTime()/(1000*60*60));						
					dateminmax = getMinMax(date[i], dateminmax);
					
					sev[i] = sevEnum[val.accident_severity-1];
					road_type[i] = rtEnum[val.road_type];
					speed_limit[i] = val.speed_limit;
					pts_id[i] = i;
					
					if (typeof(days[i]) == 'undefined' || typeof(hours[i]) == 'undefined' || typeof(sev[i]) == 'undefined')  {
						console.error('error id data');
					}
				
				});
		
			console.log(pts_id);
			
			visualize({pts: pts, 
				days: days, 
				hours :hours, 
				sev : sev, 
				road_type: road_type, 
				speed_limit: speed_limit,
				date:date, 
				dmm :dateminmax , 
				num : data.length,
				daysarray: weekday,
				sevEnum:  sevEnum,
				rtDom: rtDom,
				pts_id:pts_id,
        rtEnum: rtEnum});
			});
	};

  /**
   *
   * @param {number} val
   * @param {Object} minmax
   * @param {number} minmax.min
   * @param {number} minmax.max
   * @returns {Object}
   */
	function getMinMax(val, minmax){
		if (typeof(minmax)=='undefined'){
			minmax = [];
			minmax.min = Number.MAX_VALUE;
			minmax.max = Number.MIN_VALUE;
		}
		if (val < minmax.min) {minmax.min = val}
		if (val > minmax.max) {minmax.max = val}
		return minmax;
		
	}
	
}
