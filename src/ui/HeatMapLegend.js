WGL.ui.HeatMapLegend = function(div_id, filterId, useBrush) {
  if (useBrush === undefined){
    useBrush = false;
  }

  var manager = WGL.getManager();
  var GLU = WGL.internal.GLUtils;

  var w = 250;
  var h = 100;
  var margin = {
    top : 20,
    right : 0,
    bottom : 0,
    left : 0
  };
  //var lockscale = false;
  var filterVal = [];
  var width = w - margin.left - margin.right;
  var height = h - margin.top - margin.bottom;

  var xScale = d3.scale.linear().domain([ 0, 200]).range(
    [ 0, width ]);

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");

  /*var yScaleSel = d3.scale.linear().domain([ 0, 200]).range(
    [ height, 0 ]);

  var yAxisSel = d3.svg.axis()
    .scale(yScaleSel)
    .orient("right").tickFormat(d3.format("s"));*/


  var limitByMax = true;
  var heatDimension;

  this.setDimension = function(dim){
    //console.log("setDimension not imeplemented!");
    heatDimension = dim;
  }

  this.drawWithoutFilter = function(){
    svg.select("#grad_b").attr("fill", "url(#legend_gradient)");
  }

  var selectionMax = 0;
  this.drawWithFilter = function(m){
    selectionMax = m;
    svg.select("#grad_b").attr("fill", "url(#legend_blue_gradient)");
  }

  svg = d3.select("#" + div_id)
    .append("svg")
    .attr("height", h)
    .attr("style", "position: absolute; right: 1em; top: 2.5em;")
    .append("g").attr(
      "transform",
      "translate(" + margin.left + "," + margin.bottom + ")")

  /** Adding axis**/

  svg.append("g")
    .attr("class", "x axis all")
    .call(xAxis)
    .attr("y", -100)
    .attr("dy", ".171em")
    .attr("transform", "translate(50,30)")

    /*.append("text")
    .attr("x", -38)
    .attr("dy", ".71em")
    .style("text-anchor", "end");

  /*svg.append("g")
    .attr("class", "y axis sel")
    .call(yAxisSel)
    .attr("transform",
      "translate(60,0)")*/


  //this.circleLabel = d3.select("#" + div_id).append("label").style({bottom: "170px", position: "absolute", left: "120px" })
  //.text("Kernel:")

  //this.circle = svg.append("circle");

  //this.circle.attr("cx", 100)
  // .attr("cy", 10)
  // .attr("stroke", "black")
  //  .attr("stroke-width","1")
  // .attr("fill","white")
  //  .attr("r", 20);



//	d3.select("#" + div_id).append("label").style({bottom: "5px", position: "absolute", left: "5px" })
//	.text("lock scale")
//	.append("input")
//	.attr("type","checkbox")
//	.attr("id","scale")
//	.on("click", function(d,i){
//		// lockscale = this.checked;
//		 heatDimension.lockScale = this.checked;
//		});

  var rgbaMatrix = WGL.colorSchemes.getSchemeMatrixSelected();

  var colors = [
    {offset: "0%", color:"rgba(" + rgbaMatrix[6] + ", " + rgbaMatrix[7] + ", " + rgbaMatrix[8] + ", 0.3)"},
    {offset: "50%", color:"rgba(" + rgbaMatrix[3] + ", " + rgbaMatrix[4] + ", " + rgbaMatrix[5] + ", 0.6)"},
    {offset: "100%", color:"rgba(" + rgbaMatrix[0] + ", " + rgbaMatrix[1] + ", " + rgbaMatrix[2] + ", 1)"}
  ];

  var bg_rectangle = (WGL.colorSchemes.getSchemeBgSelected() == 'dark' ? 'black' : 'white');

  /*Adding gradients*/

  svg.append("defs").append("linearGradient")
    .attr("id", "legend_gradient")
    .selectAll("stop")
    .data(colors)
    .enter().append("stop")
    .attr("offset", function(d) { return d.offset; })
    .attr("stop-color", function(d) { return d.color; });

  svg.append("defs").append("linearGradient")
    .attr("id", "legend_blue_gradient")
    .selectAll("stop")
    .data([
      {offset: "0%", color:"rgba(59, 130, 189,1)"},
      {offset: "50%", color: "rgba(158, 202,225,0.6)"},
      {offset: "100%", color: "rgba(222, 235,247,0.3)"}
    ])
    .enter().append("stop")
    .attr("offset", function(d) { return d.offset; })
    .attr("stop-color", function(d) { return d.color; });

  /*addig color rectangeles*/
  svg.append("rect").attr("fill", bg_rectangle)
    .attr("id", "grad_bacground")
    .attr("x", 50)
    .attr("y", 0  )
    .attr("width", width)
    .attr("height", 30);

  svg.append("rect").attr("fill", "url(#legend_blue_gradient)")
    .attr("id","grad_b")
    .attr("x", 50)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", 30);

  /*svg.append("rect").attr("fill", bg_rectangle)
     .attr("class", "grad")
     .attr("x", 30)
     .attr("y", 0)
     .attr("width", 30)
     .attr("height", 0);

  svg.append("rect").attr("fill", "url(#legend_gradient)")
    .attr("class","grad")
    .attr("x", 30)
    .attr("y", 0)
    .attr("width", 30)
    .attr("height", 0);*/


  /*var brushed = function(){
    filterVal = brush.extent();
    if (parseFloat(yScale.domain()[1]) <=  parseFloat(brush.extent()[1])){
      //f[1] =9999999;
      limitByMax= false;
      console.log("setting to maximum.");
    } else {
      limitByMax= true;
    }
    doBrush(brush.extent())
  }

  var doBrush = function(f){


    //console.log(parseFloat(yScale.domain()[1]-100))+ " vs "+  parseFloat(yScale(brush.extent()[1]));
    // var f = brush.extent();

    svg.selectAll(".grad")
      .attr("y",  yScale(f[1]))
      .attr("height", yScale(f[0]) - yScale(f[1]) );


    if (f.length == 2 && f[0]==f[1]){
      //pass the filter parameter to the dimension to render to colors properly
      f=[];
      heatDimension.setFilter(undefined);
    } else {
      filterVal = f;
      heatDimension.setFilter(f);
    }

    WGL.filterDim(heatDimension.id,filterId,f);

  }


  this.reset = function(){
    brush.clear();
    brushed.call();

  }



  var brush = d3.svg.brush()
    .y(yScale)
    .on("brush", brushed);

  console.log(useBrush);
  if (useBrush){
    svg.append("g").attr("class", "brush").call(brush)
      .selectAll("rect").attr("width", 60);
  }

  */

  this.reset = function() {
    
  };

  this.updateMaxAll = function(max){
    var filter =  filterVal ;

    xScale.domain([0, max]);

    svg.selectAll('.x.axis.all')
      .call(xAxis);
    if (filter[0]!=filter[1]){
      this.update(filter);
    } else {
      this.update([0,0]);
    }


  };


  /*this.updateMaxMinAll = function(min,max){
    var filter =  filterVal ;

    yScale.domain([min, max]);

    svg.selectAll('.y.axis.all')
      .call(yAxis);
    if (filter[0]!=filter[1]){
      this.update(filter);
    } else {
      this.update([0,0]);
    }


  }

  this.showSelection = function(){
    svg.selectAll(".grad")
      .attr("y",  0)
      .attr("height", yScale(f[0]) - yScale(f[1]) );
  }
*/


  this.update = function(filter){
    filterVal = filter;
    //if (!lockscale){
    var min =  filterVal [0];
    var max =  filterVal [1];
    //this.updateMax(m+ m*0.2);

    var x =  xScale(max);
    var h =  xScale(min) - xScale(max);
    svg.selectAll(".grad")
      .attr("x",  x)
      .attr("width", w );
    svg.selectAll(".extent")
      .attr("x",  x)
      .attr("width", w );

    svg.selectAll('.x.axis.sel').attr("transform",
      "translate(60,"+x+")");

    //yScaleSel.domain([0,selectionMax]).range([h, 0 ]);

    /*yAxisSel.ticks(h/15);
    svg.selectAll('.y.axis.sel')
      .call(yAxisSel);
    */

    if (!limitByMax){
      //doBrush([min,m]);
    }
    //}

  }

}