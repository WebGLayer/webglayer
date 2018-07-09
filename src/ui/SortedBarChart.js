WGL.ui.SortedBarChart = function(m, div_id, x_label, filterId, params, num_bins = m.domain.length) {

    const that = this;

    let w;
    let h;
    let margin;
    let tooltip_format; // function to format the tooltips showed when hovering over the chart
    let text; // text to be exhibited below the chart, as a note about the data for example
    let numbers_formating;
    let rotate_x;

    // variables to subcategory
    let subcategory_mask;
    let new_to_old;
    let isCategory = false;

    if (params === null){
        w = 500;
        h = 215;
        margin = {
            top : 20,
            right : 70,
            bottom : 65,
            left : 60
        };
        rotate_x = false;
        tooltip_format = function(val) {return val;}
        text = "";
        numbers_formating = "s";
    } else {
        w=(params.w ? params.w : 500);
        h=(params.h ? params.h : 215);
        margin=(params.margin ? params.margin : margin = {
            top : 20,
            right : 70,
            bottom : 65,
            left : 60
        });
        rotate_x=params.rotate_x;
        tooltip_format = (params.tooltip_format ? params.tooltip_format : function(val) {return val});
        text = (params.text ? params.text : "");
        numbers_formating = (params.numbers_formatting ? params.numbers_formatting : "s");
    }

    if(screen.width < 1366) {
        w = w*0.8;
    }

    if (num_bins !== m.domain.length){
        isCategory = true;
    }

    let dataset;

    let dataset_length;
    let xScale;
    let yScale;
    let colorScale;
    let xAxis;
    let yAxis;
    let bars;
    let svg;
    let chart;
    let active_group = 2;
    let of_click = [];
    let dragStart = -1;
    let dragEnd = -1;
    const lineHeight = 9; //minimum number of pixels in height that should be available to show a number label over a bar in the chart
    const labelsMaxColumns = 12; //maximum allowed number of columns in a chart to show number labels
    let selected = 0;

    const width = w - margin.left - margin.right;
    const height = h - margin.top - margin.bottom;

    let svgbw = "";
    let bw = 0.0;

    let showNumberLabels = true;

    let category = [];
    dataset_full = [];

    this.y_label = "detections";

    this.showBarLabel = function(b) {
        showNumberLabels = b;
    };

    this.getDivId = function() {
        return div_id;
    };

    this.getXLabel = function() {
        return x_label;
    };

    this.getDatasetLength = function() {
        return dataset_length;
    };

    this.setOrdinalXScale = function(){
        xScale = d3.scale.ordinal().domain(category).rangeBands([ 0, width ],0.03,0.015);
        bw =xScale.rangeBand();
        svgbw= "h"+bw+"V";
        type = 'ordinal';
        return this;
    };

    this.xformat = function(d){
        return d;
    };

    const yformat = d3.format(numbers_formating);

    const yformatBars = d3.format(".3s");

    let arrowTan = 0.6;
    let arrowHeight = 0.0;
    /**
     * Set arrow height. If target height in px is higher then margin.top height is set to margin.top.
     * @param tan height in tan (45° is tan 1)
     */
    this.setArrowHeight = function (tan) {
        arrowTan = tan;
        arrowHeight = arrowTan * (bw/2);
        if (arrowHeight > margin.top){
            arrowHeight = margin.top;
        }
    };

    this.init = function() {

        this.setOrdinalXScale();

        //set arrow height for first
        this.setArrowHeight(arrowTan);

        const cols = [
            "#ffa91b",
            "#8cc5f9",
            "#666666"
        ];

        const classes = [
            [ "2", "out", cols[2] ],
            [ "1", "unselected", cols[1] ],
            [ "0", "selected", cols[0] ]
        ];

        const zoom_button_bg = "#e3e4e4";

        colorScale = d3.scale.ordinal().range(cols);

        yScale = d3.scale.linear().domain([ 0, dataset.max[2] ]).range(
            [ height, 0 ]);

        colorScale.domain([ "out", "unselected", "selected" ]);

        xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(this.xformat);

        //yAxis = d3.svg.axis().scale(yScale).orient("left");
        yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(yformat); //changes

        svg = d3.select("#" + div_id).append("svg").attr("class", "sorted-chart").attr("width",
            width + margin.left + margin.right).attr("height",
            height + margin.top + margin.bottom).append("g").attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")");

        const title = svg.append("title")
            .attr("class", "tooltip")
            .style("opacity", 0);

        chart = svg.select('.chart');

        if(rotate_x) {
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")
                .attr("y", 6)
                .attr("x", -7)
                .attr("dy", ".35em")
                .attr("transform", "rotate(300)")
                .style("text-anchor", "end")
                .style("text-transform", "capitalize");
        } else {
            svg.append("g").attr("class", "x axis").attr("transform",
                "translate(0," + height + ")").call(xAxis).append("text")
                .attr("y", "3.5em").attr("x",
                width /2 ).style("text-anchor", "end");
        }

        svg.append("g").attr("class", "y axis").call(yAxis).append("text")
            .attr("transform", "rotate(270)").attr("y", "-4.5em").attr("x",
            "-2em").attr("class", "y-axis-label").style("text-anchor", "end").text(this.y_label); //changes

        dataset_length = dataset.length;

        function onMouseOver(e) {

            // Show tooltip on the bar
            let xPosition = e.offsetX;
            if(isChrome()) {
                xPosition-=margin.left;
            }
            const group = Math.floor(xPosition / (width / category.length));

            if(typeof category[group] === "undefined") {
                return;
            }

            title.transition()
                .duration(200)
                .style("opacity", .9);

            const x_labels = $("#"+div_id).find(".x.axis text");

            const label = ($(x_labels[group]).text() !== '' ? $(x_labels[group]).text() : category[group].val);

            const value = tooltip_format(label.toString().replace(/[^\s]+/g, function(word) {
                return word.replace(/^./, function(first) {
                    return first.toUpperCase();
                })
            }));

            title.html(value)
                .style("left", (e.pageX) + "px")
                .style("top", (e.pageY) + "px");

            for(let i=0; i<dataset.length; i++) {
                if(dataset[i]['val'] === category[group]) {

                    // Change bar color on mouse hover
                    const d = barPathHover([dataset[i]]);
                    svg.selectAll(".hover.bar").attr("d", d);

                    break;
                }
            }
        }

        function onMouseLeave(e) {
            // Return bar to default color
            svg.selectAll(".hover.bar").attr("d", null);
        }

        bars = svg.selectAll(".bar").data(["selected", "unselected", "out", "hover"])
            .enter().append("path").attr("class", function(d) {
                return d + " foreground bar ";
            }).datum(dataset);

        if(dataset.length <= labelsMaxColumns
            && showNumberLabels) {

            svg.selectAll(".text")
                .data(dataset)
                .enter()
                .append("text")
                .attr("class", "label selected")
                .attr("x", (function (d) {
                    return xScale(d.val) + bw / 2;
                }))
                .attr("y", function (d) {
                    return yScale(d.selected) + 1;
                })
                .attr("dy", "1em")
                .text(function (d) {
                    if(d.selected != 0) {
                        return yformatBars(d.selected);
                    } else {
                        return "";
                    }
                });

            svg.selectAll(".text")
                .data(dataset)
                .enter()
                .append("text")
                .attr("class", "label unselected")
                .attr("x", (function (d) {
                    return xScale(d.val) + bw / 2;
                }))
                .attr("y", function (d) {
                    return yScale(d.unselected) + 1;
                })
                .attr("dy", "1em")
                .text(function (d) {
                    if(d.unselected !== 0) {
                        return yformatBars(d.unselected);
                    } else {
                        return "";
                    }
                });

            svg.selectAll(".text")
                .data(dataset)
                .enter()
                .append("text")
                .attr("class", "label out")
                .attr("x", (function (d) {
                    return xScale(d.val) + bw / 2;
                }))
                .attr("y", function (d) {
                    return yScale(d.out+d.selected+d.unselected) + 1;
                })
                .attr("dy", "1em")
                .text(function (d) {
                    if(d.out!= 0) {
                        return yformatBars(d.out);
                    } else {
                        return "";
                    }
                });
        }

        svg.selectAll(".foreground.bar").attr("clip-path",
            "url(#clip-" + div_id + ")");

        /* data */
        dataset.forEach(function(d) {
            let y0 = 0;
            d.levels = colorScale.domain().map(function(name) {
                return {
                    name : name,
                    y0 : y0,
                    y1 : y0 += +d[name]
                };
            });
            d.total = 0;
        });

        if(text.length > 0) {
            svg.append("foreignObject").attr({
                "x": 0,
                "y": height + 40,
                "width": 400,
                "height": 50
            }).append("xhtml:div").append("div").attr("id", "text-"+m.name)
                .html(text);
        }

        /**
         * legend and scaling
         */
        const legendRect = svg.append("g").attr("class", "l").selectAll('rect')
            .data(classes);

        const legend_x = w - 110;
        const legend_y = 0;

        legendRect.enter().append("foreignObject").attr({
            "x": legend_x,
            "y": function(d) {return (legend_y + d[0] * 44)},
            "width": 36,
            "height": 36
        }).append("xhtml:div").append("div").attr("id", function(d) {return div_id+ d[0];})
            .attr("style", function(d) {return "background-color:" + zoom_button_bg})
            .attr("title", function(d) {return "Zoom on '"+d[1]+"' data"})
            .attr("class", function(d) {return "legend-"+d[1]})
            .classed('legend-scale',true)
            .append("i")
            .classed('material-icons', true)
            .classed('md-36', true)
            .attr("style", function(d) {return "color:"+d[2]})
            .text("all_out")
            .on(
                "click",
                d => {
                    const el = d3.select("#"+div_id + d[0]);
                    if(el.classed('select-legend-scale')) {
                        el.classed('select-legend-scale', false);
                        active_group = 2;
                    } else {
                        d3.selectAll("div.legend-scale").classed('select-legend-scale', false);
                        el.classed('select-legend-scale', true);
                        active_group = parseInt(d[0]);
                    }

                    WGL.updateCharts();
                });

        const help = d3.select("#"+div_id).append("div").style("position", "absolute").style("left", (legend_x + margin.left) + "px").style("top", (3*44 + margin.top) + "px").classed('ii',true).append("i").classed('material-icons', true).text("help");
        const tooltip_content =
            "<div style='width: 490px'>" +
            "<div class='tooltipster-header'><div class='tooltipster-title'>Chart legend</div><div class='tooltipster-close'><i class='material-icons'>close</i></div></div>" +
            "<div class='tooltipster-text'>" +
            "<div>Select data segments by clicking or dragging directly in the bar charts. Combine multiple filters for deeper insights.</div>" +
            "<div class='display-table width-100 margin-bottom-5 margin-top-20'><span class='display-table-cell-center tooltipster-legend-out'></span><span class='display-table-cell-center tooltipster-legend-text'>Data <b>outside</b> the current map view</span></div>" +
            "<div class='display-table width-100 margin-bottom-5'><span class='display-table-cell-center tooltipster-legend-unselected'></span><span class='display-table-cell-center tooltipster-legend-text'><b>Unselected</b> data within the current map view</span></div>" +
            "<div class='display-table width-100 margin-bottom-5'><span class='display-table-cell-center tooltipster-legend-selected'></span><span class='display-table-cell-center tooltipster-legend-text'><b>Selected</b> data within the current map view</span></div>" +
            "<div class='display-table width-100 margin-bottom-5 margin-top-20'><span class='display-table-cell-center tooltipster-legend-zoom-to'><i class='material-icons md-40 vertical-allign-middle'>all_out</i></span><span class='display-table-cell-center tooltipster-legend-text'>Click on the 'zoom to' icon to adjust the chart scale to the 'selected', 'unselected' or 'outside' the map data </span></div>" +
            "</div>" +
            "</div>";
        $(help).tooltipster({
            content: tooltip_content,
            contentAsHTML: true,
            theme: 'tooltipster-light',
            trigger: 'click',
            interactive: 'true',
            autoClose: 'false',
            side: 'left',
            functionReady: function() {
                $('.tooltipster-close').click(function() {
                    $(help).tooltipster('hide');
                });
            }

        });

        $("#" + div_id).on("mousemove", function(e) {
            if(e.target.tagName === "rect"
                && e.target.className.baseVal === "background") {
                onMouseOver(e);
            }
        });

        $("#" + div_id + " rect.background").on("mouseleave", function(e) {
            onMouseLeave(e);
        });

        $("#chd-container-"+div_id+" .chart-filters-clean").off("click").on("click", function(e) {
            e.stopPropagation();
            that.clearSelection();
        });

        function resizeExtent(selection) {
            selection.attr("class", "sorted-chart");
        }

    };

    this.clean = function (cleanChartDiv) {
        cleanChartDiv = cleanChartDiv || false;
        if (cleanChartDiv){
            d3.select("#chd-container-" + div_id).remove();
        }
        else {
            d3.select("#" + div_id).selectAll('*').remove();
        }
    };

    // Create bars

    this.update = function(data) {

        if(dataset_full.length === 0) {
            dataset_full = data.slice(0);
        }

        if(isCategory) {
            category = this.createSortedCategories(data);

            this.createSubcategoryMask(category);
            this.setOrdinalXScale();

            const xAxisLabels = $("#"+div_id + " .x.axis text");
            for(let i=0; i<xAxisLabels.length; i++) {
                $(xAxisLabels[i]).text(category[i]);
            }
        }

        // filtration for category subset
        if (isCategory){
            let fdata = [];
            for(let i = 0; i<data.length; i++){
                if (subcategory_mask[i]){
                    fdata.push(data[i]);
                }
            }
            // compute new maximum value
            let max0 = 0;
            let max1 = 0;
            let max2 = 0;
            fdata.forEach((d) => {
                if (d.selected > max0){
                    max0 = d.selected;
                }
                if (d.selected + d.unselected > max1){
                    max1 = d.selected + d.unselected;
                }
                if (d.selected + d.unselected + d.out > max2){
                    max2 = d.selected + d.unselected + d.out;
                }
            });
            fdata.max = {0: max0, 1: max1, 2: max2, 3: 0};
            data = fdata;
        }

        if (dataset == null) {
            dataset = Array.prototype.slice.call(data);
            dataset.max = data.max;
            this.init();
            d3.select("#"+div_id).selectAll("rect").style("cursor", "pointer")
        }
        dataset = Array.prototype.slice.call(data);

        dataset.max = data.max;

        bars.datum(dataset);

        calcBar();

        updateLabels();
    };

    function updateLabels() {

        if(!showNumberLabels) {
            return;
        }

        const selected = $("#" + div_id + " .label.selected");
        const out = $("#" + div_id + " .label.out");
        const unselected = $("#" + div_id + " .label.unselected");

        let parent;

        for(let i=0; i<unselected.length; i++) {

            let textContentSelected = yformatBars(dataset[i].selected);
            let xSelected = xScale(dataset[i].val) + bw / 2;
            let ySelected = yScale(dataset[i].selected) + 1;

            parent = d3.select(selected[i].parentNode);
            d3.select(selected[i]).remove();

            if (textContentSelected !== 0
                && (height - ySelected > lineHeight)) {

                parent.append("text")
                    .attr("class", "label selected")
                    .attr("x", xSelected)
                    .attr("y", ySelected)
                    .attr("dy", "1em")
                    .text(textContentSelected);

            } else {
                parent.append("text")
                    .attr("class", "label selected")
                    .attr({ "display": "none" })
                    .attr("x", xSelected)
                    .attr("y", ySelected)
                    .attr("dy", "1em")
                    .text(textContentSelected);
            }

            let textContentUnselected = yformatBars(dataset[i].unselected + dataset[i].selected);
            let xUnselected = xScale(dataset[i].val) + bw / 2;
            let yUnselected = yScale(dataset[i].unselected + dataset[i].selected) + 1;

            parent = d3.select(unselected[i].parentNode);
            d3.select(unselected[i]).remove();

            if (dataset[i].unselected !== 0
                && (height - yUnselected > lineHeight)
                && (ySelected - yUnselected > lineHeight)) {

                parent.append("text")
                    .attr("class", "label unselected")
                    .attr("x", xUnselected)
                    .attr("y", yUnselected)
                    .attr("dy", "1em")
                    .text(textContentUnselected);

            } else {
                parent.append("text")
                    .attr("class", "label unselected")
                    .attr({ "display": "none" })
                    .attr("x", xUnselected)
                    .attr("y", yUnselected)
                    .attr("dy", "1em")
                    .text(textContentUnselected);
            }

            let textContentOut = yformatBars(dataset[i].out + dataset[i].selected + dataset[i].unselected);
            let xOut = xScale(dataset[i].val) + bw / 2;
            let yOut = yScale(dataset[i].out+dataset[i].selected+dataset[i].unselected) + 1;

            parent = d3.select(out[i].parentNode);
            d3.select(out[i]).remove();

            if (dataset[i].out !== 0
                && (height - yOut > lineHeight)
                && (yUnselected - yOut > lineHeight)
                && (ySelected - yOut > lineHeight)) {

                parent.append("text")
                    .attr("class", "label out")
                    .attr("x", xOut)
                    .attr("y", yOut)
                    .attr("dy", "1em")
                    .text(textContentOut);

            } else {
                parent.append("text")
                    .attr("class", "label out")
                    .attr({ "display": "none" })
                    .attr("x", xOut)
                    .attr("y", yOut)
                    .attr("dy", "1em")
                    .text(textContentOut);
            }

        }
    }

    function calcBar(){
        yScale = d3.scale.linear().domain(
            [ 0, dataset.max[active_group] ]).range(
            [ height, 0 ]);
        yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(yformat); //changes format
        svg.selectAll('.y.axis').transition().duration(30)
            .call(yAxis);

        svg.selectAll(".selected.bar").attr("d", barPathSelected);
        svg.selectAll(".unselected.bar").attr("d", barPathUnselected);
        svg.selectAll(".out.bar").attr("d", barPathOut);
    }

    function barPathHover(groups) {
        let path = [], i = -1, n = groups.length;
        while (++i < n) {
            let d = groups[i];
            let points = (d.selected === 0 ? d.unselected : d.selected);
            path.push("M", xScale(d.val), ",", height, "V", yScale(points),
                svgbw, height);
        }
        return path.join("");
    }

    function barPathSelected(groups) {
        let path = [], i = -1, n = groups.length;
        while (++i < n) {
            let d = groups[i];
            path.push("M", xScale(d.val), ",", height, "V", yScale(d.selected),
                svgbw, height);
        }
        return path.join("");
    }

    function barPathUnselected(groups) {
        let path = [], i = -1, n = groups.length;
        while (++i < n) {
            let d = groups[i];
            if (yScale(d.selected) + yScale(d.unselected) - height < 0){ //&& yScale(d.selected) > 0.1
                path.push("M", xScale(d.val), ",", yScale(d.selected),
                    "V",0,
                    "L",xScale(d.val) + bw/2, ",",-arrowHeight,
                    "L",xScale(d.val) + bw,",",0,
                    "V",yScale(d.selected)
                );
            }
            else{
                path.push("M", xScale(d.val), ",", yScale(d.selected), "V",
                    yScale(d.selected) + yScale(d.unselected) - height, svgbw,
                    yScale(d.selected));
            }
        }
        return path.join("");
    }

    function barPathOut(groups) {
        let path = [],
            i = -1,
            n = groups.length;
        while (++i < n) {
            let d = groups[i];
            let start = yScale(d.selected) + yScale(d.unselected) - height;
            if (start + yScale(d.out) - height < 0 && start > -0.1) {
                path.push("M", xScale(d.val), ",", start,
                    "V", 0,
                    "L", xScale(d.val) + bw / 2, ",", -arrowHeight,
                    "L", xScale(d.val) + bw, ",", 0,
                    "V", start
                );
            } else if (start <= -0.1) {
                path.push("");
            } else {
                path.push("M", xScale(d.val), ",", start, "V", start +
                    yScale(d.out) - height, svgbw, start);
            }

        }
        return path.join("");
    }

    this.clearSelection = function() {
        of_click = [];
        selected = 0;
        this.brush.clear();
        WGL.filterDim(m.name, filterId, []);
        updateFiltersHeader();
    };

    this.createSortedCategories = function(data) {

        let dataset_copy = data.slice(0);

        category = [];

        if(active_group === 0) {
            dataset_copy.sort((a, b) => {
                if ((a.selected) < (b.selected)) { return 1; }
                if ((a.selected) > (b.selected)) { return -1; }
                return 0;

            });
        } else if(active_group === 2) {
            dataset_copy.sort((a, b) => {
                if (((a.unselected + a.selected + a.out) < (b.unselected + b.selected + b.out) )) { return 1; }
                if (((a.unselected + a.selected + a.out) > (b.unselected + b.selected + b.out) )) { return -1; }
                return 0;

            });
        } else {
            dataset_copy.sort((a, b) => {
                if (((a.unselected + a.selected) < (b.unselected + b.selected) )) { return 1; }
                if (((a.unselected + a.selected) > (b.unselected + b.selected) )) { return -1; }
                return 0;
            });
        }

        if (dataset_copy.length > 0) {
            for (let i = 0; i < num_bins; i++) {
                if (typeof dataset_copy[i] !== "undefined") {
                    category.push(dataset_copy[i]['val']);
                } else {

                }
            }
        }

        return category;
    };

    this.createSubcategoryMask = function (category) {
        subcategory_mask = new Array(m.domain.length);
        new_to_old = new Array(category.length);

        let j = 0;
        for(let i = 0; i<m.domain.length; i++){
            let pp = true;
            category.forEach((v) => {
                if (v === m.domain[i]){
                    subcategory_mask[i] = true;
                    new_to_old[j] = i;
                    j++;
                    pp = false;
                }
            });
            if (pp){
                subcategory_mask[i] = false;
            }
        }
    };

};