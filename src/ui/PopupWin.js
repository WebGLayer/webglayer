/**
 * Pupup window
 * require, D3v3 a Jquery
 * @param map_win_id {String} selector ('.class' or '#id'), which covers map window
 * @param idt_dim {String} IdentifyDimension
 * @param title {String} tittle for popup window
 * @param pts {Array} coords of pts [x1, y1, x2, y2, ...]
 * @constructor
 */
WGL.ui.PopupWin = function (map_win_id, idt_dim, title, pts=null) {
    var visible = false;
    var posX = 0; // position of window
    var posY = 0;
    var dragged = 0;
    var threshold = 2;
    var ex = 0; // position in 0-level
    var ey = 0;
    var permalink_input = null;
    var last_position = null;
    var lngLat = null;

    /**
     * Set visibility
     * @param {boolean} bol
     */
    let setVisibility = function (bol) {
        d3.select("#wgl-point-win").classed("wgl-active", bol);
        d3.select("#triangle").classed("wgl-active", bol);
        visible = bol;
    };

    /**
     * Sets position of popup window
     * @param {int} x pixels
     * @param {int} y pixels
     */
    let setPosition = function (x, y) {

        console.log(x)
        console.log(y)

        if(x < 0 || y < 0) {
            setVisibility(false);
            return
        } else {
            setVisibility(true);
        }

        posX = x;
        posY = y;
        let win = $("#wgl-point-win");
        win.css("bottom",(window.innerHeight - posY)+"px");
        win.css("left",(posX - 50)+"px");

        let tri = $("#triangle");
        tri.css("top",(posY)+"px");
        tri.css("left",(posX - 18)+"px");

    };

    /**
     * Add html content to popup window
     * @param {string} s html
     */
    let addContent = function (s) {
        $("#wgl-point-win-context").html(s);
    };

    let prop2html = function (t) {
        let s = "<table>";
        for (let k in t){
            s += "<tr><td>"+k+": </td><td>"+t[k]+"</td></tr>";
        }
        s += "</table>";
        return s
    };

    /**
     * @callback prop2htmlConversion
     * @param t
     */

    /**
     * Setting function for conversion from properties object to html
     * @param {prop2htmlConversion} func conversion function
     */
    this.setProp2html = function (func) {
        prop2html = func;
    };

    // move map about pixel
    let movemap = function (dx, dy) {};

    /**
     * Moves the map by dx, dy pixels
     * @callback moveMapCallBack
     * @param {int} dx
     * @param {int} dy
     */

    /**
     * Set function for fo moving.
     * @param {moveMapCallBack} mmf
     */
    this.setMovemap = function (mmf) {
        movemap = mmf;
    };

    this.configurePermalinkInput = function(p) {
        permalink_input = p;

        if(permalink_input != null) {

            $(map_win_id).off("popup:update-permalink").on("popup:update-permalink", () => {

                let oldURL = $("#" + permalink_input).val();

                if (visible && last_position != null) {
                    let newURL = updateURLParameter(oldURL, encodeURIComponent(idt_dim), last_position.toString());
                    if (oldURL !== newURL) {
                        $("#" + permalink_input).val(newURL);
                    }
                } else {
                    let newURL = updateURLParameter(oldURL, encodeURIComponent(idt_dim), "");
                    if (oldURL !== newURL) {
                        $("#" + permalink_input).val(newURL);
                    }
                }
            });
        }
    };

    this.setup = function () {
        // write elements to body
        let main = d3.select("body")
            .insert("div")
            .attr("id","wgl-point-win")
            .classed("wgl-point-selection-win", true);

        let head = main.insert("div")
            .attr("id", "wgl-point-win-head");

        head.text(title);
        head.insert("div")
            .attr("id","wgl-win-close")
            .insert("i")
            .classed("fa", true)
            .classed("fa-times", true)
            .attr("aria-hidden","true");
        main.insert("div").attr("id","wgl-point-win-context");

        // event registration
        let mwid = $(map_win_id);

        mwid.mousedown(function (e) {
            dragged = 0;
        });

        mwid.mousemove(function (e) {

            dragged++;

            var idt = WGL.getDimension(idt_dim);
            if(!idt.getEnabled()) {
                return;
            }

            //pointer
            var num_points = idt.identify(e.pageX, e.pageY)[1];
            if(num_points > 0){
                mwid.css("cursor","pointer");
            }
            else{
                mwid.css("cursor","default");
            }

        });

        mwid.mouseup(function (e) {

            var idt = WGL.getDimension(idt_dim);
            if(!idt.getEnabled()) {
                return;
            }

            if (dragged < threshold){

                WGL.getDimension(idt_dim).getProperties(e.offsetX, e.offsetY, function (t) {

                    setVisibility(false);

                    if (pts != null) { //get real coord of pt
                        fMercZero=[]
                        fMerc = [] 
                        fMercZero[0]=pts[ t.ID*2 ];
                        fMercZero[1]=pts[ t.ID*2 +1];

                        fMerc[0]= (fMercZero[0]*(20037508.34*2/256)-20037508.34)
                        fMerc[1]= -((fMercZero[1]-256)*(20037508.34*2/256)+20037508.34)

                        var fWgs = new OpenLayers.LonLat(fMerc);
                        lngLat = fWgs.transform(merc, wgs);
                        console.log(lngLat)
                    }
                    else { //get coord of click

                        if (typeof map.unproject === "function") { //mapbox lib
                        lngLat = map.unproject([e.offsetX, e.offsetY]); 
                        }
                        else { //openlayers native
                        var px = new OpenLayers.Pixel(e.offsetX, e.offsetY);
                        np = map.getLonLatFromPixel(px);
                        lngLat = np.transform(merc, wgs); 
                        }
                    }

                    last_position = [t['ID'], t['webgl_num_pts'], lngLat.lng, lngLat.lat];

                    addContent(prop2html(t));

                    setPosition(e.offsetX, e.offsetY);

                    setVisibility(true);

                    // move window to screen
                    let minOffsetTop = $("#wgl-point-win").height() + 50;
                    let minOffsetLeft = 70;
                    let minOffsetRight = $("#wgl-point-win").width() - 30;

                    let mx = 0;
                    let my = 0;
                    if (e.offsetY < minOffsetTop){
                        my += minOffsetTop - e.offsetY;
                    }

                    let curRightOff = $(map_win_id).width() - e.offsetX;
                    if ( curRightOff < minOffsetRight){
                        mx -=  (minOffsetRight -curRightOff);
                    }
                    if (e.offsetX < minOffsetLeft){
                        mx += minOffsetLeft - e.offsetX;
                    }
                    if (mx !== 0 || my !== 0){
                        setTimeout(function () {
                            setPosition(posX + mx, posY + my);
                            movemap(mx, my);
                        }, 200);
                    }

                });

                if($(".link-permalink").length > 0) {
                    $(".link-permalink").trigger("permalink:change");
                }
            }
            dragged = 0;
        });

        // close popup win
        $("#wgl-win-close").click( () => {
            setVisibility(false);
            last_position = null;
            if($(".link-permalink").length > 0) {
                $(".link-permalink").trigger("permalink:change");
            }
        });

        // draw triangle
        d3.select("body")
            .insert("div")
            .attr("id","triangle");

        let svg = d3.select('#triangle')
            .append('svg')
            .attr({'width':35,'height':35});

        let arc = d3.svg.symbol().type('triangle-down').size(function(d){ return 600; });

        svg.append('g').attr('transform','translate('+ 18 +','+ 15 +')')
            .append('path').attr('d', arc).attr('fill',"#dce2e0")

    };

    /**
     * Must be call after every zoom or move event
     */
    this.zoommove = function () {
        if(lngLat != null) {
            if (typeof map.project === "function") { //mapbox lib
                point = map.project(lngLat);
	        } else { // openlayers native
                var ll = new OpenLayers.LonLat(lngLat.lon, lngLat.lat);
                np = ll.transform(wgs, merc);
                point =  map.getPixelFromLonLat(np);
            }

            setPosition(point.x, point.y);
        }
    };

    this.loadFilters = () => {
        let activeFilters = getUrlParameter(encodeURIComponent(idt_dim));
        if(activeFilters !== "") {
            let position = activeFilters.split(",");

            lngLat = [position[2], position[3]];

            if (typeof map.project === "function") { //mapbox lib
                point = map.project(lngLat);
            } else { //openlayers native
                var ll = new OpenLayers.LonLat(lngLat.lon, lngLat.lat);
                np = ll.transform(wgs, merc);
                point =  map.getPixelFromLonLat(np);
            }
            setPosition(point.x, point.y);

            WGL.getDimension(idt_dim).getPropertiesById(position[0], position[1], function (t) {

                addContent(prop2html(t));

                setPosition(point.x, point.y);

                setVisibility(true);

                // move window to screen
                let minOffsetTop = $("#wgl-point-win").height() + 50;
                let minOffsetLeft = 70;
                let minOffsetRight = $("#wgl-point-win").width() - 30;

                let mx = 0;
                let my = 0;
                if (point.y < minOffsetTop){
                    my += minOffsetTop - point.y;
                }

                let curRightOff = $(map_win_id).width() - point.x;
                if ( curRightOff < minOffsetRight){
                    mx -=  (minOffsetRight -curRightOff);
                }
                if (point.x < minOffsetLeft){
                    mx += minOffsetLeft - point.x;
                }
                if (mx !== 0 || my !== 0){
                    setTimeout(function () {
                        setPosition(posX + mx, posY + my);
                        movemap(mx, my);
                    }, 200);
                }
            });
        }
    };

    this.setup();
};
