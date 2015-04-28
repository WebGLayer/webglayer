function LineChart(div_id, x_label) {
	
	var dataset = null;
	
	var svg ;
	var x;
	var y;
	var colors = d3.scale.category10();
	this.init = function() {
		var margin = {top: 20, right: 20, bottom: 30, left: 50},
	    width = 500 - margin.left - margin.right,
	    height = 400 - margin.top - margin.bottom;
		
		var parseDate = d3.time.format("%d-%b-%y").parse;

		x = d3.time.scale()
		    .range([0, width]);

		 y = d3.scale.linear()
		    .range([height, 0]);
		var color = d3.scale.category10();
		 
		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");

		var yAxis = d3.svg.axis()
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
		
		
		


			  x.domain(d3.extent(dataset, function(d) { return d.date; }));
			  y.domain([210,250]); //d3.extent(dataset,function(d) { return d.av_value; }));

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
			  
			  			 
			
			
			  		

	}
	this.createLine = function(data){
		var segments = []
		var started = false;
	
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
	
	
	this.update = function(data, uid) {
		if (dataset == null) {
			dataset = Array.prototype.slice.call(data);
			dataset.max = data.max;
			this.init();
		}
		dataset = Array.prototype.slice.call(data);			
		 dataset.forEach(function(d) {
			    d.date = d.date;
			    if (d.numrec == 0){
			    	 d.av_value = NaN;
			    } else {
			    	d.av_value = d.value/d.numrec;
			    }			   
			  });
		  y.domain(d3.extent(dataset,function(d) { return d.av_value; }));

		  svg.append("path")
	      .datum(dataset)
	      .attr("class", "line")
	      .attr("d",this.createLine(dataset))
		  .style("stroke", function(d){return colors(uid)})
		  .on("mousewheel.zoom", function(e,d){
			  console.log(d)
			  });  
	}
	

}