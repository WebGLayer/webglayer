/**
 * Pupup window
 * require, D3v3 a Jquery
 * @param map_win_id {String} selector ('.class' or '#id'), which covers map window
 * @param idt_dim {String} IdentifyDimension
 * @param title {String} tittle for popup window
 * @constructor
 */
WGL.ui.PopupWin = function (map_win_id, idt_dim, title) {
  var visible = false;
  var posX = 0; // position of window
  var posY = 0;
  var dragged = 0;
  var threshold = 2;
  var ex = 0; // position in 0-level
  var ey = 0;

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
    posX = x;
    posY = y;
    let win = $("#wgl-point-win");
    win.css("bottom",(window.innerHeight - posY + 35)+"px");
    win.css("left",(posX - 50)+"px");

    let tri = $("#triangle");
    tri.css("top",(posY - 35)+"px");
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
      .classed("fa-times-circle", true)
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
        setVisibility(false);

        WGL.getDimension(idt_dim).getProperties(e.offsetX, e.offsetY,function (t) {
          setVisibility(true);
          addContent(prop2html(t));
          //setPosition(e.offsetX, e.offsetY);

          let offset = WGL.mcontroller.offset;
          let zoom = WGL.getManager().zoom;
          // position in 0-level
          ex = offset.x + e.pageX/Math.pow(2, zoom);
          ey = offset.y + e.pageY/Math.pow(2, zoom);

          setPosition(e.pageX, e.pageY);

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
      }
      dragged = 0;
    });

    // close popup win
    $("#wgl-win-close").click(function (e) {
      setVisibility(false);
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
   * @param {int} zoom
   * @param offset
   */
  this.zoommove = function (zoom, offset) {
    let nx = (ex - offset.x)*Math.pow(2, zoom);
    let ny = (ey - offset.y)*Math.pow(2, zoom);
    setPosition(nx, ny);
  };

  this.setup();
};