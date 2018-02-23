/**
 * Tests for Linear and Ordinal filters
 */
QUnit.test("Filters", function( assert ) {
    var data = {
        pts: [100,100, 150,150, 100,150, 150,100],
        val1: [10, 20, 30, 40],
        dval1: [10, 20, 30, 40]
    };

    var charts = [];

    data.num = data.val1.length;

    WGL.init(data.num, '../', 'map');

    var val1 = {data: data.val1, domain: data.dval1, name:'val1', type:'ordinal', label : "val1"};

    var ch = new WGL.ChartDiv("right","ch", "Domestic");
    var dim = WGL.addOrdinalHistDimension(val1);
    WGL.addLinearFilter( val1, 8 , 'val1F');
    charts['domestic'] = new WGL.ui.StackedBarChart(val1, "ch", "val1",'val1F');

    WGL.addCharts(charts)

    WGL.initFilters();
    WGL.render();

    // filter in ordinal dim
    WGL.exactFilterDim('val1', 'val1F', 10, true);
    WGL.exactFilterDim('val1', 'val1F', 20, true);
    var pix = dim.readPixels();
    var b = pix[0].selected === 1 && pix[1].selected === 1 && pix[2].selected === 0 && pix[3].selected === 0;

    // clean ordinal dim
    WGL.filterDim('val1','val1F',[]);

    //evaluate results
    assert.ok(b, "Ordinal filter");

    // clean all from 'map' after test
    cleanTest();
});