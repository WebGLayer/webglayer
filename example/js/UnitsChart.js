function UnitsChart(div) {
	var dataset = [ 5, 10, 15, 20, 25 ];
	var svg = d3.select(div)
	.append("svg")
    .attr("width", 100)
    .attr("height", 100); // <-- and here!
	
	svg.selectAll("rect")
	.data(dataset)
	.enter()
	.append("rect")
	.attr("x", 0)
	.attr("y", 0)
	.attr("width", 20)
	.attr("height", 100)
	.attr("class","bar stack0")
	.attr("x", function(d, i) {
		return i * 21; //Bar width of 20 plus 1 for padding
		});
}