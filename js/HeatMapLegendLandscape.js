HeatMapLegend = function(div_id) {
	
	var w = 100;
	var h = 200;
	var margin = {
			top : 10,
			right : 0,
			bottom : 10,
			left : 40
	};
	var width = w - margin.left - margin.right;
	var height = h - margin.top - margin.bottom;

	var yScale = d3.scale.linear().domain([ 0, 100]).range(
			[ height, 0 ]);
	
	var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left");
	
	svg = d3.select("#" + div_id).append("svg").attr("width",
			width + margin.left + margin.right).attr("height",
			height + margin.top + margin.bottom).append("g").attr(
			"transform",
			"translate(" + margin.left + "," + margin.top + ")");

	 
	 
	svg.append("defs").append("linearGradient")
				.attr("id", "legend")
				.attr("x1","0%")
				.attr("y1","0%")
				.attr("x2","0%")
				.attr("y2","100%")
				.selectAll("stop")
				.data([
				       {offset: "0%", color: "red"},				      
				       {offset: "100%", color: "green"}
				       ])
				 .enter().append("stop")
				 	.attr("offset", function(d) { return d.offset; })
				 	.attr("stop-color", function(d) { return d.color; });
	
	
	svg.append("rect").attr("fill", "url(#legend)")
					  .attr("x", 0)
	                  .attr("y", 0)
	                  .attr("width", 50)
	                  .attr("height", height);
	
	 svg.append("g")
     .attr("class", "y axis")
     .call(yAxis)
   .append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 6)
     .attr("dy", ".71em")
     .style("text-anchor", "end")
     .text("Number of accidents");
	 
	 this.updateMax = function(max){
		 yScale.domain([0, max]);
		 svg.selectAll('.y.axis').transition().duration(30)
			.call(yAxis);
	 }

}