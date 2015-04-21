function LineChart(div_id, x_label) {
	
	var dataset = null;
	
	this.init = function() {
		var margin = {top: 20, right: 20, bottom: 30, left: 50},
	    width = 500 - margin.left - margin.right,
	    height = 400 - margin.top - margin.bottom;
		
		var parseDate = d3.time.format("%d-%b-%y").parse;

		var x = d3.time.scale()
		    .range([0, width]);

		var y = d3.scale.linear()
		    .range([height, 0]);

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left");

		var line = d3.svg.line()
		    .x(function(d) { return x(d.date); })
		    .y(function(d) { return y(d.value); });
		
		var svg = d3.select("#" + div_id).append("svg")
	   		.attr("width", width + margin.left + margin.right)
	   		.attr("height", height + margin.top + margin.bottom)
	   		.append("g")
	   		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		
		 dataset.forEach(function(d) {
			    d.date = d.date;
			    d.value = d.value/d.numrec;
			  });

			  x.domain(d3.extent(dataset, function(d) { return d.date; }));
			  y.domain(d3.extent(dataset, function(d) { return d.value; }));

			  svg.append("g")
			      .attr("class", "x axis")
			      .attr("transform", "translate(0," + height + ")")
			      .call(xAxis);

			  svg.append("g")
			      .attr("class", "y axis")
			      .call(yAxis)
			    .append("text")
			      .attr("transform", "rotate(-90)")
			      .attr("y", 6)
			      .attr("dy", ".71em")
			      .style("text-anchor", "end")
			      .text("Price ($)");

			  svg.append("path")
			      .datum(dataset)
			      .attr("class", "line")
			      .attr("d", line);

	}
	this.update = function(data) {
		if (dataset == null) {
			dataset = Array.prototype.slice.call(data);
			dataset.max = data.max;
			this.init();
		}
		dataset = Array.prototype.slice.call(data);
			
		
		
	
	}
}