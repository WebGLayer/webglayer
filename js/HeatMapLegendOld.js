HeatMapLegend = function(div_id, heatDimension, filterId) {
	
	var w = 100;
	var h = 200;
	var margin = {
			top : 10,
			right : 0,
			bottom : 10,
			left : 40
	};
	var lockscale = false;
	var width = w - margin.left - margin.right;
	var height = h - margin.top - margin.bottom;

	var yScale = d3.scale.linear().domain([ 0, 200]).range(
			[ height, 0 ]);
	
	var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left");
	
	var limitByMax = true;
	
	svg = d3.select("#" + div_id).append("svg").attr("width",
			width + margin.left + margin.right).attr("height",
			height + margin.top + margin.bottom).append("g").attr(
			"transform",
			"translate(" + margin.left + "," + margin.top + ")");

	d3.select("#" + div_id).append("label")
	.text("lock scale")
	.append("input")
	.attr("type","checkbox")
	.attr("id","scale")
	.on("click", function(d,i){
		 lockscale = this.checked;
		 WGL.getDimension(heatDimension).lockScale = this.checked;
		}); 
	 
	svg.append("defs").append("linearGradient")
				.attr("id", "legend")
				.attr("x1","0%")
				.attr("y1","0%")
				.attr("x2","0%")
				.attr("y2","100%")
				.selectAll("stop")
				.data([
				       {offset: "0%", color: "rgba(255, 0, 0,1)"},
				       {offset: "50%", color: "rgba(255, 255, 0,0.8)"},	
				       {offset: "100%", color: "rgba(0, 255, 0,0.6)"}
				       ])
				 .enter().append("stop")
				 	.attr("offset", function(d) { return d.offset; })
				 	.attr("stop-color", function(d) { return d.color; });
	
	svg.append("defs").append("linearGradient")
		.attr("id", "legend_blue")
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
	
	svg.append("rect").attr("fill", "black")
	  .attr("id","grad_bacground")
	  .attr("x", 0)
    .attr("y", 0)
    .attr("width", 50)
    .attr("height", height);
	
	svg.append("rect").attr("fill", "url(#legend_blue)")
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
    .attr("height", height);

	svg.append("rect").attr("fill", "url(#legend)")
					  .attr("class","grad")
					  .attr("x", 30)
	                  .attr("y", 0)
	                  .attr("width", 30)
	                  .attr("height", height);
	

	var brushed = function(){
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
        	WGL.getDimension(heatDimension).setFilter(undefined); 
        } else {
        	WGL.getDimension(heatDimension).setFilter(f); 
        }
      	
		WGL.filterDim(heatDimension,filterId,f);
					
	}
	
	
		
	var brush = d3.svg.brush()		
	    .y(yScale)
	    .on("brush", brushed);
	
	 svg.append("g")
     .attr("class", "y axis")
     .call(yAxis)
     .append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 6)
     .attr("dy", ".71em")
     .style("text-anchor", "end")
     .text("Number of accidents");
	 
	 
	  svg.append("g").attr("class", "brush").call(brush)
		.selectAll("rect").attr("width", width);

	 
	 this.updateMax = function(max){
		 
		 yScale.domain([0, max]);
		
		 svg.selectAll('.y.axis')
			.call(yAxis);
		 
	 }
	 
	 this.showSelection = function(){
	 	svg.selectAll(".grad")
		 .attr("y",  0)     
        .attr("height", yScale(f[0]) - yScale(f[1]) );	
	 }

	 this.update = function(){
		 
	 	 if (!lockscale){
	 	 	var m = WGL.getDimension(heatDimension).maxall;	 	 	
	 	 	var min = brush.extent()[0];
	 	 	var max = brush.extent()[1];
		 	this.updateMax(m+ m*0.2);
		 	
			svg.selectAll(".grad")
			 .attr("y",  yScale(max))     
	        .attr("height", yScale(min) - yScale(max) );	
			svg.selectAll(".extent")
			 .attr("y",  yScale(max))     
	        .attr("height", yScale(min) - yScale(max) );

	         if (!limitByMax){
		 		//doBrush([min,m]);
			 }
	 	 }
		
	 }

}