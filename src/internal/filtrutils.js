WGL.getDimension = function(name){
    return this._dimensions[name];
  }

WGL.updateSizeOfMapDimensions = function() {

  var dimensions = this._dimensions;
  for ( var i in dimensions) {
    var d = dimensions[i];
    if (typeof (d.createMapFramebuffer) != 'undefined') {
      d.createMapFramebuffer();
    }
    if (typeof (d.filters) != 'undefined') {
      for ( var i in d.filters) {
        if (typeof (d.filters[i].createMapFramebuffer) != 'undefined') {
          d.filters[i].createMapFramebuffer();
        }
      }

    }

  }
};
WGL.getNumberOfActiveFilters = function() {
  var dimensions = this._dimensions;
  var num = 0;
  for ( var i in dimensions) {
    // if (typeof(d.filter)!='undefined')
    for ( var f in dimensions[i].filters) {
      var f = dimensions[i].filters[f];

      {
        if (f.isActive) {
          // console.log("active filter on dim "+d.name+" "+num);
          f.index = num;
          if (dimensions[i].isSpatial) {
            manager.spIndex = num;
          }
          num++;
        } else {
          if (dimensions[i].isSpatial) {
            manager.spIndex = -1.; // index for nonspatial filter
          }
        }
      }
    }
  }
  return num;
}

WGL.filterByExt = function() {
  var dimensions = this._dimensions;
  var mainFilter = this._mainFilter;
  // console.log("filter by ext triggerd");
  // this.render();
  // dimensions['heatmap'].render(numrec);
  /** update spatial filer */

  var needfilter = false;
  for ( var i in dimensions) {

    if (dimensions[i].isSpatial) {
      for ( var j in dimensions[i].filters) {
        var f = dimensions[i].filters[j];
        if (f.isActive) {
          // dimensions['heatmap'].render(numrec);
          f.updateFilter();
          needfilter = true;
          // f.createFilteringData();
          // f.renderFilter();
          // this.filterDim(i,j,f.saved_filter, false);
          // mainFilter.applyFilterDim(dimensions[i],j);
        }
      }
      if (needfilter) {
        WGL.setFiltersTrasholds()
        mainFilter.applyFilterAll(dimensions);
        mainFilter.thisfilter = undefined;
      }
      ;
    }
  }
  // logFilterStatus();
  if (typeof (extf) != 'undefined') {
    extf.render();
    // thisfilter = undefined;
  }

  this.render();
  // this.updateLegends();

}

WGL.render = function() {
  var dimensions = this._dimensions;
  var manager = this.getManager();

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, manager.w, manager.h);
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // renderr();
  // mainFilter.readPixelsAll();
  // logFilterStatus();
  for ( var i in dimensions) {
    dimensions[i].render(manager.num_rec);
  }
  ;
  this.updateCharts();
  // this.updateLegends();

  // console.log("render");

}

WGL.filterDim = function(id, filterId, filter, dorendering){
  var dimensions = this._dimensions;
  var mainFilter = this._mainFilter;


  var f = dimensions[id].filters[filterId];

  if  ( filter.length==0){
    //console.log("filter deleted");
    this.filterDeleted(id, filterId);
    mainFilter.thisfilter = undefined;
    //call all update function
    WGL._updatefuc.forEach(function (f) {
      f();
    });
    return;

  } else if ( filter.length>0 && (filterId!=mainFilter.thisfilter || typeof(mainFilter.thisfilter)=='undefined' )){
    //console.log('filter changed');
    //thatfilter = thisfilter;
    mainFilter.thisfilter =  filterId;
    this.filterChanged(id, mainFilter.thisfilter);
  }



  f.createFilteringData(filter);
  f.renderFilter();
  //f.readPixels();

  //logFilterStatus();
  mainFilter.applyFilterDim(dimensions[id],filterId);
  //console.log("filtering...:"+filter);

  if (dorendering==undefined || dorendering==true){
    this.render();
    this.updateCharts();
    // call all update function
    WGL._updatefuc.forEach(function (f) {
      f();
    })
  }

  /** geting top k elemnts*/
  /* var sel = mainFilter.readPixels();
  var top = []
  console.log(sel.length);
  if(sel.length <500){
    for (var i = 0; i <10 ;i++ )
      top.push(data.hours[sel[i]]);
  }
  console.log(top);*/
}

WGL.filterChanged = function(id, newf){
  var dimensions = this._dimensions;
  var mainFilter = this._mainFilter;
  /*apply all filters and set current to empty to select all the features*/

  //logFilterStatus();
  //manager.filternum = getNumberOfActiveFilters();
  dimensions[id].filters[newf].isActive=true;
  this.setFiltersTrasholds();
  //getFiltersTrasholds();
  /*render with this filter not active*/
  dimensions[id].filters[newf].isActive=false;


  mainFilter.applyFilterAll(dimensions);


  mainFilter.switchTextures();
  dimensions[id].filters[newf].isActive=true;


  if (typeof(extf)!='undefined'){
    extf.render();
  }


  //setFiltersTrasholds();
}

WGL.filterDeleted = function(id, newf){
  var dimensions = this._dimensions;
  var mainFilter = this._mainFilter;
  dimensions[id].filters[newf].isActive=false;
  //manager.filternum = getNumberOfActiveFilters();
  this.setFiltersTrasholds();

  //logFilterStatus();
  mainFilter.applyFilterAll(dimensions);

  if (typeof(extf)!='undefined'){
    extf.render();
  }

  //this.filterByExt();
  this.render();
  this.updateCharts();
  //mainFilter.switchTextures();
}

WGL.setFiltersTrasholds = function(){
  var dimensions = this._dimensions;
  var manager = this.getManager();
  var  trasholds = {allsum: 0.0, spatsum: 0.0};
  var  num = 0;
  for (var i in dimensions){
    //if (typeof(d.filter)!='undefined')
    for (var f in dimensions[i].filters){
      var f =dimensions[i].filters[f];
      {
      if (f.isActive) {
        //console.log("active filter on dim "+d.name+" "+num);
        f.index = num;
        trasholds.allsum = trasholds.allsum + Math.pow(2,num);
        if (dimensions[i].isSpatial){
          trasholds.spatsum = trasholds.spatsum + Math.pow(2,num);
          manager.spIndex = num;
        }
        num++;
      }
        else {
          if (dimensions[i].isSpatial){
          manager.spIndex = -1.; // index for nonspatial filter
        }
      }
    }
  }
  }
  //console.log("trasholds "+trasholds.allsum);
  this.getManager().trasholds = trasholds;
  //return trasholds;
};
/**
 * Select value or add to selection
 * @param dim_id dimension ID
 * @param filter_id filter ID
 * @param value value for filtering (one value from domain list)
 * @param add if true value will be added to selection else will be selected only value
 */
WGL.exactFilterDim = function (dim_id, filter_id, value, add) {
  add = add || false;
  var filters = [];

  var dim = this._dimensions[dim_id];//.filters[filter_id].actual_filtres
  if (add){
    filters = dim.filters[filter_id].actual_filtres
  }
  var index = -1;
  var dom = dim.getDomain();
  for (var i = 0; i < dom.length; i++){
    var v = dom[i];
    if (v == value){
      index = i;
    }
  }
  if (index < 0){
    throw "Value '"+value+"' does not exist!";
  }
  else {
    filters.push([index, index + 1]);
    WGL.filterDim(dim_id, filter_id, filters);
  }
};
