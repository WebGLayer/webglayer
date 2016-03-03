HeatMapLegend = function(div_id, filterId) {

	var heatDimension;

	var lockscale = false;
	var filterVal =[];
	this.setDimension = function(dim){
		heatDimension = dim;
	}
	

	/**SETUP THE SVG*/
	var w = 200;
	var h = 200;
	var margin = {
			top : 10,
			right : 0,
			bottom : 10,
			left : 40
	};
	var space = 60;
	
	var width = w - margin.left - margin.right;
	var height = h - margin.top - margin.bottom;

	

	var limitByMax = true;
	var div = d3.select("#" + div_id);
	
	
	
	var svg = div.append("svg").attr("width",
			width + margin.left + margin.right).attr("height",
			height + margin.top + margin.bottom).append("g").attr(
			"transform",
			"translate(" + margin.left + "," + margin.top + ")");

	
	/* Adding unselected axis*/
	var yScaleAll = d3.scale.linear().domain([ 0, 200]).range(
			[ height, 0 ]);
	
	var yAxisAll = d3.svg.axis()
    .scale(yScaleAll)
    .orient("left");	
	
	 svg.append("g")
     .attr("class", "y axis all")
     .call(yAxisAll)
     .append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 6)
     .attr("dy", ".71em")
     .style("text-anchor", "end")
     .text("Number of accidents");

		/* Adding unselected axis*/
		var yScaleSel = d3.scale.linear().domain([ 0, 200]).range(
				[ height, 0 ]);
		
		var yAxisSel = d3.svg.axis()
	    .scale(yScaleSel)
	    .orient("left");
     svg.append("g")
     .attr("class", "y axis sel")
     .attr("transform",
		   "translate("+space+",0)")
     .call(yAxisSel)
     .append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 6)
     .attr("dy", ".71em")
     .style("text-anchor", "end")
     .text("Number of accidents");
		 

	var brushed = function(){
		if (parseFloat(yScaleAll.domain()[1]) <=  parseFloat(thebrush.extent()[1])){
			//f[1] =9999999;
			limitByMax= false;
			console.log("setting to maximum.");
		} else {
			limitByMax= true;
		}
		doBrush(thebrush.extent());
	}
	
	var doBrush = function(f){
		     
        if (f.length == 2 && f[0]==f[1]){
        	/*pass the filter parameter to the dimension to render to colors properly*/        	
        	heatDimension.setFilter(undefined); 
        	WGL.filterDim(heatDimension.id, filterId, []);
        } else {
        	
        	heatDimension.setDoGetMax(false);
        	heatDimension.setFilter(f); 
        	WGL.filterDim(heatDimension.id, filterId, f);
        	heatDimension.setDoGetMax(true);
        	filterVal = f;
        }      			
					
	}
	
	
	
		
	var thebrush = d3.svg.brush()		
	    .y(yScaleAll)
	    .on("brush", brushed);

	 
	 
	 
	 this.updateMaxAll = function(max){	 	
	   
	 	 	
		 yScaleAll.domain([0, max]);
			
		 svg.selectAll('.y.axis.all')
			.call(yAxisAll);		 
		 
		 //thebrush(svg.selectAll(".extent"));
		
		//  selection
		//	.attr("y",   yScaleAll(filterVal[1]))     
	     //   .attr("height", yScaleAll(filterVal[0]) - yScaleAll(filterVal[1]) );

	   //   svg.selectAll(".extent")
		//	.attr("y",   yScale(filterVal[1]))     
	   //     .attr("height", yScale(filterVal[0]) - yScale(filterVal[1]) );

	    
	 }
	 
	 this.updateMaxSel = function(max){
		 yScaleSel.domain([0, max]);
			
		 svg.selectAll('.y.axis.sel')
			.call(yAxisSel);	
	 }
	 	 
	 this.showSelection = function(){
	 	//svg.selectAll(".grad")
		// .attr("y",  0)     
        //.attr("height", yScaleAll(f[0]) - yScaleAll(f[1]) );	
	 }

	 

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
    .attr("width", 30)
    .attr("height", height);
	
	svg.append("rect").attr("fill", "url(#legend_blue)")
	  	.attr("id","grad_b")
	  	.attr("x", 0)
	  	.attr("y", 0)
    	.attr("width", 30)
    	.attr("height", height);
	
	 svg.append("g").attr("class", "brush").call(thebrush)
		.selectAll("rect").attr("width", 30);

	svg.append("rect").attr("fill", "black")
	  .attr("class","grad")
	  .attr("x", space)
    .attr("y", 0)
    .attr("width", 30)
    .attr("height", height);

	var selection = svg.append("rect").attr("fill", "url(#legend)")
					  .attr("class","grad")
					  .attr("x", space)
	                  .attr("y", 0)
	                  .attr("width", 30)
	                  .attr("height", height);
	

}