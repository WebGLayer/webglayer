StackedBarChart = function(){
		
	var w = 600;
	var h = 400;
	var dataset;
	var xScale;
	var yScale;
	var margin = {top: 20, right: 20, bottom: 30, left: 40},	
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;
	
	
	this.update = function(data){
		
		dataset = data;
		
		xScale =  d3.scale.linear().domain([0,200]).rangeRound([0, w]);

		yScale = d3.scale.linear().domain([ 0, 100 ]).range(
		[ 0, h ]);
		
	
		var xAxis = d3.svg.axis()
	    .scale(xScale)
	    .orient("bottom");
		
		var yAxis = d3.svg.axis()
	    .scale(yScale)
	    .orient("left");
		
		var svg = d3.select("#chart_container").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);
		
		svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	      .append("text")
	      .attr("transform", "rotate(90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("Population");

	}
	
	this.render = function(){
		dataset.forEach(function(d){
			   var y0 = 0;
			    d.ages = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
			    d.total = d.ages[d.ages.length - 1].y1;
			var m;
		})
	}

	

}