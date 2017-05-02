/**
 * Created by kolovsky on 2.5.17.
 */

// clean all dimension
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

    var det_TA = WGL.utils.array2TA(data.value);
    WGL.getManager().addDataBuffer(det_TA, 1, 'dimension', 10, 30);

    var heatLines = WGL.addMapLineDimension(data.pts, 'themap2');
    heatLines.setValuesBuffer('dimension');

    WGL.cleanAll();

    var len = 0;
    for (var key in WGL._dimensions){
        len += 1;
    }
    assert.equal(len, 0, "length of the WGL._dimension array after clean LINE");

});