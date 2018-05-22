WGL.FilterListChartDiv = function(parentdiv, chart, caption, n_total) {

    const divid = chart.getDivId();

    const footerhtml = "<div class='border-top-white width-inherit hide' id='chd-container-footer-"+divid+"'>" +
        "<div class='btn-minimize chart-header-footer'  id=min-footer-"+divid+" > " +
        "<span class='chart-title-footer'><text title='Go to this chart' class='cursor-pointer'>"+caption+"</text></span>" +
        "<div class='chart-filters chart-filters-footer display-table'><text class='display-table-cell-center chart-filters-text'><span class='chart-filters-selected'>0</span>/"+n_total+"</text><i title='Clear current selection' class='material-icons chart-filters-clean display-table-cell-center cursor-pointer'>close</i></div>" +
        "</div>" +
        "</div>";

    $("#"+parentdiv).append(footerhtml);

    let current_chart = chart;

    let dimension;
    this.setDim = function(d){
        dimension = d;
    };

    let visible = false;
    this.setVisible = function(b) {
        visible = b;
    };
    this.getVisible = function() {
        return visible;
    };

    this.change = function () {
        if($("#min"+divid).hasClass("btn-plus")) {
            $("#min"+divid).click();
        }
        if(!visibleY($("#"+divid))) {
            $("#right").scrollTop($("#min" + divid).parent().position().top);
        }
    };

    this.destroy = function () {
        $("#chd-container-"+divid).remove();
        $("#chd-container-footer-"+divid).remove();
    };

    $("#chd-container-footer-"+divid+" .chart-filters-clean").click(function() { current_chart.clearSelection() });

    $("#min-footer-"+divid).click(function(){

        if($("#min"+divid).hasClass("btn-plus")) {
            $("#min"+divid).click();
        }
        if(!visibleY($("#"+divid)[0])) {
            $("#right").scrollTop($("#min" + divid).parent().position().top);
        }
    });
};
