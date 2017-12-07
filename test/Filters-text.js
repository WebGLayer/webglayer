/**
 * Tests for Linear and Ordinal filters
 */
QUnit.test("Filters", function( assert ) {
    var data = {
        pts: [100,100, 150,150, 100,150, 150,100],
        val1: [10, 20, 30, 40],
        val2: [1, 2, 1, 2],
        dval1: [10, 20, 30, 40],
        dval2: [1, 2]
    };

    data.num = data.val1.length;

    WGL.init(data.num, '../', 'map');

    var val1 = {data: data.val1, domain: data.dval1, name:'val1', type:'ordinal', label : "val1"};
    var val2L = {data: data.val2,  min:0, max:100, num_bins: 100, name: 'val2',type:'linear', label : "val2"} ;

    // Ordinal
    var dim = WGL.addOrdinalHistDimension(val1);
    // Linear
    var dimL = WGL.addLinearHistDimension(val2L);
    // add filters
    WGL.addLinearFilter( val1, 8 , 'val1F');
    WGL.addLinearFilter( val2L, 100 , 'val2LF');

    WGL.initFilters();
    WGL.render();

    // filter in ordinal dim
    WGL.exactFilterDim('val1', 'val1F', 10, true);
    WGL.exactFilterDim('val1', 'val1F', 20, true);
    var pix = dim.readPixels();
    var b = pix[0].selected === 1 && pix[1].selected === 1 && pix[2].selected === 0 && pix[3].selected === 0;

    // clean ordinal dim
    WGL.filterDim('val1','val1F',[]);

    // filter linear dim
    WGL.filterDim('val2','val2LF',[[0, 1]]);
    var pixL = dimL.readPixels();
    var b2 = pixL[0].selected === 2 && pixL[1].unselected === 2 && pixL.sum_selected === 2;

    //evaluate results
    assert.ok(b, "Ordinal filter");
    assert.ok(b2, "Linear filter");

    // clean all from 'map' after test
    cleanTest();
});