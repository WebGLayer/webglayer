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
        var months =[];
        var date = [];
        var primary_type = [];
        var district = [];
        var description = [];
        var community_area = [];
        var location_description = [];

        var weekday = new Array(7);
        weekday[0]=  "Sun";
        weekday[1] = "Mon";
        weekday[2] = "Tue";
        weekday[3] = "Wed";
        weekday[4] = "Thu";
        weekday[5] = "Fri";
        weekday[6] = "Sat";
        //var weekarray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri","Sat"];


        var monthsArray = new Array(12);
        monthsArray[0] = 'January';
        monthsArray[1] = 'February';
        monthsArray[2] = 'March';
        monthsArray[3] = 'April';
        monthsArray[4] = 'May';
        monthsArray[5] = 'June';
        monthsArray[6] = 'July';
        monthsArray[7] = 'August';
        monthsArray[8] = 'September';
        monthsArray[9] = 'October';
        monthsArray[10] = 'November';
        monthsArray[11] = 'December';

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

        var communityAreaEnum = [];

        communityAreaEnum[0] = "Not Reported";
        communityAreaEnum[1] = "Rogers Park";
        communityAreaEnum[2] = "West Ridge";
        communityAreaEnum[3] = "Uptown";
        communityAreaEnum[4] = "Lincoln Square";
        communityAreaEnum[5] = "North Center";
        communityAreaEnum[6] = "Lake View";
        communityAreaEnum[7] = "Lincoln Park";
        communityAreaEnum[8] = "Near North Side";
        communityAreaEnum[9] = "Edison Park";
        communityAreaEnum[10] = "Norwood Park";
        communityAreaEnum[11] = "Jefferson Park";
        communityAreaEnum[12] = "Forest Glen";
        communityAreaEnum[13] = "North Park";
        communityAreaEnum[14] = "Albany Park";
        communityAreaEnum[15] = "Portage Park";
        communityAreaEnum[16] = "Irving Park";
        communityAreaEnum[17] = "Dunning";
        communityAreaEnum[18] = "Montclare";
        communityAreaEnum[19] = "Belmont Cragin";
        communityAreaEnum[20] = "Hermosa";
        communityAreaEnum[21] = "Avondale";
        communityAreaEnum[22] = "Logan Square";
        communityAreaEnum[23] = "Humboldt Park";
        communityAreaEnum[24] = "West Town";
        communityAreaEnum[25] = "Austin";
        communityAreaEnum[26] = "West Garfield Park";
        communityAreaEnum[27] = "East Garfield Park";
        communityAreaEnum[28] = "Near West Side";
        communityAreaEnum[29] = "North Lawndale";
        communityAreaEnum[30] = "South Lawndale";
        communityAreaEnum[31] = "Lower West Side";
        communityAreaEnum[32] = "Loop";
        communityAreaEnum[33] = "Near South Side";
        communityAreaEnum[34] = "Armour Square";
        communityAreaEnum[35] = "Douglas";
        communityAreaEnum[36] = "Oakland";
        communityAreaEnum[37] = "Fuller Park";
        communityAreaEnum[38] = "Grand Boulevard";
        communityAreaEnum[39] = "Kenwood";
        communityAreaEnum[40] = "Washington Park";
        communityAreaEnum[41] = "Hyde Park";
        communityAreaEnum[42] = "Woodlawn";
        communityAreaEnum[43] = "South Shore";
        communityAreaEnum[44] = "Chatham";
        communityAreaEnum[45] = "Avalon Park";
        communityAreaEnum[46] = "South Chicago";
        communityAreaEnum[47] = "Burnside";
        communityAreaEnum[48] = "Calumet Heights";
        communityAreaEnum[49] = "Roseland";
        communityAreaEnum[50] = "Pullman";
        communityAreaEnum[51] = "South Deering";
        communityAreaEnum[52] = "East Side";
        communityAreaEnum[53] = "West Pullman";
        communityAreaEnum[54] = "Riverdale";
        communityAreaEnum[55] = "Hegewisch";
        communityAreaEnum[56] = "Garfield Ridge";
        communityAreaEnum[57] = "Archer Heights";
        communityAreaEnum[58] = "Brighton Park";
        communityAreaEnum[59] = "McKinley Park";
        communityAreaEnum[60] = "Bridgeport";
        communityAreaEnum[61] = "New City";
        communityAreaEnum[62] = "West Elsdon";
        communityAreaEnum[63] = "Gage Park";
        communityAreaEnum[64] = "Clearing";
        communityAreaEnum[65] = "West Lawn";
        communityAreaEnum[66] = "Chicago Lawn";
        communityAreaEnum[67] = "West Englewood";
        communityAreaEnum[68] = "Englewood";
        communityAreaEnum[69] = "Greater Grand Crossing";
        communityAreaEnum[70] = "Ashburn";
        communityAreaEnum[71] = "Auburn Gresham";
        communityAreaEnum[72] = "Beverly";
        communityAreaEnum[73] = "Washington Heights";
        communityAreaEnum[74] = "Mount Greenwood";
        communityAreaEnum[75] = "Morgan Park";
        communityAreaEnum[76] = "O'Hare";
        communityAreaEnum[77] = "Edgewater";

        var primaryTypeEnum = [
            'PROSTITUTION',
            'OTHER OFFENSE',
            'THEFT',
            'LIQUOR LAW VIOLATION',
            'NON-CRIMINAL',
            'BURGLARY',
            'PUBLIC PEACE VIOLATION',
            'RITUALISM',
            'HOMICIDE',
            'BATTERY',
            'ARSON',
            'NARCOTICS',
            'GAMBLING',
            'OFFENSE INVOLVING CHILDREN',
            'HUMAN TRAFFICKING',
            'MOTOR VEHICLE THEFT',
            'ASSAULT',
            'INTIMIDATION',
            'PUBLIC INDECENCY',
            'CONCEALED CARRY LICENSE VIOLATION',
            'WEAPONS VIOLATION',
            'ROBBERY',
            'KIDNAPPING',
            'INTERFERENCE WITH PUBLIC OFFICER',
            'NON-CRIMINAL (SUBJECT SPECIFIED)',
            'CRIM SEXUAL ASSAULT',
            'CRIMINAL TRESPASS',
            'NON - CRIMINAL',
            'DOMESTIC VIOLENCE',
            'CRIMINAL DAMAGE',
            'SEX OFFENSE',
            'STALKING',
            'OTHER NARCOTIC VIOLATION',
            'DECEPTIVE PRACTICE',
            'OBSCENITY'
        ];

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

                primary_type[i] = val["primary_type"];

                description[i] = val["description"];
                location_description[i] = val["location_description"];

                district[i] = districtValues[val["district"]];
                community_area[i] = communityAreaEnum[val["community_area"]];

                var d =  (new Date(val["date"]));
                days[i] =  weekday[d.getDay()]; //d.getDay();

                months[i] = monthsArray[d.getMonth()];

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

            visualize({
                pts: pts,
                days: days,
                hours: hours,
                months: months,
                primary_type: primary_type,
                primaryTypeEnum: primaryTypeEnum,
                community_area: community_area,
                communityAreaEnum: communityAreaEnum,
                district: district,
                description: description,
                location_description: location_description,
                districtEnum: districtEnum,
                daysarray: weekday,
                monthsArray: monthsArray,
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
