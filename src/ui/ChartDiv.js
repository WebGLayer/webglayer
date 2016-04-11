WGL.ChartDiv = function(parentdiv, divid, caption) {

	var newhtml= "<div class=btn-minimize id=min"+divid+" style='margin: 0.5em'> <i id='but"+divid+"' class='fa fa-chevron-down'> "+caption+"</i></div>" +
				" <div id = "+divid+" class = 'vis-div'></div>" +
				" <hr/>";
	
	$("#"+parentdiv).append(newhtml);

	
	var dimension;
	this.setDim = function(d){
		dimension = d;
	}
	
	
	
	
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
