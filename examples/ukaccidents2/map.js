initMap = function() {

	var options = {
		units : 'm',
		projection : "EPSG:900913",
		zoomMethod: null
	};
	map = new OpenLayers.Map('map', options);
//	map.addLayer(new OpenLayers.Layer.OSM());
	 map.events.register('updatesize', map, 
			  function(){
		 		//initGLDimensions();		 		
		 		//WGL.mcontroller.resize(div.offsetWidth, div.offsetHeight);
		 		WGL.mcontroller.zoommove(map.zoom, getTopLeftTC(),WGL.filterByExt);		 		
		 		
			  }) ;
	 

	  map.events.register("mousemove", map, function(e) {
          var position = this.events.getMousePosition(e);
     //     console.log(position);
      });
	  
	  
    var layer = new OpenLayers.Layer.OSM('', null, {
        eventListeners: {
            tileloaded: function(evt) {
                var ctx = evt.tile.getCanvasContext();
                if (ctx) {
                    var imgd = ctx.getImageData(0, 0, evt.tile.size.w, evt.tile.size.h);
                    var pix = imgd.data;
                    for (var i = 0, n = pix.length; i < n; i += 4) {
                        pix[i] = pix[i + 1] = pix[i + 2] = (3 * pix[i] + 4 * pix[i + 1] + pix[i + 2]) / 35;                    }
                    ctx.putImageData(imgd, 0, 0);
                    evt.tile.imgDiv.removeAttribute("crossorigin");
                    evt.tile.imgDiv.src = ctx.canvas.toDataURL();
                }
            }
        }
    });

    map.addLayer(layer);
    
	
	 
	// allow testing of specific renderers via "?renderer=Canvas", etc
	var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
	renderer = (renderer) ? [ renderer ]
			: OpenLayers.Layer.Vector.prototype.renderers;

		
		var defaultStyle = new OpenLayers.Style({
		  'fillColor': "green",
		  'pointRadius': 10,
		  'externalGraphic': '${thumbnail}'
		});

		var selectStyle = new OpenLayers.Style({
		  'pointRadius': 20
		});
		
		var temporary = new OpenLayers.Style({
			  'pointRadius': 7,
			  'fillColor': "white",
			  'fillOpacity':0.4,
			  'strokeColor': "#ff8c00", 
              'strokeOpacity': 1, 
              'strokeWidth': 1, 
              'z-index':-10
			});

	var styleMap = new OpenLayers.StyleMap({'default': temporary,
											'select': selectStyle,
											'temporary':temporary});
		
	vectors = new OpenLayers.Layer.Vector("Vector Layer", {
		renderers : renderer,
		styleMap: styleMap
	});


	map.addLayers([ vectors ]);
	
	var con = map.getControlsByClass("OpenLayers.Control.Navigation")[0]; 
	//con.deactivate();
	var polygons = [];

	var m_id;
	function report(event) {
		if (event.type!="sketchcomplete"){
		// console.log(event.type, event.feature ? event.feature.id :
		 //event.components);
		// console.log(event.feature.geometry.components[0].components);
		/**
		 * Trianglution goes on here..........
		 */
		if (event.feature.geometry.getVertices().length >= 3) {
		
			
			var points = event.feature.geometry.getVertices();
			 m_id =  event.feature.id;
			var res = [];
			for (var i = 0; i < points.length; i++) {
				var np = new OpenLayers.LonLat(points[i].x, points[i].y);
				np.transform(merc, wgs); 
				var pp = transform(np.lat, np.lon);
				res.push(pp);

			}
			//console.log(res.length);
			try {
				var ts = new poly2tri.SweepContext(res);
				ts.triangulate();
				polygons[m_id] = trianglesToArray(ts.getTriangles());
			//	console.log(polygons);
				mapFilterRender.createFilteringData(polygons);
				mapFilter();
			} catch (e) {
				console.log(e);
			}

		}
		} else {
			polygons[event.feature.id] = polygons[m_id];
			delete polygons[m_id]; 
			//console.log("complete "+event.feature.id);
		}

	}
	function startDraw(event) {
		vectors.removeFeatures([vectors.features[0]]);
		report(event);
	}
	
	vectors.events.on({
		"beforefeaturemodified" : report,
		"featuremodified" : report,
		"vertexdragged" : report,
		"afterfeaturemodified" : report,
		"vertexmodified" : report,
		"sketchmodified" : report,
		"sketchstarted" : report,
		"sketchcomplete" : report,
	});

	var modifyControl = new OpenLayers.Control.ModifyFeature(vectors);
	var dragMove = modifyControl.handlers.drag.move;

	var dragControl = new OpenLayers.Control.DragFeature(vectors);
	dragControl.onDrag = function(a, b) {
		console.log(b);
	};
	
	var removeControl = new OpenLayers.Control.SelectFeature(
			vectors,
			{
		        displayClass: "olControlDelete",		     
		        eventListeners: {
		        	featurehighlighted: function overlay_delete(event) {
		                var feature = event.feature;
		                console.log("deleteing "+feature.id);
		                delete polygons[feature.id];
		                vectors.removeFeatures( [ feature ] );
		              
		                mapFilterRender.createFilteringData(polygons);
		                console.log( polygons);
						mapFilter();
		            }
		        }   
		    } 
			);
			
			
	controls = {

		polygon : new OpenLayers.Control.DrawFeature(vectors,
				OpenLayers.Handler.Polygon),
		modify : modifyControl,
		drag : dragControl,
		remove: removeControl

	};

	for ( var key in controls) {
		map.addControl(controls[key]);
	}

	var lonlat = new OpenLayers.LonLat(-2.0,54.2).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
	map.setCenter(lonlat);
	map.zoomTo(5);
}
function trianglesToArray(trig) {
	var points = [];
	for ( var i in trig) {
		for ( var j in trig[i].points_) {
			// console.log(trig[i].points_[j].x);
			// console.log(trig[i].points_[j].y);
			points.push(trig[i].points_[j].x);
			points.push(trig[i].points_[j].y);
		}
	}
	return points;

}
function update() {
	// reset modification mode
	controls.modify.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
/*	var rotate = document.getElementById("rotate").checked;
	if (rotate) {
		controls.modify.mode |= OpenLayers.Control.ModifyFeature.ROTATE;
	}
	var resize = document.getElementById("resize").checked;
	if (resize) {
		controls.modify.mode |= OpenLayers.Control.ModifyFeature.RESIZE;
		var keepAspectRatio = document.getElementById("keepAspectRatio").checked;
		if (keepAspectRatio) {
			controls.modify.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
		}
	}
	var drag = document.getElementById("drag").checked;
	if (drag) {
		controls.modify.mode |= OpenLayers.Control.ModifyFeature.DRAG;
	}
	if (rotate || drag) {
		controls.modify.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
	}*/
	var dragEvent = document.getElementById("dragEvent").checked;
	if (dragEvent) {
		controls.modify.deactivate();
		controls.drag.activate();
	}
	controls.modify.createVertices = document.getElementById("createVertices").checked;
	var sides = parseInt(document.getElementById("sides").value);
	sides = Math.max(3, isNaN(sides) ? 0 : sides);
	controls.regular.handler.sides = sides;
	var irregular = document.getElementById("irregular").checked;
	controls.regular.handler.irregular = irregular;
}

function toggleControl(element) {
	for (key in controls) {
		var control = controls[key];
		if (element.value == key && element.checked) {
			control.activate();
		} else {
			control.deactivate();
		}
	}
}