WGL.ui.HeatMapLegend = function(div_id, filterId, useBrush, colorScheme) {
  if (useBrush === undefined){
    useBrush = true;
  }

  var manager = WGL.getManager();
  var GLU = WGL.internal.GLUtils;

  var w = 190;
  var h = 200;
  var margin = {
    top : 10,
    right : 0,
    bottom : 10,
    left : 45
  };
  //var lockscale = false;
  var filterVal = [];
  var width = w - margin.left - margin.right;
  var height = h - margin.top - margin.bottom;

  var yScale = d3.scale.linear().domain([ 0, 200]).range(
    [ height, 0 ]);

  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left").tickFormat(d3.format("s"));

  var yScaleSel = d3.scale.linear().domain([ 0, 200]).range(
    [ height, 0 ]);

  var yAxisSel = d3.svg.axis()
    .scale(yScaleSel)
    .orient("right").tickFormat(d3.format("s"));


  var limitByMax = true;
  var heatDimension;

  var colors = {};
  colors["blue"] = [
    {offset: "0%", color: "rgba(8, 29, 88,0.6)"},
    {offset: "50%", color: "rgba(65, 182, 196,0.8)"},
    {offset: "100%", color: "rgba(255, 255, 217,1)"}
  ];
  colors["red"] = [
    {offset: "0%", color: "rgba(226, 48, 30,0.6)"},
    {offset: "50%", color: "rgba(169, 136, 227,0.8)"},
    {offset: "100%", color: "rgba(23, 97, 153,1)"}
  ];
  colors["fire"] = [
    {offset: "0%", color: "rgba(255, 255, 229,0.6)"},
    {offset: "50%", color: "rgba(254, 153, 41,0.8)"},
    {offset: "100%", color: "rgba(102, 37, 6,1)"}
  ];
  colors["icy"] = [
    {offset: "0%", color: "rgba(255, 255, 255,0.6)"},
    {offset: "50%", color: "rgba(121, 187, 235,0.8)"},
    {offset: "100%", color: "rgba(42, 27, 94,1)"}
  ];

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

  svg = d3.select("#" + div_id).append("svg")
    .attr("width",  w)
    .attr("height", h)
    .append("g").attr(
      "transform",
      "translate(" + margin.left + "," + margin.top + ")");

  /** Adding axis**/

  svg.append("g")
    .attr("class", "y axis all")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -38)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Density of records within the radius "); //Magnitude-per-area within the radius

  svg.append("g")
    .attr("class", "y axis sel")
    .call(yAxisSel)
    .attr("transform",
      "translate(60,0)")


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



  /*Adding gradients*/

  svg.append("defs").append("linearGradient")
    .attr("id", "legend_gradient")
    .attr("x1","0%")
    .attr("y1","0%")
    .attr("x2","0%")
    .attr("y2","100%")
    .selectAll("stop")
    .data(colors[colorScheme])
    .enter().append("stop")
    .attr("offset", function(d) { return d.offset; })
    .attr("stop-color", function(d) { return d.color; });

  svg.append("defs").append("linearGradient")
    .attr("id", "legend_blue_gradient")
    .attr("x1","0%")
    .attr("y1","0%")
    .attr("x2","0%")
    .attr("y2","100%")
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
  svg.append("rect").attr("fill", "black")
    .attr("id","grad_bacground")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 30)
    .attr("height", height);

  svg.append("rect").attr("fill", "url(#legend_blue_gradient)")
    .attr("id","grad_b")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 30)
    .attr("height", height);

  svg.append("rect").attr("fill", "black")
    .attr("class","grad")
    .attr("x", 30)
    .attr("y", 0)
    .attr("width", 30)
    .attr("height", 0);

  svg.append("rect").attr("fill", "url(#legend_gradient)")
    .attr("class","grad")
    .attr("x", 30)
    .attr("y", 0)
    .attr("width", 30)
    .attr("height", 0);


  var brushed = function(){
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
      /*pass the filter parameter to the dimension to render to colors properly*/
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

  this.updateMaxAll = function(max){
    var filter =  filterVal ;

    yScale.domain([0, max]);

    svg.selectAll('.y.axis.all')
      .call(yAxis);
    if (filter[0]!=filter[1]){
      this.update(filter);
    } else {
      this.update([0,0]);
    }


  };
  this.updateMaxMinAll = function(min,max){
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

  this.update = function(filter){
    filterVal = filter;
    //if (!lockscale){
    var min =  filterVal [0];
    var max =  filterVal [1];
    //this.updateMax(m+ m*0.2);

    var y =  yScale(max);
    var h =  yScale(min) - yScale(max);
    svg.selectAll(".grad")
      .attr("y",  y)
      .attr("height", h );
    svg.selectAll(".extent")
      .attr("y",  y)
      .attr("height", h );

    svg.selectAll('.y.axis.sel').attr("transform",
      "translate(60,"+y+")");

    yScaleSel.domain([0,selectionMax]).range([h, 0 ]);
    yAxisSel.ticks(h/15);
    svg.selectAll('.y.axis.sel')
      .call(yAxisSel);

    if (!limitByMax){
      //doBrush([min,m]);
    }
    //}

  }

}