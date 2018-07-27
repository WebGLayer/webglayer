/**
 * Div where a chart is to be inserted
 * @param parentdiv the id of parent's div, where this chart is to be inserted
 * @param divid the id of the div containing this chart
 * @param caption the title of the chart, to be shown in the header
 * @param n_total the number of possible values this chart has, to be shown in the filters box in the header
 * @constructor
 */

WGL.ChartDiv = function(parentdiv, divid, dimension_name, caption, n_total) {

    let newhtml;

    if(typeof n_total === "undefined") {
        newhtml = "<div class='border-top-white chart-container' id='chd-container-" + divid + "' data-name='" + dimension_name.toLowerCase() + "'>" +
            "<div class='btn-minimize chart-header'  id=min" + divid + " > " +
            "<div class='chart-chevron'><i id='but" + divid + "' class='material-icons'>keyboard_arrow_up</i></div>" +
            "<div class='chart-drag-handle cursor-grab'><i title='Click and drag to change order' class='material-icons'>drag_handle</i></div>" +
            "<span class='chart-title' style='position: absolute; left: 50%'><text style='position: relative; left: -50%; top: -1px;' title='Open/close this chart' class='cursor-pointer'>" + caption + "</text></span>" +
            "<div class='chart-filters display-table'><i title='Clear current selection' class='material-icons chart-filters-clean font-weight-bold display-table-cell-center cursor-pointer'>close</i></div>" +
            "</div>" +
            " <div id = " + divid + " class = 'vis-div chart-content' style='position: relative; background: white'></div>" +
            " </div>";
    } else if(n_total == null) {
        newhtml = "<div class='border-top-white chart-container' id='chd-container-" + divid + "' data-name='" + dimension_name.toLowerCase() + "'>" +
            "<div class='btn-minimize chart-header'  id=min" + divid + " > " +
            "<div class='chart-chevron'><i id='but" + divid + "' class='material-icons'>keyboard_arrow_up</i></div>" +
            "<div class='chart-drag-handle cursor-grab'><i title='Click and drag to change order' class='material-icons'>drag_handle</i></div>" +
            "<span class='chart-title' style='position: absolute; left: 50%'><text style='position: relative; left: -50%; top: -1px;' title='Open/close this chart' class='cursor-pointer'>" + caption + "</text></span>" +
            "</div>" +
            " <div id = " + divid + " class = 'vis-div chart-content' style='position: relative; background: white'></div>" +
            " </div>";
    } else {
        newhtml = "<div class='border-top-white chart-container' id='chd-container-" + divid + "' data-name='" + dimension_name.toLowerCase() + "'>" +
            "<div class='btn-minimize chart-header'  id=min" + divid + " > " +
            "<div class='chart-chevron'><i id='but" + divid + "' class='material-icons'>keyboard_arrow_up</i></div>" +
            "<div class='chart-drag-handle cursor-grab'><i title='Click and drag to change order' class='material-icons'>drag_handle</i></div>" +
            "<span class='chart-title' style='position: absolute; left: 50%'><text style='position: relative; left: -50%; top: -1px;' title='Open/close this chart' class='cursor-pointer'>" + caption + "</text></span>" +
            "<div class='chart-filters display-table'><i class='material-icons display-table-cell-center'>filter_list</i><text class='display-table-cell-center'><span class='chart-filters-selected'>0</span>/" + n_total + "</text><i title='Clear current selection' class='material-icons chart-filters-clean font-weight-bold display-table-cell-center cursor-pointer'>close</i></div>" +
            "</div>" +
            " <div id = " + divid + " class = 'vis-div chart-content' style='position: relative; background: white'></div>" +
            " </div>";
    }

    $("#"+parentdiv).append(newhtml);

    let dimension;
    this.setDim = function(d){
        dimension = d;
    };

    this.change = function () {
        $(this).toggleClass('btn-plus');
        $("#" + divid).slideToggle();
        const el = $("#but" + divid);
        if (el.text() === "keyboard_arrow_down") {
            /*activate*/
            el.text("keyboard_arrow_up");
            if (dimension !== undefined) {
                dimension.setVisible(true);
            }
        }
        else {
            /*deactivate*/
            el.text("keyboard_arrow_down");
            if (dimension !== undefined) {
                dimension.setVisible(false);
                WGL.render();
            }
        }

        if($(".link-permalink").length > 0) {
            $(".link-permalink").trigger("permalink:change");
        }
    };

    this.destroy = function () {
        $("#chd-container-"+divid).remove();
    };

    $("#min"+divid).click(function(){

        $(this).toggleClass('btn-plus');
        $("#" + divid).slideToggle();
        const el = $("#but" + divid);
        if (el.text() === "keyboard_arrow_down") {
            /*activate*/
            el.text("keyboard_arrow_up");
            if (dimension !== undefined) {
                dimension.setVisible(true);
            }
        }
        else {
            /*deactivate*/
            el.text("keyboard_arrow_down");
            if (dimension !== undefined) {
                dimension.setVisible(false);
                WGL.render();
            }
        }

        if($(".link-permalink").length > 0) {
            $(".link-permalink").trigger("permalink:change");
        }
    });
};