/**
 * Created by kolovsky on 2.5.17.
 */
QUnit.test("Delete dimensions", function( assert ) {
    var data = {
        pts: [10,10,30,30,50,30],
        value: [10, 20, 30]
    };

    WGL.init(data.num,'../', 'map');
    WGL.addHeatMapDimension(data.pts, 'heatmap');
    WGL.addMapDimension(data.pts, 'themap');

    var set = {data: data.value,  min:0, max:100, num_bins: 3, name: 'value',type:'linear', label :"value"};
    WGL.addLinearHistDimension(set);
    WGL.addLinearFilter(set, 3, 'valueF');

    WGL.addExtentFilter();

    WGL.cleanAll();
    var len = 0;
    for (var key in WGL._dimensions){
        len += 1;
    }
    assert.equal(len, 0, "length of the WGL._dimension array after clean POINT");

    WGL.addHeatMapDimension(data.pts, 'heatmap');
    WGL.addMapDimension(data.pts, 'themap');

    var set = {data: data.value,  min:0, max:100, num_bins: 3, name: 'value',type:'linear', label :"value"};
    var test_dim = WGL.addLinearHistDimension(set);
    WGL.addLinearFilter(set, 3, 'valueF');

    charts = [];
    var chd1 = new WGL.ChartDiv("chart-tests","ch1", "Test Chart");
    chd1.setDim(test_dim);
    charts['value'] = new  WGL.ui.StackedBarChart(set, "ch1", "Popis", 'valueF');
    WGL.addCharts(charts);

    WGL.addExtentFilter();
    WGL.initFilters();

    WGL.cleanAll(true);
    var len = 0;
    for (var key in WGL._dimensions){
        len += 1;
    }
    assert.equal(len, 0, "length of the WGL._dimension array after cleanAll(true)");
    // smazano i HTML?
    assert.equal(d3.select("#chart-tests").html(), "", "cleaning html code");

    var det_TA = WGL.utils.array2TA(data.value);
    WGL.getManager().addDataBuffer(det_TA, 1, 'dimension', 10, 30);

    var heatLines = WGL.addMapLineDimension(data.pts, 'themap2');
    heatLines.setValuesBuffer('dimension');

    WGL.cleanAll(true);

    var len = 0;
    for (var key in WGL._dimensions){
        len += 1;
    }
    assert.equal(len, 0, "length of the WGL._dimension array after clean LINE");

    cleanTest();

});