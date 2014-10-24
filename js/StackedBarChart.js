StackedBarChart = function(d_max, ch_row) {

	var ch_row = ch_row;
	var w = 600;
	var h = 400;
	var dataset;
	var xScale;
	var yScale;
	var colorScale;
	var xAxis;
	var yAxis;
	var speeds;
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

	this.init = function() {
		// xScale = d3.scale.ordinal().rangeRoundBands([0, width], .1);
		// xScale = d3.scale.ordinal().rangeRoundBands([0, width], .1);
		xScale = d3.scale.linear().domain([ 0, d_max ]).range([ 0, width ]);

		colorScale = d3.scale.ordinal().range(
				[ "#ff8c00", "#7b6888", "#98abc5" ]);

		yScale = d3.scale.linear().domain([ 0, 4000 ]).range([ height, 0 ]);

		colorScale.domain([ "selected", "unselected", "out" ]);
		xAxis = d3.svg.axis().scale(xScale).orient("bottom");

		yAxis = d3.svg.axis().scale(yScale).orient("left");

		// xScale.domain(this.dataset.map(function(d) {
		// return d.max-(d.max-d.min)/2; }));

		svg = d3.select("#chart_container").append("svg").attr("width",
				width + margin.left + margin.right).attr("height",
				height + margin.top + margin.bottom).append("g").attr(
				"transform",
				"translate(" + margin.left + "," + margin.top + ")");

		chart = svg.select('.chart');
		svg.append("g").attr("class", "x axis").attr("transform",
				"translate(0," + height + ")").call(xAxis);

		svg.append("g").attr("class", "y axis").call(yAxis).append("text")
				.attr("transform", "rotate(90)").attr("y", 6).attr("dy",
						".71em").style("text-anchor", "end").text("Population");

		speeds = svg.selectAll(".speeds").data(this.dataset).enter()
				.append("g").attr("class", "g").attr("transform", function(d) {
					return "translate(" + xScale(d.min) + ",0)";
				});

		this.dataset.forEach(function(d) {
			var y0 = 0;
			d.levels = colorScale.domain().map(function(name) {
				return {
					name : name,
					y0 : y0,
					y1 : y0 += +d[name]
				};
			});
			d.total = 0;
		});

		speeds.selectAll("rect").data(function(m) {
			return m.levels;
		}).enter().append("rect").attr("y", function(d) {
			return yScale(d.y1);
		}).attr("width", 5).attr("height", function(d) {
			return yScale(d.y0) - yScale(d.y1);
		}).attr("fill", function(d) {
			return colorScale(d.name);
		});

		brush1 = d3.svg.multibrush().x(xScale).extentAdaption(resizeExtent).on(
				"brush", brush).on("brushend",function(d){
					if (brush1.extent().length==0){
						brush();
					}
					
					});
		

		var brushNode = svg.append("g").attr("class", "brush").call(brush1)
				.selectAll("rect").attr("height", height);

		function resizeExtent(selection) {
			selection.attr("height", height);
		}

		function brush() {
			//console.log(brush1.extent());
			
			var f = brush1.extent();
			var h_filter = new Float32Array(f.length*4);
			//console.log(h_filter.length);
			var j = 0;
			for(var i in f){
				var y = ((ch_row + 0.5) / metadata.length) *2 -1;				
				
				h_filter[j++] = normaliseByMax(f[i][0], 
						metadata.max_bins, 
						metadata[ch_row].max, 
						metadata[ch_row].num_bins);
				h_filter[j++] = y; 
			
				h_filter[j++] = normaliseByMax(f[i][1], 
						metadata.max_bins, 
						metadata[ch_row].max, 
						metadata[ch_row].num_bins);
				h_filter[j++] = y;
			}
			
			histFilterRender.createFilteringData(h_filter);
			//console.log(h_filter);
		}

	}

	// Create bars

	this.update = function(data) {
		if (this.dataset == null) {
			this.dataset = Array.prototype.slice.call(data);
			this.init();
		}
		this.dataset = Array.prototype.slice.call(data);

		this.dataset.forEach(function(d) {
			var y0 = 0;
			d.levels = colorScale.domain().map(function(name) {
				return {
					name : name,
					y0 : y0,
					y1 : y0 += +d[name]
				};
			});
			d.total = 0;
		});

		speeds.data(this.dataset).transition().duration(15);

		speeds.selectAll("rect").data(function(m) {
			return m.levels;
		}).transition().duration(0).attr("y", function(d) {
			return yScale(d.y1);
		}).attr("height", function(d) {
			return yScale(d.y0) - yScale(d.y1);
		});

		/*
		 * yAxis = d3.svg.axis().scale(yScale).orient("left");
		 * svg.selectAll('.y.axis').transition().duration(15).call(yAxis);
		 */
	}

}