/**
 * Tests for class ParallelCoordinates
 */
QUnit.test("ParallelCoordinates", function( assert ) {
    var data = {
        pts: [100,100, 150,150],
        val1: [10, 20],
        val2: [1, 2],
        dval1: [10, 20],
        dval2: [1, 2]
    };

    data.num = data.val1.length;

    WGL.init(data.num, '../', 'map');

    var val1 = {data: data.val1, domain: data.dval1, name:'val1', type:'ordinal', label : "val1"};
    var val2 = {data: data.val2, domain: data.dval2, name:'val2', type:'ordinal', label : "val2"};

    WGL.addOrdinalHistDimension(val1);
    WGL.addLinearFilter( val1, 8 , 'val1F');


    var d = [];
    d[0] = val1;
    d[1] = val2;

    var pc = WGL.addParallelCoordinates('map', d);
    WGL.addMultiDim(d);

    WGL.initFilters();
    WGL.render();


    // exact filter
    WGL.exactFilterDim('val1', 'val1F', 10);

    // set maximum value
    pc.reRender(1);
    // read pixels from canvas
    var pix = reliableReadPixel(0,0,500,200);

    var sum = 0;
    for (var i = 0; i < pix.length; i++){
        sum += pix[i];

    }

    assert.ok(sum > 1000, "sum of pixels in canvas must be larger then 1000");

    // clean all from 'map' after test
    cleanTest();
    $('#map').empty();

});