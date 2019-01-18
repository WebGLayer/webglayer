/**
 * PopupWin, a dialog component used to display details when a user clicks on a point in the map
 * require, D3v3 a Jquery
 * @param map_win_id {String} selector ('.class' or '#id'), which covers map window
 * @param idt_dim {String} IdentifyDimension
 * @param title {String} tittle for popup window
 * @param pts {Array} coords of pts [x1, y1, x2, y2, ...]
 * @param options {Object} formatting options to be passed to the IdentifyDimension when retrieving data about a point
 * @param options.delimiter {String} either a double quote """ or a single quote "'", used to correctly read fields from the CSV files containing points' data
 * @param options.separator {String} either a comma "," or a semicolon ";", used to correctly read fields from the CSV files containing points' data
 * @constructor
 */
WGL.ui.PopupWin = function (map_win_id, idt_dim, title, pts=null, options) {

    if(typeof WGL.ui.PopupWin.instance === "object") {
        return WGL.ui.PopupWin.instance;
    }

    let visible = false;

    let enabled = true;

    var posX = 0; // position of window
    var posY = 0;
    var dragged = 0;
    var threshold = 2;
    var permalink_input = null;
    var last_position = null;
    var last_content = null;
    var lngLat = null;
    var priority = null;
    var timeout = 0;

    this.options = options;

    /**
     * Set visibility
     * @param {boolean} bol
     */
    let setVisibility = function (bol) {
        d3.select("#wgl-point-win").classed("wgl-active", bol);
        d3.select("#triangle").classed("wgl-active", bol);
        visible = bol;
    };

    this.setEnabled = function(b) {
        enabled = b;
    };

    /**
     * Set an array of CSS selectors for dialogs with higher priority on screen.
     * If one of these is currently visible on screen, the PopupWin won't be displayed
     * @param p list of selectors
     */
    this.setPriority = function(p) {
        if(p instanceof Array) {
            priority = p;
            timeout = (priority.length > 0 ? 200 : 0);
        }
    };

    this.getInstance = function() {
        if(typeof WGL.ui.PopupWin.instance === "object") {
            return WGL.ui.PopupWin.instance;
        }
    };

    /**
     * Sets position of popup window
     * @param {int} x pixels
     * @param {int} y pixels
     */
    let setPosition = function (x, y) {

        if(x < 0 || y < 0) {
            setVisibility(false);
            return;
        } else {
            setVisibility(true);
        }

        // IN CASE OF OPENLAYERS A CORRECTION FOR THE NEW POSITION INCLUDING THE TRIANGLE HEIGHT IS NECESSARY
        // MapBox-GL supports only WGS-84, so there is no API to get or set the current projection system
        const shouldIncludeTriangleHeight = (typeof map.projection !== "undefined");

        posX = x;
        posY = y;
        let win = $("#wgl-point-win");
        win.css("bottom",(window.innerHeight - posY + (shouldIncludeTriangleHeight ? 35 : 0))+"px");
        win.css("left",(posX - 50)+"px");

        let tri = $("#triangle");
        tri.css("top",(posY - (shouldIncludeTriangleHeight ? 35 : 0))+"px");
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
        main.append("div")
            .attr("id","wgl-win-close")
            .insert("i")
            .classed("fa", true)
            .classed("fa-times", true)
            .attr("aria-hidden","true");
        main.insert("div").attr("id","wgl-point-win-context");

        // event registration
        let mwid = $(map_win_id);

        mwid.off("mousedown").on("mousedown", () => {
            dragged = 0;
        });

        mwid.off("mousemove").on("mousemove", (e) => {

            dragged++;

            const idt = WGL.getDimension(idt_dim);
            if(!idt.getEnabled()) {
                return;
            }

            //pointer
            const num_points = idt.identify(e.offsetX, e.offsetY)[0];
            if(num_points > 0){
                mwid.css("cursor","pointer");
            }
            else{
                mwid.css("cursor","default");
            }

        });

        mwid.off("mouseup").on("mouseup", (e) => {

            const idt = WGL.getDimension(idt_dim);
            if(!idt.getEnabled()) {
                return;
            }

            if(!enabled) {
                return;
            }

            if (dragged < threshold){

                const num_points = idt.identify(e.offsetX, e.offsetY)[0];
                if(num_points === 0) {
                    this.close();
                    return;
                }

                setTimeout(() => {
                    if(priority != null) {
                        let s = 0, priorityLength = priority.length;
                        while(s !== priorityLength) {
                            if ($(priority[s]).length > 0 && $(priority[s]).css("display") !== "none") {
                                this.close();
                                return;
                            }
                            s++;
                        }
                    }

                    if(typeof this.options === "object") {
                        delete this.options['start'];
                    }

                    WGL.getDimension(idt_dim).getProperties(e.offsetX, e.offsetY, (t) => {
                        setVisibility(false);

                        if (pts != null) { //get real coord of pt
                            let fMercZero = [];
                            let fMerc = [];
                            fMercZero[0]=pts[ t.ID*2 ];
                            fMercZero[1]=pts[ t.ID*2 +1];

                            fMerc[0]= (fMercZero[0]*(20037508.34*2/256)-20037508.34);
                            fMerc[1]= -((fMercZero[1]-256)*(20037508.34*2/256)+20037508.34);

                            lngLat = new OpenLayers.LonLat(fMerc);
                        } else {
                            lngLat = translatePointToCoordinates({x: e.offsetX, y: e.offsetY});
                        }

                        last_position = [t['ID'], t['webgl_num_pts'], lngLat.lng, lngLat.lat];
                        last_content = t;
                        addContent(prop2html(t));
                        setVisibility(true);
                        flyTo(lngLat);
                        const point = translateCoordinatesToPoint(lngLat);
                        setPosition(point.x, point.y);
                    }, this.options);

                    if ($(".link-permalink").length > 0) {
                        $(".link-permalink").trigger("permalink:change");
                    }
                }, timeout);
            }
            dragged = 0;
        });

        // close popup win
        $("#wgl-win-close").off("click").on("click", this.close);

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

    this.close = function(){
        setVisibility(false);
        last_position = null;
        last_content = null;
        if($(".link-permalink").length > 0) {
            $(".link-permalink").trigger("permalink:change");
        }
    };

    this.reloadContent = function() {
        if(enabled
            && visible
            && last_content) {
            addContent(prop2html(last_content));
        }
    };

    /**
     * Must be call after every zoom or move event
     * @param {int} zoom
     * @param offset
     */
    this.zoommove = function () {

        if(!visible) return;

        if(lngLat != null) {
            let point = translateCoordinatesToPoint(lngLat);
            setPosition(point.x, point.y);
        }
    };

    this.loadFilters = () => {
        let activeFilters = getUrlParameter(encodeURIComponent(idt_dim));
        if(activeFilters !== "") {
            let position = activeFilters.split(",");

            lngLat = [position[2], position[3]];

            let point = translateCoordinatesToPoint(lngLat);

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

    /**
     * Private function for translating a pixel point to map coordinates
     * Compatible with both OpenLayers and Mapbox maps
     * Special thanks to user @ehanoj contribution on Github for his code and idea
     **/
    const translatePointToCoordinates = (point) => {
        let coordinates;
        if (typeof map.unproject === "function") { //mapbox lib
            coordinates = map.unproject(point);
        } else { // openlayers native*/
            coordinates = map.getLonLatFromPixel(point);
        }

        return coordinates;
    };

    /**
     * Private function for translating map coordinates to a pixel point in the map
     * Compatible with both OpenLayers and Mapbox maps
     * Special thanks to user @ehanoj contribution on Github for his code and idea
     **/
    const translateCoordinatesToPoint = (coordinates) => {
        let point;
        let np;
        if (typeof map.project === "function") { //mapbox lib
            point = map.project(coordinates);
        } else { // openlayers native*/
            point =  map.getPixelFromLonLat(coordinates);
        }

        return point;
    };

    const flyTo = (location) => {
        if(typeof map.flyTo !== "undefined") {
            map.flyTo({center: location}); //mapbox api
        } else {
            map.setCenter([location.lon, location.lat]); //openlayers api
        }
    };

    this.setup();

    WGL.ui.PopupWin.instance = this;
};