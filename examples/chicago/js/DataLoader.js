function DataLoader() {

    var that = this;

    /**
     * Load text file
     */
    $("#speed_chart").text("Please wait... data are being loaded. This may take a while.");

    $("#records_loaded, #wgl, #OpenLayers_Control_Attribution_7")
        .removeClass("text_map_light")
        .removeClass("text_map_dark")
        .addClass("text_map_"+mapColor);

    this.loadPosData = function(file) {

        var pts = [];
        var days = [];
        var hours = [];
        var hours_full = [];
        var months =[];
        var date = [];
        var primary_type = [];
        var district = [];
        var description = [];
        var arrest = [];
        var domestic = [];
        var pts_id = [];

        var hoursArray = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
        var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday"];
        var weekEnum = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday", "Sunday"];
        var monthsArray = ['October', 'November', 'December'];

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

        districtEnum[0] = "1718 S State St";
        districtEnum[1] = "5101 S Wentworth Ave";
        districtEnum[2] = "7040 S Cottage Grove Ave";
        districtEnum[7] = "3420 W 63rd St";
        districtEnum[8] = "3120 S Halsted St";
        districtEnum[9] = "3315 W Ogden Ave";
        districtEnum[11] = "100 S Racine Ave";
        districtEnum[16] = "1158 N Larrabee St";

        // Area South
        districtEnum[3] = "2255 E 103rd St";
        districtEnum[4] = "727 E 111th St";
        districtEnum[5] = "7808 S Halsted St";
        districtEnum[6] = "1400 W 63rd St";
        districtEnum[19] = "1900 W Monterey Ave";

        // Area North
        districtEnum[10] = "3151 W Harrison St";
        districtEnum[12] = "2150 N California Ave";
        districtEnum[13] = "5701 W Madison St";
        districtEnum[14] = "5151 N Milwaukee Ave";
        districtEnum[15] = "4650 N Pulaski Rd";
        districtEnum[17] = "850 W Addison St";
        districtEnum[18] = "5400 N Lincoln Ave";
        districtEnum[20] = "6464 N Clark St";
        districtEnum[21] = "5555 W Grand Ave";

        var primaryTypeEnum = [
            'prostitution',
            'other offense',
            'theft',
            'liquor law violation',
            'non-criminal',
            'burglary',
            'public peace violation',
            'ritualism',
            'homicide',
            'battery',
            'arson',
            'narcotics',
            'gambling',
            'offense involving children',
            'human trafficking',
            'motor vehicle theft',
            'assault',
            'intimidation',
            'public indecency',
            'concealed carry license violation',
            'weapons violation',
            'robbery',
            'kidnapping',
            'interference with public officer',
            'non-criminal (subject specified)',
            'crim sexual assault',
            'criminal trespass',
            'non - criminal',
            'domestic violence',
            'criminal damage',
            'sex offense',
            'stalking',
            'other narcotic violation',
            'deceptive practice',
            'obscenity'
        ];

        var arrestEnum = ["Arrested", "Not Arrested"];
        var domesticEnum = ["Domestic", "Not Domestic"];

        var j = 0;

        var formatDate = d3.time.format("%Y-%m-%d %H:%M:%S");

        /**
         * load data
         */
        d3.csv(file, function(error, data) {

            var dateminmax;

            data.forEach(function (val, i) {

                pts[j++] = parseFloat(val.x);
                pts[j++] = parseFloat(val.y);

                primary_type[i] = val["primary_type"].toLowerCase();
                arrest[i] = ( val["arrest"] == "true" ? "Arrested" : "Not Arrested" );
                domestic[i] = ( val["domestic"] == "true" ? "Domestic" : "Not Domestic" );
                district[i] = districtValues[val["district"]];

                var d = formatDate.parse(val["date"]);
                days[i] =  weekday[d.getDay()];

                months[i] = monthsArray[d.getMonth() - 9];

                hours[i] = d.getHours();
                hours_full[i] = d.getHours() + d.getMinutes()/60;
                date[i] = Math.round(d.getTime()/(1000*60*60));
                dateminmax = getMinMax(date[i], dateminmax);
                pts_id[i] = i;


                if (typeof(days[i]) == 'undefined'
                    || typeof(hours[i]) == 'undefined'
                    || typeof(primary_type[i]) == 'undefined'
                    || typeof(district[i]) == 'undefined')  {
                    console.error('error id data');
                }

            });

            district.filter(function(n){ return typeof n != "undefined" });

            var start_date = new Date(data[0]['date']).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});
            var end_date = new Date(data[data.length-1]['date']).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});

            visualize({
                pts: pts,
                days: days,
                hours: hours,
                hours_full: hours_full,
                hoursEnum: hoursArray,
                months: months,
                primary_type: primary_type,
                primaryTypeEnum: primaryTypeEnum,
                arrest: arrest,
                arrestEnum: arrestEnum,
                domestic: domestic,
                domesticEnum: domesticEnum,
                district: district,
                description: description,
                districtEnum: districtEnum,
                daysarray: weekEnum,
                monthsArray: monthsArray,
                num: data.length,
                start_date: start_date,
                end_date: end_date,
                pts_id:pts_id
            });
        }).on("progress", function() {
            if (d3.event.lengthComputable) {
                var percentComplete = Math.round(d3.event.loaded * 100 / d3.event.total);
                $(".progress-inner").css("width", percentComplete + "%");
                $("#records_loaded b").html(numberWithSpaces(d3.event.target.responseText.split("\n").length));
            }
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
