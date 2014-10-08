StackedBarChart = function() {

	var w = 600;
	var h = 400;
	var dataset;
	var xScale;
	var yScale;
	var xAxis;
	var yAxis;
	var svg;
	var chart;
	var margin = {
		top : 20,
		right : 20,
		bottom : 30,
		left : 40
	}; 
	var width = w - margin.left - margin.right; 
	var height = h - margin.top - margin.bottom;
	this.dataset = null;


	this.init = function(){
		xScale = d3.scale.ordinal().domain([0,1,2,3,4,5,6,7,8,9,10,
		                                    11,12,13,14,15,16,17,18,19,20,
		                                    21,22,23,24,25,26,27,28,29,30]).rangeRoundBands([ 0, width  ], 0.05);
		
		yScale = d3.scale.linear().domain([ 0, d3.max(this.dataset) ]).range([height, 0]);

		xAxis = d3.svg.axis().scale(xScale).orient("bottom");

		yAxis = d3.svg.axis().scale(yScale).orient("left");

		svg = d3.select("#chart_container").append("svg").attr("width",
				width + margin.left + margin.right).attr("height",
				height + margin.top + margin.bottom).append("g").attr("transform",
				"translate(" + margin.left + "," + margin.top + ")");

		chart = svg.select('.chart');
		svg.append("g").attr("class", "x axis").attr("transform",
				"translate(0," + height + ")").call(xAxis);

		svg.append("g").attr("class", "y axis").call(yAxis).append("text").attr(
				"transform", "rotate(90)").attr("y", 6).attr("dy", ".71em").style(
				"text-anchor", "end").text("Population");
		svg.selectAll("rect").data(this.dataset).enter().append("rect")
		.attr("x", function(d, i) {
			return xScale(i);
		}).attr("y", function(d) {
			return height-yScale(d);
		}).attr("width", xScale.rangeBand())
		.attr("height",	function(d) {
					return yScale(d);
				}).attr("fill", function(d) {
			return "rgb(0, 0,  250)";
		});

	}
	
	// Create bars

	this.update = function(data) {
		if (this.dataset == null) {
			this.dataset = Array.prototype.slice.call(data);
			this.init();
		}
		this.dataset = Array.prototype.slice.call(data);
		yScale = d3.scale.linear().domain([ 0, d3.max(this.dataset) ]).range([height, 0]);		
	
		svg.selectAll("rect").data(this.dataset).transition().duration(15)
		.attr("x", function(d, i) {
			return xScale(i);
		}).attr("y", function(d) {
			return yScale(d);
		}).attr("width", xScale.rangeBand())
		.attr("height",	function(d) {
					return height-yScale(d);
				});

		 yAxis = d3.svg.axis().scale(yScale).orient("left");
		 svg.selectAll('.y.axis').transition().duration(15).call(yAxis);
	}

}