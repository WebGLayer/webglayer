let map;
let draw;
let mapColor = 'dark-v9';
let polygons = [];
let control_options;
$(document).ready(function () {
    mapboxgl.accessToken = 'pk.eyJ1IjoiamlyaS1iIiwiYSI6ImNqZmNjajc1MTJjN2cyeG5ycG5lcWhpNHMifQ.d-4wK9BUDPUHq_SRgHYe9g';
    map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/dark-v9', // stylesheet location 'mapbox://styles/mapbox/dark-v9'
        center: [-87.6,41.9], // starting position [lng, lat]
        zoom: 10, // starting zoom
        preserveDrawingBuffer: true
    });

    draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
            polygon: true,
            trash: true
        }
    });
    map.addControl(draw, 'top-left');

    control_options = {"draw": draw.modes.DRAW_POLYGON, "delete": draw.modes.SIMPLE_SELECT};
});

function transform(x, y) {
    var tl = getTopLeftTC();
    var p = new mapboxgl.LngLat(y, x);
    //p.transform(wgs, map.projection);
    var v = map.project(p);
    var v0 = toLevel0(v, tl, map.getZoom());
    return v0;
}
function toLevel0(pt, tl, zoom) {
    ts = 256;
    scale = Math.pow(2, zoom);
    pt.x = pt.x / scale + tl.x;
    pt.y = pt.y / scale + tl.y;
    return pt;
}
function toggleColorScheme(element) {
    var schemes = element.parentNode.childNodes;
    for (var scheme in schemes) {
        if (schemes[scheme].nodeName == "SPAN") {
            if (schemes[scheme] == element) {
                schemes[scheme].classList.add("color-scheme-selected");
            } else {
                schemes[scheme].classList.remove("color-scheme-selected");
            }
        }
    }
    WGL.colorSchemes.setSchemeSelected($(element).data("scheme"));
    this.changeMapColor();
}

function changeMapColor() {
    const newMapColor = WGL.colorSchemes.getSchemeBgSelected();
    if(newMapColor != mapColor) {
        map.setStyle('mapbox://styles/mapbox/' + newMapColor);
        mapColor = newMapColor;
    }
}

function toggleControl(element) {
    var options = element.parentNode.childNodes;
    for (var control in options) {
        if (options[control].nodeName == "BUTTON") {
            if (options[control] == element) {
                if(element.classList.contains("btn-selected")) {
                    options[control].classList.remove("btn-selected");
                    draw.changeMode(draw.modes.SIMPLE_SELECT);
                    if(WGL.getDimension('themap').getVisible()) {
                        const idt = WGL.getDimension('idt');
                        idt.setEnabled(true);
                    }
                } else {
                    if(element.value == 'draw') {
                        options[control].classList.add("btn-selected");
                        draw.changeMode(control_options[element.value]);
                        const idt = WGL.getDimension('idt');
                        idt.setEnabled(false);
                        $("#wgl-win-close").click();
                    } else {
                        const features = draw.getSelected().features;
                        for(let feature in features) {
                            draw.delete(features[feature].id);
                        }
                        if(WGL.getDimension('themap').getVisible()
                        && draw.getAll().features.length == 0) {
                            const idt = WGL.getDimension('idt');
                            idt.setEnabled(true);
                        }
                    }
                }
            } else {
                options[control].classList.remove("btn-selected");
            }
        }
    }
}

function resetControls() {
    $("#controls .btn-selected").removeClass("btn-selected");
    for (let control in controls) {
        controls[control].deactivate();
    }
}