 WGL.ui.StackedBarChart = function(m, div_id, x_label, filterId, params) {

	 
	var type;
	var div_id;
	
	var w;
	var h;
	var margin;
	if (typeof(params)=='undefined'){
		w = 500;
		h = 215;
		margin = {
			top : 20,
			right : 20,
			bottom : 65,
			left : 60
			};
	} else {
		w=params.w;
		h=params.h;
		margin=params.margin;
	}
	
	var dataset;
	var xScale;
	var yScale;
	var colorScale;
	var xAxis;
	var yAxis;
	var bars;
	var svg;
	var chart;
	var active_group = 2;
	
	var width = w - margin.left - margin.right;
	var height = h - margin.top - margin.bottom;
	var dataset = null;
	var svgbw = "";

	 this.y_label = "detections";
	

	this.setLinearXScale = function(){
		xScale = new d3.scale.linear();
		xScale = d3.scale.linear().domain([ m.min , m.max ]).range([ 0, width ]);
		var bw = Math.floor(width / dataset.length );
		svgbw= "h"+bw+"V";
		type = 'linear';
		return this;
	}

	this.setOrdinalXScale = function(){
		xScale = d3.scale.ordinal().domain(m.domain).rangeBands([ 0, width ],0.03,0.015);
		var bw =xScale.rangeBand();
		svgbw= "h"+bw+"V";
		type = 'ordinal';
		return this;
	}


	this.xformat = function(d){
			return d;
			 };
	
/*	this.setTicks = function(n){
		xAxis.ticks(n) ;
	}
	
	this.setTicksValues = function(v){
		xAxis.ticksValues(v);
	}*/
	this.init = function() {
		// xScale = d3.scale.ordinal().rangeRoundBands([0, width], .1);
		// xScale = d3.scale.ordinal().rangeRoundBands([0, width], .1);
	
		
		//this.setLinearXScale();
		if (typeof m.domain == 'undefined'){
			this.setLinearXScale();
		} else {
			this.setOrdinalXScale();
		}

		var cols = [ "#ff8c00", "#7b6888", "#98abc5" ];
		//var cols = [ "#ff8c00", "#3182bd", "#98abc5" ];
		var classes = [ [ "0", "selected", cols[0] ],
				[ "1", "unselected", cols[1] ], [ "2", "out", cols[2] ] ];

		colorScale = d3.scale.ordinal().range(cols);

		yScale = d3.scale.linear().domain([ 0, dataset.max[2] ]).range(
				[ height, 0 ]);

		colorScale.domain([ "selected", "unselected", "out" ]);
		
		
		//to update label printing
		//new Date(d*1000).getYear()};
		
		xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(this.xformat);

		
		//yAxis = d3.svg.axis().scale(yScale).orient("left");
		yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(d3.format(".2n")); //changes

		// xScale.domain(this.dataset.map(function(d) {
		// return d.max-(d.max-d.min)/2; }));

		svg = d3.select("#" + div_id).append("svg").attr("width",
				width + margin.left + margin.right).attr("height",
				height + margin.top + margin.bottom).append("g").attr(
				"transform",
				"translate(" + margin.left + "," + margin.top + ")");

		chart = svg.select('.chart');
		svg.append("g").attr("class", "x axis").attr("transform",
				"translate(0," + height + ")").call(xAxis).append("text")
			    .attr("y", "3.5em").attr("x",
				width /2 ).style("text-anchor", "end").text(x_label);

		svg.append("g").attr("class", "y axis").call(yAxis).append("text")
				.attr("transform", "rotate(270)").attr("y", "-4.5em").attr("x",
						"-2em").style("text-anchor", "end").text(this.y_label); //changes

		/*
		 * bars = svg.selectAll(".bars").data(dataset).enter()
		 * .append("g").attr("class", "g").attr("transform", function(d) {
		 * return "translate(" + (xScale(d.min)+xScale(d.max))/2 + ",0)"; });
		 */

		/* new bars */
		svg.append("clipPath").attr("id", "clip-" + div_id).append("rect")
				.attr("width", width).attr("height", height);

		bars = svg.selectAll(".bar").data([ "selected", "unselected", "out" ])
				.enter().append("path").attr("class", function(d) {
					return d + " foreground bar ";
				}).datum(dataset);
		
		//bars.on("click", function(d) 
		//		{ d.selected = !d.selected; 				
		//			console.log(d);			
		//		})

		svg.selectAll(".foreground.bar").attr("clip-path",
				"url(#clip-" + div_id + ")");

		// update(dataset);
		// svg.selectAll("selected bar").attr("d", barPathSelected);

		/* data */
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

	
		/*
		 * bars.selectAll("path").data(function(m) { return m.levels;
		 * }).enter().append("rect").attr("y", function(d) { return
		 * yScale(d.y1); }).attr("width", bw).attr("height", function(d) {
		 * return yScale(d.y0) - yScale(d.y1); }).attr("fill", function(d) {
		 * return colorScale(d.name); }).attr("class", function(d){return
		 * div_id+d.name});
		 */
		function brushLinear() {
			var f = brush1.extent();							
			WGL.filterDim(m.name, filterId, f);			
			//console.log(brush1.extent()[0][0]+' '+brush1.extent()[0][1]);
		}

		function brushOrdinal() {
			var f = brush1.extent();
			var of = []
			var l = xScale.domain().length;
			for (var i in f){
				of[i] = [];
				of[i][0] = f[i][0] /width * l; 
				of[i][1] = f[i][1] /width * l;  	
			}
			WGL.filterDim(m.name,filterId, of);
			//console.log(of[0][0]+' '+of[0][1]);
			
		}
		var brush;
		if (type=='linear') {
			brush = brushLinear;
		}
		else if (type=='ordinal'){
			brush = brushOrdinal;
		}

		var brush1 = d3.svg.multibrush().x(xScale).extentAdaption(resizeExtent)
				.on("brush", brush).on("brushend", function(d) {
					if (brush1.extent().length == 0) {						
						brush();
					}

				});
		this.brush = brush1;

		var brushNode = svg.append("g").attr("class", "brush").call(brush1)
				.selectAll("rect").attr("height", height);

		/**
		 * legend and scaling
		 */
		var legendRect = svg.append("g").attr("class", "l").selectAll('rect')
				.data(classes);

		legendRect.enter().append("rect").attr("id", function(d) {
			return div_id+ d[0];
		}).attr("x", w - 150).attr("y", function(d) {
			return (h - 63 + d[0] * 15)
		}).attr("width", 12).attr("height", 12).attr("fill", function(d) {
			return d[2];
		}).on(
				"click",
				function(d) {
					var el = d3.select("#"+div_id + d[0])				
						active_group = d[0];
						for (var i = 0; i < classes.length; i++) {							
							calcBar();													
						}
					

				});

		legendRect.enter().append("text").text(function(d) {
			return d[1];
		}).attr("x", w - 130).attr("y", function(d) {
			return (h - 63 + d[0] * 15 + 12)
		}).attr("width", 12).attr("height", 12).attr("stroke", "none");

		function resizeExtent(selection) {
			selection.attr("height", height);
		}
		
	
	
		function brushO() {
			
			var f = brush1.extent();	
			var leftEdges = xScale.range();
        	var width = xScale.rangeBand();
        	var l;
        	var r;
        	var left = brush1.extent()[0][0];
        	var right = brush1.extent()[0][1]
        	for(l=0; left > (leftEdges[l] + width); l++) {}
        	for(r=0; right > (leftEdges[r] + width); r++) {}
            //do nothing, just increment j until case fails
        	console.log("Clicked on " + xScale.domain()[l]+ " "+xScale.domain()[r]);		

        	var f = [];
        	f[0] = [ xScale.domain()[l],  xScale.domain()[r]];
			WGL.filterDim(id, filterId, f);
			//console.log(xScale.domain()[j]+' '+brush1.extent()[0][1]);
			
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

		/*
		 * dataset.forEach(function(d) { var y0 = 0; d.levels =
		 * colorScale.domain().map(function(name) { return { name : name, y0 :
		 * y0, y1 : y0 += +d[name] }; }); d.total = 0; });
		 */

		dataset.max = data.max;

		bars.datum(dataset);
		
		calcBar();
		// bars.data(dataset).transition().duration(10);
		/*
		 * bars.selectAll("rect").data(function(m) { return m.levels;
		 * }).transition().duration(10).attr("y", function(d) { return
		 * yScale(d.y1); }).attr("height", function(d) { return yScale(d.y0) -
		 * yScale(d.y1); });
		 */

		/*
		 * yAxis = d3.svg.axis().scale(yScale).orient("left");
		 * svg.selectAll('.y.axis').transition().duration(15).call(yAxis);
		 */
	}

	function calcBar(){
		yScale = d3.scale.linear().domain(
				[ 0, dataset.max[active_group] ]).range(
				[ height, 0 ]);
		yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(d3.format(".2n")); //changes format
		svg.selectAll('.y.axis').transition().duration(30)
				.call(yAxis);
		
		svg.selectAll(".selected.bar").attr("d", barPathSelected);
		svg.selectAll(".unselected.bar").attr("d", barPathUnselected);
		svg.selectAll(".out.bar").attr("d", barPathOut);


	}
	function barPathSelected(groups) {
		var path = [], i = -1, n = groups.length, d;
		while (++i < n) {
			var d = groups[i];
			path.push("M", xScale(d.val), ",", height, "V", yScale(d.selected),
					svgbw, height);
		}
		return path.join("");
	}

	function barPathUnselected(groups) {
		var path = [], i = -1, n = groups.length, d;
		while (++i < n) {
			var d = groups[i];
			path.push("M", xScale(d.val), ",", yScale(d.selected), "V",
					yScale(d.selected) + yScale(d.unselected) - height, svgbw,
					yScale(d.selected));
		}
		return path.join("");
	}

	function barPathOut(groups) {
		var path = [], i = -1, n = groups.length, d;
		while (++i < n) {
			var d = groups[i];
			var start = yScale(d.selected) + yScale(d.unselected) - height;
			path.push("M", xScale(d.val), ",", start, "V", start
					+ yScale(d.out) - height, svgbw, start);
		}
		return path.join("");
	}
	
}