

function init() {
  initMap();
  var data = new DataLoader();
  //	data.loadPosData("data/all13.json");
  //	data.loadPosData("data/all13a14.json");
  //	data.loadPosData("data/xybirm5a.json");
  data.loadPosData("data/data.json");
  //	data.loadPosData("data/xyall5a300k.json");
  //	data.loadPosData("data/xyall5atest.json");
  //	data.loadPosData("data/xyall5a400k.json");
  //    data.loadPosData("data/test.json");
  //	data.loadPosData("data/acc600k.json");



}

function visualize(data){

  //wgl = new WGL(data.num,'http://localhost:9999/js/webglayer/','map');
  WGL.init(data.num,'../../','map', 'OpenLayers_Map_2_OpenLayers_Container');
  window.onresize = function(){
    WGL.resize();
  }

  map.events.register("move", map, onMove);
  /*var heatmap2= WGL.addHeatMapDimension(data.pts, 'heatmap2');
   heatmap2.radiusFunction = function(r, z){
   var res = r/40000 * Math.pow(2,z);
   //console.log(res);
   var gpsize = map.getGeodesicPixelSize();
   var pixelsize = (gpsize.h+gpsize.w)/2;
   return  res ;
   };

   heatmap2.renderer.colors.set([  1, 1, 1, 1.2,
   1, 1,1, 0.5,
   0, 0, 0, 0.0,
   0, 0, 0, 1 ]);

   heatmap2.setRadius(60);
   heatmap2.gradFunction = function() {
   return 1;
   }*/
  var controlHM = new WGL.ChartDiv("right","chm", "Heat map controls");
  var heatmap = WGL.addHeatMapDimension(data.pts, 'heatmap');
  heatmap.radiusFunction = function(r, z){
    var res = r/20000 * Math.pow(2,z);
    //console.log(res);
    var gpsize = map.getGeodesicPixelSize();
    var pixelsize = (gpsize.h+gpsize.w)/2;
    return  res ;
  };

  heatmap.setRadius(30);

  var mapdim = WGL.addMapDimension(data.pts, 'themap');

  WGL.addPolyBrushFilter('themap','polybrush');

  addHeatMapControl(heatmap,'chm');

  WGL.addExtentFilter();

  /*for ordinal dimension from 1-3 use range 0.5-3.5*/

  var charts = [];

  /* DAYS*/
  var days = {data: data.days,  domain: data.daysarray,  name: 'days', type:'ordinal', label: "day of the week"};
  var chd1 = new WGL.ChartDiv("right","ch1", "Day of the week");
  chd1.setDim(WGL.addOrdinalHistDimension(days));
  WGL.addLinearFilter(days,7, 'daysF');
  charts['days'] = new  WGL.ui.StackedBarChart(days, "ch1", "day of the week", 'daysF');

  /* MONTHS */
  var months = {data: data.months,  domain: data.monthsArray,  name: 'months', type:'ordinal', label: "month of the year"};
  var chd5 = new WGL.ChartDiv("right","ch5", "Month of the Year");
  chd5.setDim(WGL.addOrdinalHistDimension(months));
  WGL.addLinearFilter(months,12, 'monthsF');
  var paramsMonths = {
    w: 500,
    h: 340,
    margin: {
      top: 20,
      right: 20,
      bottom: 155,
      left: 60
    },
    rotate_x: true
  };
  charts['months'] = new  WGL.ui.StackedBarChart(months, "ch5", "month of the year", 'monthsF', paramsMonths);



  var hours = {data: data.hours,  min:0, max:24, num_bins: 24*5, name: 'hours',type:'linear', label :"hour of the day"} ;
  var chd2 = new WGL.ChartDiv("right","ch2", "Hour of the day");
  chd2.setDim(WGL.addLinearHistDimension(hours));
  WGL.addLinearFilter(hours, 24*10, 'hoursF');
  charts['hours'] = new  WGL.ui.StackedBarChart(hours, "ch2", "hour of the day", 'hoursF');

    var district   = {data: data.district,  domain: data.districtEnum ,  name: 'district', type:'ordinal', label : "crime district"};
  var chd3 = new WGL.ChartDiv("right","ch3", "Districts");
  chd3.setDim(WGL.addOrdinalHistDimension(district));
  WGL.addLinearFilter(district,3, 'districtF');
  var paramsDistrict = {
    w: 500,
    h: 340,
    margin: {
      top: 20,
      right: 20,
      bottom: 155,
      left: 60
    },
    rotate_x: true
  };
  charts['district']   = new  WGL.ui.StackedBarChart(district, "ch3", "crime district",'districtF', paramsDistrict);


  var primary_type   = {data: data.primary_type,  domain: data.primaryTypeEnum ,  name: 'primary type', type:'ordinal', label : "crime primary type"};
  var chd4 = new WGL.ChartDiv("right","ch4", "Primary Type");
  chd4.setDim(WGL.addOrdinalHistDimension(primary_type));
  WGL.addLinearFilter(primary_type,3, 'primaryTypeF');
  var paramsPType = {
    w: 500,
    h: 400,
    margin: {
      top: 20,
      right: 20,
      bottom: 215,
      left: 60
    },
    rotate_x: true
  };
  charts['primary type'] = new  WGL.ui.StackedBarChart(primary_type, "ch4", "primary type",'primaryTypeF', paramsPType);


  /*COMMUNITY AREA*/
  var community_area   = {data: data.community_area,  domain: data.communityAreaEnum,  name: 'community area', type:'ordinal', label : "community area"};
  var chd7 = new WGL.ChartDiv("right","ch7", "Community Areas");
  chd7.setDim(WGL.addOrdinalHistDimension(community_area));
  WGL.addLinearFilter(community_area,10 , 'communityAreaF');
  var paramsCA = {
    w: 1000,
    h: 340,
    margin: {
      top: 20,
      right: 20,
      bottom: 155,
      left: 60
    },
    rotate_x: true
  };
  charts['community area'] = new WGL.ui.StackedBarChart(community_area, "ch7", "community area",'communityAreaF', paramsCA);

  var d =[];
  d[0]= hours;
  d[1] = days;

  var pc = WGL.addParallelCoordinates('pc_chart', d);
  WGL.addMultiDim(d);


  WGL.addCharts(charts);

  WGL.initFilters();

  //wgl.render();

  //var radius = 12.;




  $("#slider_pc").on("input", function(){
    //mapdim.render2(this.value);
    pc.reRender(this.value);
  });


  $("#reset").on("click", function(){
    WGL.resetFilters();
    var lonlat = new OpenLayers.LonLat(-1.9,52.5).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
    map.setCenter(lonlat);
    map.zoomTo(11);
  })

  $("#pc_header").click(function(){
    $(".pc_chart_div").slideToggle();
    var l = WGL.getDimension("pc_chart");

    var resize =  function(){
      WGL.getManager().updateMapSize();
      WGL.mcontroller.resize();
      WGL.mcontroller.zoommove(map.getZoom(), getTopLeftTC());
      WGL.render();
    }
    if (l.visible){
      l.setVisible(false);
      $('#map').animate({ 'margin-bottom': '1.5em'},
        {done: resize})
      $('#pc').animate({ 'height': '1.5em'},
        {done: resize})

      $('#butPC').removeClass("fa-chevron-down");
      $('#butPC').addClass("fa-chevron-up");
      setTimeout( function() { map.updateSize();}, 200);
    } else {
      l.setVisible(true);
      $('#map').animate({ 'margin-bottom': '18.5em'},
        {done: resize})
      $('#pc').animate({ 'height': '18.5em'},
        {done: resize})
      $('#butPC').removeClass("fa-chevron-up");
      $('#butPC').addClass("fa-chevron-down");
      setTimeout( function() { map.updateSize();}, 200);
    }
    //WGL.resize();
    //WGL.getManager().updateMapSize();
    //WGL.mcontroller.resize();

  });

  $("#points_visible").click(function(){
    var l = WGL.getDimension(this.name);
    l.setVisible(this.checked);
    WGL.render();
  });
  $("#heatmap_visible").click(function(){
    var l = WGL.getDimension(this.name);
    l.setVisible(this.checked);
    // heatmap.reRender();
    WGL.render();
  });



  $("#schools_visible").click(function(){
    map.getLayersByName('Points')[0].setVisibility(this.checked);
  });

  WGL.mcontroller.zoommove(map.getZoom(), getTopLeftTC());
}


function getTopLeftTC() {

  var tlwgs = (new OpenLayers.LonLat(-180, 90)).transform(
    new OpenLayers.Projection("EPSG:4326"),
    new OpenLayers.Projection("EPSG:900913"));

  var s = Math.pow(2, map.getZoom());
  tlpixel = map.getViewPortPxFromLonLat(tlwgs);
  res = {
    x : -tlpixel.x / s,
    y : -tlpixel.y / s
  }
  //console.log(res);
  return res;
}

function onMove() {
  WGL.mcontroller.zoommove(map.getZoom(), getTopLeftTC(), WGL.filterByExt);
}

function updateLabel(v){
  console.log(v);
}

function addHeatMapControl(hm,divid){


  $("#"+divid).append(
    "<div id="+divid+"left style='top:0em; left:0em; width:40%'></div>"+
    "<div id="+divid+"right style='top:0em; right:0em; width:60%; height:10em; position:absolute'></div>");


  var thediv = $("#"+divid+"right");
  thediv.append(
    "<div style='margin:0.5em'>"+
    "<text>Radius: </text><text id='radius_label'></text>"+
    "<input style='width: 50%; right:1em; position:absolute' type ='range' max='300' min='1'"+
    "step='1' name='points' id='slider_radius' value='30'></input> </div>");


  thediv.append(
    "<div style='margin:0.5em'>"+
    "<text>Get maximum from data:</text>"+
    "<input style='width: 20%; right:0em; position:absolute' type ='checkbox'"+
    " default='true' id='max_checked' checked='true' ></input> </div>");
  thediv.append(
    "<div style='margin:0.5em'>"+
    "<text>Maximum:</text>"+
    "<input style='width: 50%; right:1em; position:absolute' type ='range' max='300' min='1'"+
    "step='1' name='points' id='hm_max' value='10' disabled></input> </div>");






  WGL.addColorFilter(hm.id,'colorbrush');
  var legend = new  WGL.ui.HeatMapLegend(divid+"left", 'colorbrush');
  hm.addLegend(legend);
  WGL.addLegend(legend);

  $("#slider_radius").on("input", function(){

    hm.setRadius(this.value);

    $('#radius_label').html(this.value+"m ");
    //heatmap.reRender();
    WGL.render();
  });

  $("#hm_max").on("input", function(){

    hm.maxVal= this.value;
    //heatmap.reRender();
    WGL.render();
    legend.updateMaxAll(this.value);
  });

  $("#max_checked").on("click", function(d,i){

    hm.lockScale = !this.checked;
    //$("#hm_min").val(100);
    document.getElementById("hm_max").disabled = this.checked;


  });
}
	
	
	