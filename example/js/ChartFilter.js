
function ChartFilter(data) {
	this.filters = new Array();
	this.fitlerfun;
	this.context;
	i = 0;
	this.cf = crossfilter(data);
	this.ga = this.cf.groupAll();
	
	var that = this;
	/**
	 * Draw slider
	 */
	var weekday = new Array(7);
	weekday[0]=  "Sun";
	weekday[1] = "Mon";
	weekday[2] = "Tue";
	weekday[3] = "Wed";
	weekday[4] = "Thu";
	weekday[5] = "Fri";
	weekday[6] = "Sat";
	
	var road = new Array(10);
	road[0]="motorway";
	road[1]="primary";
	road[2]="secondary";
	road[3]="tertiary";
	road[4]="trunk";
	road[5]="road";
	road[6]="unclassified";
	road[7]="service";
	road[8]="pedestrial";
	road[9]="living street";
	
	 initFilter();
	
	/**
	 * Speeds
	 */
	this.speedDimension = this.cf.dimension(function(d) { return (Math.round(d.speed/2)*2); });
	speeds = this.speedDimension.group(function(d) { return Math.round(d);});
	drawSpeedChart(this.speedDimension, speeds, "#dc-speed-chart");
	
	/**
	 * Latitude+Longitude
	 */
	this.latDimension = this.cf.dimension(function(d) {return Math.round(d.y*100)/100;});
	this.lonDimension = this.cf.dimension(function(d) {return Math.round(d.x*100)/100;});

	/**
	 * Draw hours
	 */
	this.hourDimension = this.cf.dimension(function(d) {return (d.hours);});
    hours = this.hourDimension.group();
	
    drawDayChart(this.hourDimension, hours, "#dc-day-chart");


	/**
	 * Draw days
	 */
	this.dayDimension = this.cf.dimension(function(d) {return (d.day);});
    dayes = this.dayDimension.group();
	
   // drawDayChart(this.dayDimension, dayes, "#dc-day-chart");
    
	/**
	 * Time hours
	 */
	this.timeDimension = this.cf.dimension(function(d) {return Math.round(d.time/1000)*1000;});
   //hours = this.hourDimension.group();
	drawTimeSlider("#slider");
	
	
	/**
	 * Road dimension
	 */
	this.roadDimenstion = this.cf.dimension(function(d) {return (d.road);});
	drawRoadChart(this.roadDimenstion, this.roadDimenstion.group(), "#dc-road-chart");

   
	/**
	 * Unit dim
	 */
	this.unitDimension = this.cf.dimension(function(d) {return (d.unit_id);});
	var uGroup = this.unitDimension.group().reduce(ra, rm, ri);
	 drawUnitChart(this.unitDimension, uGroup, "#dc-unit-chart");
	  // chart =  d3.select("#dc-unit-chart").select('svg');
	 
    dc.renderAll();
    
     
    addXYLabels(d3.select("#dc-unit-chart").selectAll('svg'),"car speed [km/h]","car id");
    addXYLabels(d3.select("#dc-day-chart").selectAll('svg'),"hour of day","num. of pos.");
    addXYLabels(d3.select("#dc-speed-chart").selectAll('svg'),"car speed [km/h]","num. of pos.");
 


    //UnitsChart("#dc-unit-chart");

	/**
	 * 
	 * @param dim
	 * @param group
	 * @param div
	 * @returns
	 */
	function drawSpeedChart(dim, group, div){
		
		var x = d3.scale.linear().domain([0,130]);				
		lineChart = dc.barChart(div);
		lineChart.width(420)
	    .margins({top: 5, left: 50, right: 15, bottom: 35});
		lineChart.transitionDuration(10).height(150).dimension(
				dim).group(group).x(x)
		
		.on("filtered",
				function(chart, filter) {
					if (filter != null) {
						applyFilter(0, filter);
					}									
				})	
		.renderHorizontalGridLines(true).elasticY(true).xAxis().tickFormat(
				function(v) {
					return v;
				});
		lineChart.yAxis().ticks(5);
		lineChart.xAxis().tickFormat(
		        function (v) { return v});
		
		//lineChart.xAxisLabel("speed [km/h]");
		//lineChart.yAxisLabel("num. of records");
		
		
		return lineChart;

	}
	/**
	 * 
	 * @param dim
	 * @param group
	 * @param div
	 * @returns
	 */
	function drawDayChart(dim, group, div){
	
		dayChart = dc.barChart(div);
		dayChart.width(420).margins({top: 5, left: 50, right: 15, bottom: 35})
		.transitionDuration(10).height(150).dimension(
				dim).x(d3.scale.linear().domain([ 0, 24 ]))
				.renderHorizontalGridLines(true)
				.elasticY(true)
				.group(group)
				.on("filtered",function(chart, filter) {
						if (filter != null) {							
							applyFilter(1, filter);
						}});
		dayChart.yAxis().ticks(5);
		//dayChart.xAxisLabel("hour of the day");
		//dayChart.yAxisLabel("num. of records");
		return dayChart;
	}
	
	/**
	 * 
	 * @param dim
	 * @param group
	 * @param div
	 * @returns
	 */
	function drawRoadChart(dim, group, div){
		/**
		 * roadchart
		 */
		pieChart = dc.pieChart(div);
		pieChart.transitionDuration(200).height(160).width(430).radius(75)
	    .dimension(dim)
	    .group(group)
	    .minAngleForLabel(0.51).on("filtered",function(chart, filter) {
			if (filter != null) {							
				applyFilter(3, [filter,filter]);
			}
			else {
				applyFilter(3, [-Number.MAX_VALUE,Number.MAX_VALUE]);
			}
	    });
		
		pieChart.label(function (p) {
			return road[p.data.key];
		});
		
		return pieChart;
	}
	
	function drawUnitChart(dim, group, div){
		var chart = dc.rowChart(div);
		chart.width(420).margins({top: 5, left: 50, right: 15, bottom: 35})
		.transitionDuration(10).height(450)
	    .dimension(dim)
	    .group(group).valueAccessor(function(p) {
	    	if (p.value.count > 0 ) { 
	    		return p.value.total / p.value.count 	    		
	    	} else {return 0;}
		}).on("filtered",function(chart, filter) {
			if (filter != null) {							
				applyFilter(4, [filter,filter]);
			}
			else {
				applyFilter(4, [-Number.MAX_VALUE,Number.MAX_VALUE]);
			}
	    });
		   //chart =  d3.select("#dc-unit-chart").select('svg');
		   
		  
		return chart;
		//chart.xAxisLabel("speed [km/h]");
		//chart.yAxisLabel("car id");
		
		
		
	}
	
	function drawMapChart(dim, group, div){
		var chart = dc.rowChart(div);
		chart.width(420).margins({top: 5, left: 50, right: 15, bottom: 35})
		.transitionDuration(10).height(450)
	    .dimension(dim)
	    .group(group).valueAccessor(function(p) {
			return p.value.total / p.value.count;
		}).on("filtered",function(chart, filter) {
			if (filter != null) {							
				applyFilter(4, [filter,filter]);
			}
			else {
				applyFilter(4, [-Number.MAX_VALUE,Number.MAX_VALUE]);
			}
	    });
	}
	
	function drawTimeSlider(div){
		this.min = that.timeDimension.bottom(1)[0].time ;
		this.max = that.timeDimension.top(1)[0].time ;

		
		var slider = $(div).dragslider({
			animate : true,
			range : true,
			rangeDrag : true,
			min : this.min ,
			max : this.max,
			slide : function(event, ui) {
				
				var i = ui.values[0]-min;
				drawLabels("#sllabel", i,  ui.values[0]);	
				
		    	i = ui.values[1]-min;
			    drawLabels("#srlabel", i,   ui.values[1]);
			
				// pointnum= ( pointnum*ui.value/100);
				that.timeDimension.filter([ ui.values[0] , ui.values[1] ])
				applyFilter(2, [ ui.values[0] , ui.values[1] ]);
				dc.redrawAll();
			}
		})

		slider.dragslider({ step: (this.max-this.min)/200});
		
		var drawLabels =  function(id, i, label){
			var vals = max - min;
			d = new Date(label*1000);
			sd = d.getFullYear() + " "+weekday[d.getDay()]+" "+d.getHours()+":"+d.getMinutes();
		    $(id).html(sd);
	        $(id).css('left', (i/vals*100) + '%');
		} 
		
		$(div).dragslider("option", "values", [ min, max ]);
		drawLabels("#sllabel",0, min);
		drawLabels("#srlabel",max-min, max);
	}
	/**
	 * 
	 * @param id
	 * @param f
	 */
	function applyFilter(id, f){
		if (that.filters ==null){
			initFilter();
		}
		that.filters[id] = f;
		if (that.filterfun !=null){		
			that.filterfun.call(that.context,that.filters);
			}
		
	}
	
	function initFilter(){
		num_filters = 5;
		fil = new Array(num_filters);
		for (i=0; i< fil.length; i++){
			f = [-Number.MAX_VALUE,Number.MAX_VALUE];
			that.filters[i]=f;
		}
		//that.filterfun.call(that.context,filters);
	}
	
	function addXYLabels(chart, xlabel, ylabel){
		
		    chart.append("text")
		    .attr("class", "x-axis-label")
		    .attr("text-anchor", "middle")
		    .attr("x", chart[0][0].scrollWidth/2)
		    .attr("y", chart[0][0].scrollHeight-3)
		    .text(xlabel);
		    
		    chart.append("text")
		    .attr("class", "y-axis-label")
		    .attr("text-anchor", "left")
		    .attr("transform", "rotate(270,12, "+(+chart[0][0].scrollHeight/2)+")")
		    .attr("x", 0)
		    .attr("y", chart[0][0].scrollHeight/2)
		    .text(ylabel); 
	}
	
}	

ChartFilter.prototype.onFiltered = function(context, fun){
	this.filterfun = fun;
	this.context = context;
}

	
var ra = function reduceAdd(p, v) {
	++p.count;
	p.total += v.speed;
	return p;
}

var rm = function reduceRemove(p, v) {
	--p.count;
	p.total -= v.speed;
	return p;
}

var ri = function reduceInitial() {
	return {
		count : 0,
		total : 0
	};
}
