function initMap() {

	// initialize the map
	var styledMap = new google.maps.StyledMapType(styles, {
		name : "Styled Map"
	});

	var mapOptions = {
		zoom : 5,
		center : new google.maps.LatLng(50, 14),
		mapTypeControlOptions : {
			mapTypeIds : [ google.maps.MapTypeId.ROADMAP, 'map_style' ]
		}
	};

	var mapDiv = document.getElementById('map-div');
	map = new google.maps.Map(mapDiv, mapOptions);

	map.mapTypes.set('map_style', styledMap);
	map.setMapTypeId('map_style');

	/**
	 * the projection is null when we initlize the map so we have to do all the
	 * configuration after the porjection is setup
	 */
	google.maps.event.addListenerOnce(map, "projection_changed", function() {
		mapProj = map.getProjection();
		/**
		 * Helper function that reads the data and initialize the attributes,
		 * points and crossfilter
		 */
		dl = new DataLoader()
		dl.loadTextData("../../data/osm_pix100k.json");
		/** take crossfilter object for coordination */
		// cf = dl.cf;
		/** init the canvas */
		// gllayer = new WebglLayer("test", map.getDiv(), dl.points,
		// dl.attributes);
		/** Free the CPU memory (data are loaded on GPU) */
		// dl=null;

		/** Call the method onMove to push the data from map to WebglLayer */
		// onMove();
		/** Render for the first time */
		// gllayer.render();
		/** Specify the on filter function for the Crossfilter */
		// cf.onFiltered(gllayer, gllayer.filter);
		google.maps.event.addListener(map, "zoom_changed", onMove);
		google.maps.event.addListener(map, "drag", onMove);
		google.maps.event.addListener(map, "idle", onMove);
		google.maps.event.addListener(div, "resize", 	function(){
			mcontroller.resize(div.offsetWidth, div.offsetHeight);
 		mcontroller.zoommove(map.zoom, getTopLeftTC());		
 		});

	});
}

var styles = [ {
	"featureType" : "water",
	"elementType" : "geometry",
	"stylers" : [ {
		"color" : "#000000"
	}, {
		"lightness" : 17
	} ]
}, {
	"featureType" : "landscape",
	"elementType" : "geometry",
	"stylers" : [ {
		"color" : "#000000"
	}, {
		"lightness" : 20
	} ]
}, {
	"featureType" : "road.highway",
	"elementType" : "geometry.fill",
	"stylers" : [ {
		"color" : "#000000"
	}, {
		"lightness" : 17
	} ]
}, {
	"featureType" : "road.highway",
	"elementType" : "geometry.stroke",
	"stylers" : [ {
		"color" : "#000000"
	}, {
		"lightness" : 29
	}, {
		"weight" : 0.2
	} ]
}, {
	"featureType" : "road.arterial",
	"elementType" : "geometry",
	"stylers" : [ {
		"color" : "#000000"
	}, {
		"lightness" : 18
	} ]
}, {
	"featureType" : "road.local",
	"elementType" : "geometry",
	"stylers" : [ {
		"color" : "#000000"
	}, {
		"lightness" : 16
	} ]
}, {
	"featureType" : "poi",
	"elementType" : "geometry",
	"stylers" : [ {
		"color" : "#000000"
	}, {
		"lightness" : 21
	} ]
}, {
	"elementType" : "labels.text.stroke",
	"stylers" : [ {
		"visibility" : "on"
	}, {
		"color" : "#000000"
	}, {
		"lightness" : 16
	} ]
}, {
	"elementType" : "labels.text.fill",
	"stylers" : [ {
		"saturation" : 36
	}, {
		"color" : "#000000"
	}, {
		"lightness" : 40
	} ]
}, {
	"elementType" : "labels.icon",
	"stylers" : [ {
		"visibility" : "off"
	} ]
}, {
	"featureType" : "transit",
	"elementType" : "geometry",
	"stylers" : [ {
		"color" : "#000000"
	}, {
		"lightness" : 19
	} ]
}, {
	"featureType" : "administrative",
	"elementType" : "geometry.fill",
	"stylers" : [ {
		"color" : "#000000"
	}, {
		"lightness" : 20
	} ]
}, {
	"featureType" : "administrative",
	"elementType" : "geometry.stroke",
	"stylers" : [ {
		"color" : "#000000"
	}, {
		"lightness" : 17
	}, {
		"weight" : 1.2
	} ]
} ]