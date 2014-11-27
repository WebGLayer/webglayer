StackedBarChart = function(d_max, ch_row, div_id) {
	var div_id;
	var ch_row = ch_row;
	var w = 500;
	var h = 300;
	var dataset;
	var xScale;
	var yScale;
	var colorScale;
	var xAxis;
	var yAxis;
	var bars;
	var svg;
	var chart;
	var active_group=2;
	var margin = {
		top : 20,
		right : 20,
		bottom : 30,
		left : 40
	};
	var width = w - margin.left - margin.right;
	var height = h - margin.top - margin.bottom;
	var dataset = null;

	this.init = function() {
		// xScale = d3.scale.ordinal().rangeRoundBands([0, width], .1);
		// xScale = d3.scale.ordinal().rangeRoundBands([0, width], .1);
		xScale = d3.scale.linear().domain([ 0, d_max ]).range([ 0, width ]);

		var cols = [ "#ff8c00", "#7b6888","#98abc5" ];
		var classes = [ ["0","selected", cols[0]],
		               ["1","unselected", cols[1]],
		               ["2","out", cols[2]] ];
		
		colorScale = d3.scale.ordinal().range(
				cols);

		yScale = d3.scale.linear().domain([ 0, dataset.max[2] ]).range([ height, 0 ]);
		

		colorScale.domain([ "selected", "unselected", "out" ]);
		xAxis = d3.svg.axis().scale(xScale).orient("bottom");

		yAxis = d3.svg.axis().scale(yScale).orient("left");

		// xScale.domain(this.dataset.map(function(d) {
		// return d.max-(d.max-d.min)/2; }));

		svg = d3.select("#"+div_id).append("svg").attr("width",
				width + margin.left + margin.right).attr("height",
				height + margin.top + margin.bottom).append("g").attr(
				"transform",
				"translate(" + margin.left + "," + margin.top + ")");

		chart = svg.select('.chart');
		svg.append("g").attr("class", "x axis").attr("transform",
				"translate(0," + height + ")").call(xAxis);

		svg.append("g").attr("class", "y axis").call(yAxis).append("text")
				.attr("transform", "rotate(90)").attr("y", 6).attr("dy",
						".71em").style("text-anchor", "end").text("");

		
		
		
		
		
		
		bars = svg.selectAll(".bars").data(dataset).enter()
				.append("g").attr("class", "g").attr("transform", function(d) {
					return "translate(" + (xScale(d.min)+xScale(d.max))/2 + ",0)";
				});

		dataset.forEach(function(d) {
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

		var bw = Math.floor(width/dataset.length-1);
		bars.selectAll("rect").data(function(m) {
			return m.levels;
		}).enter().append("rect").attr("y", function(d) {
			return yScale(d.y1);
		}).attr("width", bw).attr("height", function(d) {
			return yScale(d.y0) - yScale(d.y1);
		}).attr("fill", function(d) {
			return colorScale(d.name);
		}).attr("class", function(d){return div_id+d.name});

		var brush1 = d3.svg.multibrush().x(xScale).extentAdaption(resizeExtent).on(
				"brush", brush).on("brushend",function(d){
					if (brush1.extent().length==0){
						brush();
					}
					
					});
		

		var brushNode = svg.append("g").attr("class", "brush").call(brush1)
				.selectAll("rect").attr("height", height);

		/**
		 * legend and scaling
		 */
		var legendRect = svg.append("g").attr("class","l").selectAll('rect').data(classes);

		legendRect.enter()
		    .append("rect")
		    .attr("id",function(d){return "legend"+d[0];})
		    .attr("x", w- 140)
		    .attr("y", function(d){
		    		return  (1+d[0]*15 )})
		    .attr("width", 12)
		    .attr("height", 12)
		    .attr("fill",function(d){
		    	return d[2];
		    })
		     .on("click", function(d){
		    	 var el = d3.select("#legend"+d[0])
		    	 var s =  el.attr("stroke");
		    	 if (s=="none"){
		    		 el.attr("stroke","#000");
		    		 active_group = d[0];
			    	 for (var i=0; i< classes.length; i++ ){
			    		 if (classes[i][1]!=d[1]){
			    			// d3.selectAll("."+div_id+classes[i][1]).attr("opacity", 0.1 );
			    		 }
			    		
			    	 }
			    	 
		    	 } else {
		    		 el.attr("stroke","none");
		    	 }
		    	
		     });
			
			legendRect.enter().append("text")		  
		    .text(function(d){return d[1];})
		    .attr("x", w - 120)
		    .attr("y", function(d){
		    		return  (d[0]*15 + 12 )})
		    .attr("width", 12)
		    .attr("height", 12)
		    .attr("stroke", "none");
		  
			
			
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
			
			histFilterRender.createFilteringData(ch_row, h_filter);
			
			// add data, attach elements and so on

		
			// add data, attach elements and so on
			//console.log(h_filter);
		}

	}

	// Create bars

	this.update = function(data) {
		if (dataset == null) {
			dataset = Array.prototype.slice.call(data);
			dataset.max = data.max;
			this.init();
		}
	dataset = Array.prototype.slice.call(data);

		dataset.forEach(function(d) {
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

		dataset.max=data.max;
		
		 yScale = d3.scale.linear().domain([ 0, dataset.max[active_group]]).range([ height, 0 ]);
    	 yAxis = d3.svg.axis().scale(yScale).orient("left");
		 svg.selectAll('.y.axis').transition().duration(30).call(yAxis);
		 
		bars.data(dataset).transition().duration(10);

		bars.selectAll("rect").data(function(m) {
			return m.levels;
		}).transition().duration(10).attr("y", function(d) {
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