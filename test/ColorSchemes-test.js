/**
 * Tests for class HeatMapDimension
 */
QUnit.test("ColorScheme", function( assert ) {

    var customMatrix = [
      256, 0, 0,
      0, 256, 0,
      0, 0 , 256
    ];

    var blueMatrix = colorSchemes.getSchemeMatrixSelected();

    assert.deepEqual([
      8, 28, 90,
      46, 182, 194,
      256, 256, 218
    ], blueMatrix);

    colorSchemes.setCustomMatrixSelected(customMatrix);

    assert.deepEqual([
      256, 0, 0,
      0, 256, 0,
      0, 0 , 256
    ], colorSchemes.getSchemeMatrixSelected());

    cleanTest();
});