/**
 * Tests for class HeatMapDimension
 */
QUnit.test("HeatMapDimension", function( assert ) {
    var data = {
        pts: [100, 100],
        value: [10.0],
        min: 0.0,
        max: 10.0,
        domain: [10.0]
    };
    data.num = data.value.length;

    WGL.init(data.num, '../', 'map');

    var hm = WGL.addHeatMapDimension(data.pts, 'heatmap');

    WGL.render();

    var px = 0;
    for (var i = 0; i < 30;i++){
        px += hm.readPixels(100 + i, 100 + i, 'float')[0];
    }

    var diff = px - 11.768951416015625;
    assert.ok(diff < 0.0000001 && diff > -0.0000001, 'difference in float');

    cleanTest();
});