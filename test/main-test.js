/**
 * Clean WGL and remove Canvas
 */
function cleanTest() {
    WGL.cleanAll();
    $('#webglayer').remove();
}

/**
 * Read pixels from 'webglayer' canvas using '2d' context
 * @param x
 * @param y
 * @param destination_canvas off screen canvas for '2d' context
 * @returns {CanvasPixelArray}
 */
function reliableReadPixel(x, y, destination_canvas) {
    var dC = destination_canvas || document.createElement('canvas');
    var sC = document.getElementById('webglayer');
    dC.width = sC.width;
    dC.height = sC.height;

    var cc = dC.getContext('2d');
    cc.drawImage(sC, 0, 0);
    return cc.getImageData(x, y, 1, 1).data;
}