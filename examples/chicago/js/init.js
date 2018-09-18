function init() {
    const data = new DataLoader();
    data.loadPosData("data/data.json");
}

function visualize(data){

    WGL.init(data.num,'../../','map', true);

    map.on("move", onMove);

    window.onresize = onResize;

    const heatmap = WGL.addHeatMapDimension(data.pts, 'heatmap', 4);
    heatmap.radiusFunction = function (r, z) {
        return r*(z/10);
    };
    heatmap.setRadius(1);

    // use normal distribution for values around point
    heatmap.gauss = true;

    const mapdim = WGL.addMapDimension(data.pts, 'themap');
    mapdim.setVisible(false);
    WGL.addPolyBrushFilter('themap','polybrush');

    const layer = {
        "id": "canvas",
        "source": "canvas",
        "type": "raster",
        "paint": { 'raster-fade-duration': 0 }
    };

    const layers = map.getStyle().layers;
    // Find the index of the first symbol layer in the map style
    let firstSymbolId;
    for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
        }
    }
    const map_source = {
        "type": 'canvas',
        "canvas": 'webglayer',
        "coordinates": [
            [-12, 60],
            [2, 60],
            [2, 50],
            [-12, 50]
        ],
        "animate": false
    };
    map.addSource("canvas", map_source);
    map.addLayer(layer, firstSymbolId);

    const updatedraw = () => {
        const features = draw.getAll();
        if (features.features.length > 0){
            let polygons = [];
            features.features.forEach((f)=>{
                if (validity(f)){
                    try{
                        polygons[f.id] = geometryToPoly(f);
                    }
                    catch(e){

                    }
                }
            });
            polygons.length = Object.keys(polygons).length;
            if(polygons.length > 0) {
                $("#chd-container-footer-area").removeClass("hide");
                $(".active-filters-container").slideDown();
            } else {
                return;
            }
            WGL.filterDim('themap','polybrush', polygons);

        }
        else{
            WGL.filterDim('themap', 'polybrush', []);
            $("#chd-container-footer-area").addClass("hide");
        }
    };

    map.on('draw.create', updatedraw);
    map.on('draw.delete', updatedraw);
    map.on('draw.update', updatedraw);
    map.on('draw.render', updatedraw);

    addHeatMapControl(heatmap,'chm');

    WGL.addExtentFilter();

    /!*for ordinal dimension from 1-3 use range 0.5-3.5*!/

    updateIntro(data.start_date, data.end_date, data.num);

    buildCharts(data, "red");

    WGL.initFilters();

    setPointSelection();

    $("#min-about").on("click", function() {
        $("#min-about").toggleClass("btn-plus");
        $($("#about")[0]).slideToggle();

        if($("#about-chevron").text() == "keyboard_arrow_down") {
            $("#about-chevron").text("keyboard_arrow_up");
            $("#right").scrollTop(0);
        } else {
            $("#about-chevron").text("keyboard_arrow_down");
        }
    });

    $(".chart-filters-area i").click(function() {
        draw.deleteAll();
        draw.changeMode(draw.modes.SIMPLE_SELECT);
        if(WGL.getDimension('themap').getVisible()
            && draw.getAll().features.length == 0) {
            const idt = WGL.getDimension('idt');
            idt.setEnabled(true);
        }
        $("#controlsToggle .btn-selected").removeClass("btn-selected");
        WGL.filterDim('themap', 'polybrush', []);
        $("#chd-container-footer-area").addClass("hide");
        if($(".active-filters-container [id^=chd-container-footer]:not(.hide)").length > 0) {
            $(".close-item-filters").removeClass("hide");
            $("#active-filters-placeholder").addClass("hide");
            $(".active-filters-item .bar-item").addClass("bar-item-active");
            $(".active-filters-container").slideDown();
        } else {
            $("#active-filters-placeholder").removeClass("hide");
            $(".close-item-filters").removeClass("hide");
        }
    });
    $(".close-item-btn").click(function() {
        $(this).hide();
        $(this).parent().slideToggle();
        draw.changeMode(draw.modes.SIMPLE_SELECT);
        $(this).parent().parent().find(".bar-item").toggleClass("bar-item-active");
    });
    $(".active-filters-item").click(function() {
        $(".active-filters-container").slideToggle();
        $(".active-filters-container .close-item-btn").show();
        $(this).children(".bar-item").toggleClass("bar-item-active");
    });
    $(".area-item").click(function(){
        $(".controls-container").slideToggle();
        $(".controls-container .close-item-btn").show();
        $(this).children(".bar-item").toggleClass("bar-item-active");
    });
    $(".layers-item").click(function(){
        $(".layers-container").slideToggle();
        $(".layers-container .close-item-btn").show();
        $(this).children(".bar-item").toggleClass("bar-item-active");
    });
    $(".heatmap-item").click(function() {
        $(".heatmap-controls-container").slideToggle();
        $(".heatmap-controls-container .close-item-btn").show();
        $(this).children(".bar-item").toggleClass("bar-item-active");
    });

    $(".charts-item.navbar-item").click(function(){

        $("#right").toggle();
        $(this).toggleClass("active");
        $("#map").toggleClass("fullscreen");
        $(".charts-item .bar-item").toggleClass("bar-item-active");

        onResize();
        map.resize();

        updateChartsVisibility();
    });

    $(".export-pdf").click(toCanvas);

    $(".active-filters-item").mouseover(function(){
        $(this).children(".bar-item").addClass("bar-item-hover");
    });

    $(".area-item").mouseover(function(){
        $(this).children(".bar-item").addClass("bar-item-hover");
    });

    $(".layers-item").mouseover(function(){
        $(this).children(".bar-item").addClass("bar-item-hover");
    });

    $(".heatmap-item").mouseover(function() {
        $(this).children(".bar-item").addClass("bar-item-hover");
    });
    $(".charts-item").mouseover(function() {
        $(this).children(".bar-item").addClass("bar-item-hover");
    });

    $(".active-filters-item").mouseout(function(){
        $(this).children(".bar-item").removeClass("bar-item-hover");
    });
    $(".area-item").mouseout(function(){
        $(this).children(".bar-item").removeClass("bar-item-hover");
    });
    $(".layers-item").mouseout(function(){
        $(this).children(".bar-item").removeClass("bar-item-hover");
    });
    $(".heatmap-item").mouseout(function() {
        $(this).children(".bar-item").removeClass("bar-item-hover");
    });
    $(".charts-item").mouseout(function() {
        $(this).children(".bar-item").removeClass("bar-item-hover");
    });

    WGL.render();

    $("#points_visible").click(function(){
        $(this).toggleClass("layer-selected");
        const selected = $(this).hasClass("layer-selected");
        const l = WGL.getDimension(this.name);
        l.setVisible(selected);
        const idt = WGL.getDimension('idt');
        idt.setEnabled(selected);
        $("#wgl-win-close").click();
        WGL.render();
    });
    $("#heatmap_visible").click(function(){
        $(this).toggleClass("layer-selected");
        const selected = $(this).hasClass("layer-selected");
        const l = WGL.getDimension(this.name);
        l.setVisible(selected);
        WGL.render();
    });
    $(".control-btn").click(function() {
        toggleControl(this);
    });

    $("#loading").addClass("hidden");

    onMove();

    const charts_element = $("#charts");
    charts_element.sortable(
        {
            placeholder: "ui-state-highlight",
            handle: '.chart-header',
            zIndex: 9999,
            helper: 'clone',
            cursor: "move",
            start: function() {
                $(this).find(".chart-header").addClass('grabbing');
            },
            stop: function() {
                $(this).find(".chart-header").removeClass('grabbing');
            },
            update: ( event, ui ) => {

                const idPreviousSibling = $($(ui.item[0]).prev()).attr("id");

                $("#chd-container-"+$($(ui.item[0]).children(".chart-content")[0]).attr("id") +" .chart-content").css("visibility", "visible");

                const element = $("#chd-container-footer-"+$($(ui.item[0]).children(".chart-content")[0]).attr("id")).detach();
                if(typeof idPreviousSibling != "undefined") {
                    $("#chd-container-footer-"+$("#"+idPreviousSibling).children(".chart-content").attr("id")).after(element);
                } else {
                    $("#filters-container").prepend(element);
                }

                updateChartsVisibility();
            }
        }
    );
    charts_element.disableSelection();
    updateChartsVisibility();
    $("#right").on("scroll", () => updateChartsVisibility());
}

function resize(){
    WGL.getManager().updateMapSize();
    WGL.mcontroller.resize();
    WGL.mcontroller.zoommove(map.getZoom(), getTopLeftTC());
    WGL.render();
}

function getTopLeftTC() {
    const ZERO_PIX_3857_COEF = 128/20037508.34;
    const z = map.getZoom() + 1;
    const scale = Math.pow(2, z);
    const dx = WGL.getManager().w/2/scale;
    const dy = WGL.getManager().h/2/scale;

    const TL3857_ZERO = {x: -20037508.34, y: 20037508.34};
    const c = map.getCenter();

    const proj = new SphericalMercator.SphericalMercator();
    const center_3857 = proj.forward([c.lng, c.lat]);

    return {
        x: (center_3857[0] - TL3857_ZERO.x)*ZERO_PIX_3857_COEF - dx,
        y: (-center_3857[1] + TL3857_ZERO.y)*ZERO_PIX_3857_COEF - dy
    };
}

function onMove() {
    const z = map.getZoom() + 1;
    WGL.mcontroller.zoommove(z, getTopLeftTC());
}

function onResize() {
    WGL.getManager().updateMapSize();
    WGL.mcontroller.resize();
    onMove();
}

function updateIntro(start_date, end_date, num) {
    $("#start_date b").html(start_date);
    $("#end_date b").html(end_date);
    $("#no_crimes b").html(num);
}

function buildCharts(data) {

    const charts = [];

    /* DAYS*/
    const days = {data: data.days,  domain: data.daysarray,  name: 'day of the week', type:'ordinal', label: "day of the week"};
    const chd1 = new WGL.ChartDiv("charts","ch1", "day of the week", "Day of the week", 7);
    chd1.setDim(WGL.addOrdinalHistDimension(days));
    WGL.addLinearFilter(days,7, 'daysF');
    const paramsDays = {
        w: 500,
        h: 300,
        margin: {
            top: 30,
            right: 70,
            bottom: 80,
            left: 60
        },
        rotate_x: true
    };
    charts['day of the week'] = new  WGL.ui.StackedBarChart(days, "ch1", "Day of the week", 'daysF', paramsDays);
    new WGL.FilterListChartDiv("filters-container", charts['day of the week'], "Day of the Week", 7);


    /* MONTHS */
    const months = {data: data.months,  domain: data.monthsArray,  name: 'month of the year', type:'ordinal', label: "month of the year"};
    const chd5 = new WGL.ChartDiv("charts","ch5", "month of the year", "Month of the Year", 3);
    chd5.setDim(WGL.addOrdinalHistDimension(months));
    WGL.addLinearFilter(months,3, 'monthsF');
    const paramsMonths = {
        w: 500,
        h: 300,
        margin: {
            top: 40,
            right: 70,
            bottom: 80,
            left: 60
        },
        rotate_x: true
    };
    charts['month of the year'] = new  WGL.ui.StackedBarChart(months, "ch5", "Month of the year", 'monthsF', paramsMonths);
    new WGL.FilterListChartDiv("filters-container", charts['month of the year'], "Month of the year", 3);

    /*HOURS*/
    const hours = {data: data.hours,  domain: data.hoursEnum, name: 'hour of the day', type:'ordinal', label :"hour of the day"} ;
    const chd2 = new WGL.ChartDiv("charts","ch2", "hour of the day", "Hour of the day", 24);
    chd2.setDim(WGL.addOrdinalHistDimension(hours));
    WGL.addLinearFilter(hours, 24, 'hoursF');
    charts['hour of the day'] = new  WGL.ui.StackedBarChart(hours, "ch2", "hour of the day", 'hoursF');
    new WGL.FilterListChartDiv("filters-container", charts['hour of the day'], "Hour of the Day", 24);

    /* DISTRICTS */
    const district   = {data: data.district,  domain: data.districtEnum ,  name: 'districts', type:'ordinal', label : "crime district"};
    const chd3 = new WGL.ChartDiv("charts","ch3", "districts", "Districts", 22);
    chd3.setDim(WGL.addOrdinalHistDimension(district));
    WGL.addLinearFilter(district,22, 'districtF');
    const paramsDistrict = {
        w: 500,
        h: 340,
        margin: {
            top: 20,
            right: 70,
            bottom: 130,
            left: 60
        },
        rotate_x: true
    };
    charts['districts']   = new  WGL.ui.StackedBarChart(district, "ch3", "Districts",'districtF', paramsDistrict);
    new WGL.FilterListChartDiv("filters-container", charts['districts'], "Districts", 22);

    /* CRIME PRIMARY TYPE */
    const primary_type   = {data: data.primary_type,  domain: data.primaryTypeEnum ,  name: 'primary type', type:'ordinal', label : "crime primary type"};
    const chd4 = new WGL.ChartDiv("charts","ch4", "primary type", "Primary Type", 35);
    chd4.setDim(WGL.addOrdinalHistDimension(primary_type));
    WGL.addLinearFilter(primary_type,35, 'primaryTypeF');
    const paramsPType = {
        w: 500,
        h: 400,
        margin: {
            top: 20,
            right: 70,
            bottom: 160,
            left: 60
        },
        rotate_x: true
    };
    charts['primary type'] = new  WGL.ui.StackedBarChart(primary_type, "ch4", "Primary Type",'primaryTypeF', paramsPType);
    new WGL.FilterListChartDiv("filters-container", charts['primary type'], "Primary Type", 35);

    /* ARRESTS */
    const arrest = {data: data.arrest,  domain: data.arrestEnum,  name: 'arrest', type:'ordinal', label : "arrest"};
    const chd8 = new WGL.ChartDiv("charts","ch8", "arrest", "Arrest", 2);
    chd8.setDim(WGL.addOrdinalHistDimension(arrest));
    WGL.addLinearFilter(arrest,2,'arrestF');
    const paramsArrest = {
        margin: {
            top: 40,
            right: 70,
            bottom: 40,
            left: 60
        },
        rotate_x: false
    };
    charts['arrest'] = new WGL.ui.StackedBarChart(arrest, "ch8", "Arrest",'arrestF', paramsArrest);
    new WGL.FilterListChartDiv("filters-container", charts['arrest'], "Arrest", 2);

    /* DOMESTIC CRIMES */
    const domestic = {data: data.domestic,  domain: data.domesticEnum, name: 'domestic', type:'ordinal', label : "domestic"};
    const chd9 = new WGL.ChartDiv("charts","ch9", "domestic", "Domestic", 2);
    chd9.setDim(WGL.addOrdinalHistDimension(domestic));
    WGL.addLinearFilter(domestic,2,'domesticF');
    const paramsDomestic = {
        margin: {
            top: 40,
            right: 70,
            bottom: 40,
            left: 60
        },
        rotate_x: false
    };
    charts['domestic'] = new WGL.ui.StackedBarChart(domestic, "ch9", "Domestic",'domesticF', paramsDomestic);
    new WGL.FilterListChartDiv("filters-container", charts['domestic'], "Domestic", 2);

    //identify pop-up window
    const idt = WGL.addIdentifyDimension(data.pts, data.pts_id, 'idt', "data/identify/");
    idt.onlySelected = false;
    idt.pointSize = 15;
    idt.setEnabled($("#points_visible").hasClass("layer-selected"));

    WGL.addCharts(charts);
}

function setPointSelection() {

    const formatDate = d3.time.format("%Y-%m-%d %H:%M:%S");

    // point selection
    const pw = new WGL.ui.PopupWin(".mapboxgl-canvas", "idt", "Crime Details");
    pw.setProp2html(function (t) {

        const weekarray = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday"];

        const districtValues = {};

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
        districtValues["025"] = "5555 W Grand Ave";

        const d = formatDate.parse(t["date"]);
        const wd =  weekarray[d.getDay()];
        const hour =  ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
        const district = districtValues[t["district"]];
        const primary_type = t["primary_type"];
        const arrest = ( t["arrest"] == "true" ? "ARRESTED" : "NOT ARRESTED" );
        const domestic = ( t["domestic"] == "true" ? "DOMESTIC" : "NOT DOMESTIC" );

        let s = "<table>";
        s += "<tr><td width='140px'>Date: </td><td>"+d.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})+"</td></tr>";
        s += "<tr><td>Weekday: </td><td>"+wd+"</td></tr>";
        s += "<tr><td>Time: </td><td>"+hour+"</td></tr>";
        s += "<tr><td>District: </td><td>"+district+"</td></tr>";
        s += "<tr><td>Primary Type: </td><td style='text-transform: capitalize'>"+primary_type.toLowerCase()+"</td></tr>";
        s += "<tr><td>Arrested: </td><td style='text-transform: capitalize'>"+arrest.toLowerCase()+"</td></tr>";
        s += "<tr><td>Domestic: </td><td style='text-transform: capitalize'>"+domestic.toLowerCase()+"</td></tr>";

        return s;
    });
    pw.setMovemap(function (dx, dy) {
        let c = map.getCenter();
        const cpx = map.project(c);
        cpx.x -= dx;
        cpx.y -= dy;
        map.setCenter(map.unproject(cpx));
    });
    map.on("move", function () {
        pw.zoommove(map.getZoom()+1, getTopLeftTC());
    });
}

function addHeatMapControl(hm,divid){

    const thediv = $("#"+divid);
    thediv.append(
        "<div class='hm-label'>"+
        "<text style='display: table-cell'>Radius </br><span style='font-size: 8pt'>(metres)</span></text><text id='radius_label'></text>"+
        '<div class="range-control">' +
        '<input id="slider_radius" type="range" min="0.1" max="10" step="0.3" value="1" data-thumbwidth="20">' +
        '<output name="rangeVal" for="points" style="left: calc(9.699% - -8px)">1</output>' +
        '</div>' +
        "</div>");
    thediv.append(
        "<div class='hm-label'>"+
        "<text display='table-cell; vertical-align: middle'>Density </br><span style='font-size: 8pt'>of records within</br>the radius</span></text><text id='radius_label'></text>"+
        "<div id='heatmap-legend' style='display: table-cell; vertical-align: middle; float: right'></div>"+
        "</div>"
    );

    WGL.addColorFilter(hm.id,'colorbrush');
    const legend = new  WGL.ui.HeatMapLegend("heatmap-legend", 'colorbrush', true);
    hm.addLegend(legend);

    $("#slider_radius").on("input", function(){

        hm.setRadius(this.value);

        const control = $(this),
            controlMin = control.attr('min'),
            controlMax = control.attr('max'),
            controlVal = control.val(),
            controlThumbWidth = control.data('thumbwidth');

        const range = controlMax - controlMin;

        const position = ((controlVal - controlMin) / range) * 100;
        const positionOffset = Math.round(controlThumbWidth * position / 100) - (controlThumbWidth / 2);
        const output = control.next('output');

        output
            .css('left', 'calc(' + position + '% - ' + positionOffset + 'px)')
            .text(controlVal);

        WGL.render();
    });

    $(".color-scheme-btn").click((evt) => {
        toggleColorScheme(evt.target.closest(".color-scheme-btn"));
        $("#heatmap-legend").empty();
        const legend = new  WGL.ui.HeatMapLegend("heatmap-legend", 'colorbrush', true);
        hm.addLegend(legend);
        WGL.render();
    });
}

function updateChartsVisibility() {
    let dimension_element;
    for(let dimension in WGL._dimensions) {
        dimension_element = WGL._dimensions[dimension];
        if(dimension_element instanceof WGL.dimension.HistDimension) {
            let element = $("[data-name='"+dimension+"']");

            if(dimension_element.visible && !visibleY(element[0])) {
                dimension_element.setVisible(false);
            }

            if(!dimension_element.visible && visibleY(element[0])) {
                dimension_element.setVisible(true);
                WGL.render();
            }
        }
    }
}

function wgsToZeroLevel(pos){
    const proj = new SphericalMercator.SphericalMercator();
    const point = proj.forward(pos);
    const x = (point[0] + 20037508.34) / (20037508.34*2)*256;
    const y = -(point[1] - 20037508.34) / (20037508.34*2)*256;
    return {x: x, y: y}
}

function geometryToPoly(feature) {
    const geom = feature.geometry.coordinates[0];

    let poly_zero = [];
    for(let i = 0;i < geom.length-1; i++){
        poly_zero.push(wgsToZeroLevel(geom[i]));
    }
    // triangulate
    const ts = new poly2tri.SweepContext(poly_zero);
    ts.triangulate();
    return trianglesToArray(ts.getTriangles());
}

function trianglesToArray(trig) {
    let points = [];
    for ( let i in trig) {
        for ( let j in trig[i].points_) {
            points.push(trig[i].points_[j].x);
            points.push(trig[i].points_[j].y);
        }
    }
    return points;
}

function validity(feature){
    if (feature.geometry.coordinates.length === 0){
        return false;
    }
    const geom = feature.geometry.coordinates[0];
    if (geom.length > 3){
        for(let i = 1;i < geom.length-1; i++){
            if (geom[i][0] === geom[i-1][0] && geom[i][1] === geom[i-1][1]){
                return false;
            }
        }
        return true
    }
    return false;
}