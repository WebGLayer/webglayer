/**
 * Build application based on JSON schema
 * @param {String} config_filename  JSON config filename
 * @param {String} shaders_url URL for shaders
 * @param {String} map_div_id div ID for map
 * @param {String} chard_div_id div ID for charts
 * @constructor
 */
WGL.ui.Config = function (config_filename, shaders_url, map_div_id, chard_div_id) {
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri","Sat"];
  const months = ["Jan", "Feb", "Mar","Apr","May","June","July","Aug","Sept","Oct","Nov", "Dec"];
  this.types = ["ordinal", "linear", "day", "hour", "date", "heatmap", "dotmap", "inetify"];

  /**
   *
   * @param timestamp number of second from 1970
   * @return {Date}
   */
  const getDate = function (timestamp) {
    return new Date(parseInt(timestamp)*1000);
  };

  /**
   * Get weeekday form timestamp
   * @param timestamp number of second from 1970
   * @return {string}
   */
  const dateToDay = function (timestamp) {
    return weekday[getDate(timestamp).getDay()];
  };

  /**
   * Return float \in [0, 24)
   * @param timestamp
   * @return {number}
   */
  const dateToHour = function (timestamp) {
    let d = getDate(timestamp);
    return d.getHours() + d.getMinutes()/60;
  };
  /**
   *
   * @param timestamp
   * @return {number}
   */
  const dateToDate = function (timestamp) {
    return Math.round(getDate(timestamp).getTime()/(1000*60*60));
  };
  /**
   * Get month form timestamp
   * @param timestamp
   * @return {string}
   */
  const dateToMonth = function (timestamp) {
    return months[getDate(timestamp).getMonth()];
  };

  const nothing = function (x) {
    return x;
  };

  /**
   * testing function for undefined
   * @param variable
   * @return {boolean}
   */
  const isUndefined = function(variable){
     return (typeof variable === "undefined");
  };

  /**
   * Returns function that transform input string to suitable format based on type of column
   * @param {string} type
   * @return {*}
   */
  let getTransformFunction = function (type) {
    if (type === "day"){
      return dateToDay;
    }
    if (type === "hour"){
      return dateToHour;
    }
    if (type === "month"){
      return dateToMonth;
    }
    if (type === "date"){
      return dateToDate;
    }
    if (type === "ordinal"){
      return nothing;
    }
    if (type === "linear"){
      return parseFloat;
    }
  };

  /**
   * Function is called after the data are loaded
   */
  let afterLoad = function () {};
  /**
   * Set afterLoad property
   * @param f callback function
   */
  this.setAfterLoadFunction = function (f) {
    afterLoad = f;
  };

  /**
   * Build the application
   */
  this.load = function () {

    d3.json(config_filename, function (err, conf) {
      d3.csv(conf.dataFileName, function (errd, data) {
        WGL.init(data.length, shaders_url, map_div_id, true);
        let charts = [];

        let existSpatial = false;
        // for each dimension in config
        conf.dimensions.forEach(function (dim, k) {
          let dim_data = [];

          // all dimensions except spatial dimension
          if (dim.type !== "heatmap" && dim.type !== "dotmap" && dim.type !== "identify"){
            let tf = getTransformFunction(dim.type);
            data.forEach(function (val, i) {
              dim_data[i] = tf(val[dim.column]);
            });

            // for linear
            if (dim.type in {hour: '', date: '', linear: ''}){
              let label = dim.chart.label || "";
              let dim_conf = {data: dim_data,  min: Math.min(...dim_data), max: Math.max(...dim_data), num_bins: dim.numBins,
                name: dim.name, type:'linear', label : label};
              let dimension = WGL.addLinearHistDimension(dim_conf);
              if ("filter" in dim){
                if ("numBins" in dim.filter){
                  WGL.addLinearFilter(dim_conf, dim.filter.numBins, dim.name + "F");
                }
              }
              if ("chart" in dim){
                let chd = new WGL.ChartDiv(chard_div_id,"ch-"+k, dim.name, dim.chart.label, dim.numBins);
                chd.setDim(dimension);
                charts[dim.name] = WGL.createStackBarChart(dim_conf, "ch-"+k, dim.chart.xLabel, dim.name + "F");
              }
            }
            // for ordinal
            else {
              let domain;
              if (isUndefined(dim.domain)){
                domain = dim_data.filter((v, i, a) => a.indexOf(v) === i);
              }
              else{
                domain = dim.domain;
              }
              const label = dim.chart.label || "";
              let dim_conf = {data: dim_data,  domain: domain ,  name: dim.name, type:'ordinal', label : label};
              let dimension = WGL.addOrdinalHistDimension(dim_conf);
              if ("filter" in dim){
                WGL.addLinearFilter(dim_conf, domain.length, dim.name + "F");
              }
              if ("chart" in dim) {
                let chd = new WGL.ChartDiv(chard_div_id, "ch-" + k, dim.name, dim.chart.label, domain.length);
                chd.setDim(dimension);
                charts[dim.name] = WGL.createStackBarChart(dim_conf, "ch-" + k, dim.chart.xLabel, dim.name + "F");
              }
            }


          }
          // spatial dimensions
          else{
            existSpatial = true;
            let j = 0;
            let index = [];
            data.forEach(function (val, i) {
              dim_data[j++] = parseFloat(val[dim.xColumn]);
              dim_data[j++] = parseFloat(val[dim.yColumn]);
              index[i] = i;
            });
            let dimension;
            if (dim.type === "dotmap"){
              dimension = WGL.addMapDimension(dim_data, "dotmap");
              if ("radius" in dim){
                dimension.setRadius(dim.radius);
              }
            }
            else if (dim.type === "heatmap") {
              dimension = WGL.addHeatMapDimension(dim_data, "heatmap");
              if ("radius" in dim){
                dimension.setRadius(dim.radius);
              }
            }
            else if (dim.type === "identify"){
              if ("identifyFileURL" in dim){
                dimension = WGL.addIdentifyDimension(dim_data, index, "identify", dim.identifyFileURL);
                if ("radius" in dim){
                  dimension.pointSize = dim.radius;
                }
              }
              else{
                console.log("please add identifyFileURL properties")
              }
            }
            else{
              console.error("bad type of spatial dimension")
            }


          }
          // after dimension
          WGL.addCharts(charts);
          WGL.initFilters();
          if (existSpatial){
            WGL.addExtentFilter();
          }
        });
        afterLoad();
      })
    })
  }
};