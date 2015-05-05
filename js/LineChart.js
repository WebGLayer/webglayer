function LineChart(div_id, timesdomain, enablebrush) {
	
	var dataset = null;
	
	var svg ;
	var x;
	var y;
	var xAxis ;
	var yAxis ;
	var lines;
	
	
	this.init = function() {		
		var margin = {top: 20, right: 20, bottom: 30, left: 50},
	    width = 550 - margin.left - margin.right,
	    height = 250 - margin.top - margin.bottom;
		
		var parseDate = d3.time.format("%d-%b-%y").parse;

		x = d3.time.scale()
		    .range([0, width]);

		 y = d3.scale.linear()
		    .range([height, 0]);
		var color = d3.scale.category10();
		 
		
		
		xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");

		yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left");

		var line = d3.svg.line()
		    .x(function(d) { return x(d.date); })
		    .y(function(d) {
		    	if(d.value==0) {return y(0)}
		    	else {return y(d.value)}; 
		    	});
		
		svg = d3.select("#" + div_id).append("svg")
	   		.attr("width", width + margin.left + margin.right)
	   		.attr("height", height + margin.top + margin.bottom)
	   		.append("g")
	   		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	
		
		x.domain(timesdomain);			  			 
		y.domain([210, 240]);//d3.extent(dataset,function(d) { return d.av_value; }));
				
			  
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
			      .text("level [m]");
			  			  			 
		lines = svg.append("g")
		.attr("class","chart_lines");
		
		
		if (enablebrush){
			
			function onbrush() {
				  var s = brush.extent();
				  var start = x(s[0])/width;
				  var end = x(s[1])/width ;
				  renderDetChart(1/(end-start), (end+start)/2-0.5, s[0],s[1]);
				}
			
			var brush = d3.svg.brush().x(x)	   
			.extent(0,0)
	  	 	.on("brushstart", onbrush)
	   	 	.on("brush", onbrush)
	    	.on("brushend", onbrush);
		
		
		  
			var brushg = svg.append("g")
	    	.attr("class", "brush")
	    	.call(brush);
		
			brushg.selectAll("rect")
	    	.attr("height", height);	
		}
	
		lines.selectAll("g")
			.data(dataset)
			.enter().append("path")
		      .attr("class", "line")
		      .attr("id", function(d){return "line"+d.uid})		   
			  .style("stroke",  function(d){
				  return d.col});			  		

	}
	var createLine = function(data, z, t){
		var segments = []
		var started = false;
	

		 data.forEach(function(d) {			   
			    if (d.numrec == 0){
			    	 d.av_value = NaN;
			    } else {
			    	d.av_value = d.value/d.numrec;			    	
			    	
			    	//d.date = times[Math.round(d.date*scale)]; //convert order to times
			    	// d is in pixels - converting to data
			   // 	d.date = new Date( ((d.date/data.length* (timesdomain[1].getTime()-timesdomain[0].getTime())) + timesdomain[0].getTime()));
			    	d.date = new Date( d.date * z +t);
				    
			    
			    }			   
			  });
		
		for (var i =0; i< data.length; i++){
			var d = data[i]; 
			if (!started){
				if (!isNaN(d.av_value)){
					segments.push('M'); 
					segments.push(x(d.date).toFixed(3));
					segments.push(",");
					segments.push(y(d.av_value).toFixed(3));
					started = true;
				}				
			} else {
				if (!isNaN(d.av_value) && !isNaN(data[i-1].av_value)){
					segments.push('L'); 
					segments.push(x(d.date).toFixed(3));
					segments.push(",");
					segments.push(y(d.av_value).toFixed(3));
				}	else  if (!isNaN(d.av_value) && isNaN(data[i-1].av_value)) {
					segments.push('M'); 
					segments.push(x(d.date).toFixed(3));
					segments.push(",");
					segments.push(y(d.av_value).toFixed(3));
				}	else  if (isNaN(d.av_value) && isNaN(data[i-1].av_value)) {
					
				}
			}
		}
			
			
		return segments.join("");
		//return "M0.000,17.805L4.343,19.682L8.687,350.000L13.030,350.000L17.374,350.000L21.717,350.000L26.061,350.000L30.404,350.000
	};
	
	this.updatePart = function(pts, start, end) {
		
		var scale = 1/(timesdomain[1].getTime()-timesdomain[0].getTime);
		
		if (dataset == null) {	
			dataset = Array.prototype.slice.call(pts);
			this.init();
		}
		
		//dataset = Array.prototype.slice.call(pts);			
		lines.selectAll("g")
		.datum(dataset);
			
			
		x.domain([start, end]);
		//xAxis = d3.svg.axis().scale(x).orient("bottom");
		xAxis.scale(x);
	
		svg.selectAll('.x.axis').transition().duration(30)
				.call(xAxis);
		
		var z = (end.getTime()-start.getTime())/dataset[0].data.length ;
		var t = start.getTime();	
		calcLines(z,t);
		
	}
	this.update = function(pts) {
		//scale =  (timesdomain[1]-timesdomain[0])//times.length / pts[0].data.length;	
		
		if (dataset == null) {
			dataset = Array.prototype.slice.call(pts);
			//dataset.max = data.max;
			this.init();
		}
		
		dataset = Array.prototype.slice.call(pts);
	
		
		lines.selectAll("g")
		.datum(dataset);
		var z = (timesdomain[1].getTime()-timesdomain[0].getTime())/dataset[0].data.length ;
		var t = timesdomain[0].getTime();
		calcLines(z,t);
		
		  //.on("mousewheel.zoom", function(e,d){
		  //	  console.log(d)
		  //  });  
	}
	
	function calcLines(z,t){
//		yScale = d3.scale.linear().domain(
//				[ 0, dataset.max[active_group] ]).range(
//				[ height, 0 ]);
//		yAxis = d3.svg.axis().scale(yScale).orient("left");
//		svg.selectAll('.y.axis').transition().duration(30)
//				.call(yAxis);
		
		
		lines.selectAll(".line").attr("d", function(d){
	    	  return createLine(d.data, z,t);
		});
	    			

	}

}