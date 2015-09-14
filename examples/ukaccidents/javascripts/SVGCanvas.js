function SVGCanvas(){
	
	this.s = 100;
	var svg = d3.select("body").append("svg")
		.attr("id","svgcanvas")
		.attr("width", manager.width)
		.attr("height", manager.height);
	
	var svggroup= svg.append("g");
	
	

		
		
	
	
	
	this.addPoints = function(pts){
		circles = svggroup.selectAll("circle")
		.data(pts)
		.enter().append("circle");
		
		circles.attr("cx", function(d) { 
	    	return d.x; 
	    	})
	    .attr("cy", function(d) { return d.y; })
	    .attr("r", 0.005)
		.attr("class", "point")		
		.attr("pointer-events","all")
		.style("fill", function(d){ return d.col})
		.on("mouseover", function(){
			console.log("aaa");
		});
	
		
		
	}
	
	this.transform = function(zoom, trans){
		this.s = Math.pow(2, zoom);
		
		svggroup.attr("transform", 
				"matrix("+this.s+","+ 0 +"," + 0 +","+ this.s +","+ -trans.x*this.s +","+ -trans.y*this.s+")");
		//svggroup.selectAll("circle").attr("r", 5/this.s)
		
	}
	
	
}