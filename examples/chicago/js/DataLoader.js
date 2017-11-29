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
        var primary_type = [];
        var district = [];
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

        var districtValues = {};

        // Area Central
        districtValues["001"] = "1718 S State St";
        districtValues["002"] = "5101 S Wentworth Ave";
        districtValues["003"] = "7040 S Cottage Grove Ave";
        districtValues["008"] = "3420 W 63rd St";
        districtValues["009"] = "3120 S Halsted St";
        districtValues["010"] = "3315 W Ogden Ave";
        districtValues["012"] = "100 S Racine Ave";
        districtValues["013"] = "937 N Wood St";
        districtValues["018"] = "1158 N Larrabee St";

        // Area South
        districtValues["004"] = "2255 E 103rd St";
        districtValues["005"] = "727 E 111th St";
        districtValues["006"] = "7808 S Halsted St";
        districtValues["007"] = "1400 W 63rd St";
        districtValues["022"] = "1900 W Monterey Ave";

        // Area North
        districtValues["011"] = "3151 W Harrison St";
        districtValues["014"] = "2150 N California Ave";
        districtValues["015"] = "5701 W Madison St";
        districtValues["016"] = "5151 N Milwaukee Ave";
        districtValues["017"] = "4650 N Pulaski Rd";
        districtValues["019"] = "850 W Addison St";
        districtValues["020"] = "5400 N Lincoln Ave";
        districtValues["024"] = "6464 N Clark St";
        districtValues["025"] = "5555 W Grand Ave"

        var districtEnum = [];

        districtEnum[1] = "1718 S State St";
        districtEnum[2] = "5101 S Wentworth Ave";
        districtEnum[3] = "7040 S Cottage Grove Ave";
        districtEnum[8] = "3420 W 63rd St";
        districtEnum[9] = "3120 S Halsted St";
        districtEnum[10] = "3315 W Ogden Ave";
        districtEnum[12] = "100 S Racine Ave";
        districtEnum[13] = "937 N Wood St";
        districtEnum[18] = "1158 N Larrabee St";

        // Area South
        districtEnum[4] = "2255 E 103rd St";
        districtEnum[5] = "727 E 111th St";
        districtEnum[6] = "7808 S Halsted St";
        districtEnum[7] = "1400 W 63rd St";
        districtEnum[22] = "1900 W Monterey Ave";

        // Area North
        districtEnum[11] = "3151 W Harrison St";
        districtEnum[14] = "2150 N California Ave";
        districtEnum[15] = "5701 W Madison St";
        districtEnum[16] = "5151 N Milwaukee Ave";
        districtEnum[17] = "4650 N Pulaski Rd";
        districtEnum[19] = "850 W Addison St";
        districtEnum[20] = "5400 N Lincoln Ave";
        districtEnum[24] = "6464 N Clark St";
        districtEnum[25] = "5555 W Grand Ave"

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

            var dateminmax;

            data.forEach(function (val, i) {

                pts[j++] = parseFloat(val.x);
                pts[j++] = parseFloat(val.y);

                primary_type[i] = val["primary type"];

                district[i] = districtValues[val["district"]];

                var d =  (new Date(val.data));
                days[i] =  weekday[d.getDay()]; //d.getDay();

				hours[i] = d.getHours() + d.getMinutes()/60;
                date[i] = Math.round(d.getTime()/(1000*60*60));
                dateminmax = getMinMax(date[i], dateminmax);

				if (typeof(days[i]) == 'undefined'
                    || typeof(hours[i]) == 'undefined'
                    || typeof(primary_type[i]) == 'undefined'
                    || typeof(district[i]) == 'undefined')  {
				 console.error('error id data');
				 }

            });

            console.log(district);
            console.log(primary_type);

            visualize({
                pts: pts,
                days: days,
				hours: hours,
                primary_type: primary_type,
                district: district,
                districtEnum: districtEnum,
                daysarray: weekday,
                num: data.length
            });

			/*visualize({pts: pts,
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
			 rtDom: rtDom});
			 });*/

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
