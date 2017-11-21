/**
 * Tests for class HistDimension
 */
QUnit.test("HistDimension", function( assert ) {
    var data = {
        pts: [10,10, 30,30, 50,30, 46,87, 45,23],
        value: [0.0, 10.0, 20.0, 10.0, 0.0],
        min: 0.0,
        max: 21.0,
        domain: [0.0, 10.0, 20.0]
    };
    data.num = data.value.length;

    WGL.init(data.num, '../', 'map');

    // linear hist dimension
    var set = {data: data.value,  min:data.min, max:data.max, num_bins: 4, name: 'value',type:'linear', label :"value"};
    WGL.addLinearHistDimension(set);
    WGL.render();

    var pixels = WGL.getDimension('value').readPixels();
    var sumPixels = 0;
    pixels.forEach(function (t) {
        sumPixels += t.selected;
        sumPixels += t.out;
        sumPixels += t.unselected;
    });
    assert.equal(sumPixels, data.num, "the number of points (values) in readPixels() function (linear)");
    assert.equal(pixels.length, set.num_bins, "num of bins (linear)");

    // ordinal hist dimension
    var set0rdinal   = {data: data.value,  domain: data.domain ,  name: 'valueOrdinal', type:'ordinal', label : "value"};
    WGL.addOrdinalHistDimension(set0rdinal);
    WGL.render();

    var pixelsO = WGL.getDimension('valueOrdinal').readPixels();
    var sumPixelsO = 0;
    pixelsO.forEach(function (t) {
        sumPixelsO += t.selected;
        sumPixelsO += t.out;
        sumPixelsO += t.unselected;
    });
    assert.equal(sumPixelsO, data.num, "the number of points (values) in readPixels() function (ordinal)");
    assert.equal(pixelsO.length, set0rdinal.domain.length, "num of bins (ordinal)")
});