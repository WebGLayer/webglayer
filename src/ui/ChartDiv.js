WGL.ChartDiv = function(parentdiv, divid, caption) {

  var newhtml= "<div id='chd-container-"+divid+"'><div class='btn-minimize'  id=min"+divid+" style='margin: 0.5em'> <i id='but"+divid+"' class='fa fa-chevron-down'></i><text> "+caption+"</text></div>" +


        " <div id = "+divid+" class = 'vis-div' style='position: relative'></div>" +

        " <hr/></div>";

  $("#"+parentdiv).append(newhtml);


  var dimension;
  this.setDim = function(d){
    dimension = d;
  };

  this.change = function () {
    $(this).toggleClass('btn-plus');
    $("#"+divid).slideToggle();
    var el = $("#but"+divid);
    if (el.hasClass("fa-chevron-down")) {
      /*deactivate*/
      el.removeClass("fa-chevron-down");
      el.addClass("fa-chevron-right");
      if (dimension!=undefined){
        dimension.setVisible(false);
      }
    }
    else{
      /*activate*/
      el.removeClass("fa-chevron-right");
      el.addClass("fa-chevron-down");
      if (dimension!=undefined){
        dimension.setVisible(true);
        //dimension.render(WGL.getManager().num_rec);
        WGL.render();
      }
    }
  };

  this.destroy = function () {
    $("#chd-container-"+divid).remove();
  };




  $("#min"+divid).click(function(){
      $(this).toggleClass('btn-plus');
      $("#"+divid).slideToggle();
      var el = $("#but"+divid);
      if (el.hasClass("fa-chevron-down")) {
        /*deactivate*/
        el.removeClass("fa-chevron-down");
        el.addClass("fa-chevron-right");
          if (dimension!=undefined){
            dimension.setVisible(false);
          }
        }
      else{
        /*activate*/
        el.removeClass("fa-chevron-right");
        el.addClass("fa-chevron-down");
        if (dimension!=undefined){
          dimension.setVisible(true);
          //dimension.render(WGL.getManager().num_rec);
          WGL.render();
        }
      }
    });



}
