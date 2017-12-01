/**
 * Tests for class MapDimension
 */
QUnit.test("MapDimension", function( assert ) {

    WGL.cleanAll();
    var data = {
        pts: [100,100],
        value: [10.0],
        min: 0.0,
        max: 10.0,
        domain: [10.0]
    };
    data.num = data.value.length;

    WGL.init(data.num, '../', 'map');

    var md = WGL.addMapDimension(data.pts, 'themap');
    md.pointSize = function (zoom) {
       return 100;
    };
    WGL.render();

    // read pixels from canvas
    var pixValue = reliableReadPixel(100, 100, 1, 1);

    // reference values
    var alpha = 23;
    var blue = 255;
    var green = 0;
    var red = 0;

    // tests
    assert.equal(pixValue[0], red, "value of pixel on position 100,100 R");
    assert.equal(pixValue[1], green, "value of pixel on position 100,100 G");
    assert.equal(pixValue[2], blue, "value of pixel on position 100,100 B");
    assert.equal(pixValue[3], alpha, "value of pixel on position 100,100 A");

    // clean after test (delete canvas and clean WGL)
    cleanTest();
});