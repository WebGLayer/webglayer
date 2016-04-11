WGL.addChartDiv = function(parentdiv, divid, caption) {

	var newhtml= "<div class=btn-minimize id=min"+divid+" style='margin: 0.5em'> <i id='but"+divid+"' class='fa fa-chevron-down'> "+caption+"</i></div>" +
				" <div id = "+divid+"></div>" +
				" <hr/>";
	
	$("#"+parentdiv).append(newhtml)
	
	$("#min"+divid).click(function(){
	    $(this).toggleClass('btn-plus');
	    $("#"+divid).slideToggle();
	    var el = $("#but"+divid);
	    if (el.hasClass("fa-chevron-down")) {
	    	el.removeClass("fa-chevron-down");  
	    	el.addClass("fa-chevron-right");
	    	}
	    else{
	    	el.removeClass("fa-chevron-right");  
	    	el.addClass("fa-chevron-down");
	    }	   
	  });
	
	
}
