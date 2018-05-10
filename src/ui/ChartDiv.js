/**
 * Div where a chart is to be inserted
 * @param parentdiv the id of parent's div, where this chart is to be inserted
 * @param divid the id of the div containing this chart
 * @param caption the title of the chart, to be shown in the header
 * @param n_total the number of possible values this chart has, to be shown in the filters box in the header
 * @constructor
 */

WGL.ChartDiv = function(parentdiv, divid, caption, n_total) {

    var newhtml= "<div class='border-top-white chart-container' id='chd-container-"+divid+"' data-name='"+caption.toLowerCase()+"'>" +
        "<div class='btn-minimize chart-header'  id=min"+divid+" > " +
        "<div class='chart-chevron'><i title='Open/close this' id='but"+divid+"' class='material-icons'>keyboard_arrow_up</i></div>" +
        "<div class='chart-drag-handle cursor-grab'><i title='Click and drag to change order' class='material-icons'>drag_handle</i></div>" +
        "<span class='chart-title' style='position: absolute; left: 50%'><text style='position: relative; left: -50%; top: -1px;' title='Open/close this chart' class='cursor-pointer'>"+caption+"</text></span>" +
        "<div class='chart-filters display-table'><i class='material-icons display-table-cell-center'>filter_list</i><text class='display-table-cell-center'><span class='chart-filters-selected'>0</span>/"+n_total+"</text><i title='Clear current selection' class='material-icons chart-filters-clean font-weight-bold display-table-cell-center cursor-pointer'>close</i></div>" +
        "</div>" +


        " <div id = "+divid+" class = 'vis-div chart-content' style='position: relative; background: white'></div>" +

        " </div>";

    $("#"+parentdiv).append(newhtml);

    var dimension;
    this.setDim = function(d){

        dimension = d;
    };



    this.change = function () {
        $(this).toggleClass('btn-plus');
        $("#" + divid).slideToggle();
        var el = $("#but" + divid);
        if (el.text() == "keyboard_arrow_down") {
            /*activate*/
            el.text("keyboard_arrow_up")
            if (dimension != undefined) {
                dimension.setVisible(true);
            }
        }
        else {
            /*deactivate*/
            el.text("keyboard_arrow_down")
            if (dimension != undefined) {
                dimension.setVisible(false);
                //dimension.render(WGL.getManager().num_rec);
                WGL.render();
            }
        }
    };

    this.destroy = function () {
        $("#chd-container-"+divid).remove();
    };

    $("#min"+divid).click(function(){

        $(this).toggleClass('btn-plus');
        $("#" + divid).slideToggle();
        var el = $("#but" + divid);
        if (el.text() == "keyboard_arrow_down") {
            /*activate*/
            el.text("keyboard_arrow_up")
            if (dimension != undefined) {
                dimension.setVisible(true);
            }
            el.closest("[id^=min]").addClass("min-open");
        }
        else {
            /*deactivate*/
            el.text("keyboard_arrow_down")
            if (dimension != undefined) {
                dimension.setVisible(false);
                //dimension.render(WGL.getManager().num_rec);
                WGL.render();
            }
        }
    });
};