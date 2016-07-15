function DataLoader() {
	
	var that = this;

	/**
	 * Load text file
	 */
	 $("#speed_chart").text("Please wait... data are being loaded. This may take a while.");
	
	this.loadPosData = function(file) {

			var pts = [];
			var subject = [];
			var name = [];
			var percent = [];
			var sex = [];
			var sch_type = [];
			
			
			var weekday = new Array(7);
			weekday[0]=  "Sun";
			weekday[1] = "Mon";
			weekday[2] = "Tue";
			weekday[3] = "Wed";
			weekday[4] = "Thu";
			weekday[5] = "Fri";
			weekday[6] = "Sat";
			//var weekarray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri","Sat"];
	
		
			var sevEnum = new Array(3);
			sevEnum[0] = "Fatal";
			sevEnum[1] = "Serious";
			sevEnum[2] = "Slight";

			var rtEnum = new Array();
			rtEnum[1] = "Roundabout";
			rtEnum[2] = "One way street";
			rtEnum[3] = "Dual carriageway";
			rtEnum[6] = "Single carriageway";
			rtEnum[7] = "Slip road";
			rtEnum[9] = "Unknown";
			rtEnum[12] = "One way street/Slip road";
			rtEnum[-1] = "Data missing or out of range";
			
			rtDom = new Array();
			var i = 0;
			for(var key in rtEnum) {
 			   rtDom[i] = rtEnum[key];
 			   i++;
			}
			rtDom[8] = "No data";
				
		var j = 0;				
		/**
		 * load data
		 */
		d3.csv(file, function(error, data) {
		
		var dateminmax ;

			data.forEach(function(val, i) {
							
					pts[j++] = parseFloat(val.x);
					pts[j++] = parseFloat(val.y);
									
					sex[i] = val.sex;
					subject[i] = val.subject;
					percent[i] = val.precent;
					sch_type[i] = val.sch_type;
				
				});
		
			
			
			visualize({pts: pts, 
				sex: sex,
				daysarray: weekday,
				sevEnum:  sevEnum,
				percent: percent,
				sch_type: sch_type,
				rtDom: rtDom,
				subject: subject,
				num: data.length});
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
