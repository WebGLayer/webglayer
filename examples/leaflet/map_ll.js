function initMap(){

	map = L.map('map-div', {
		center : [ 50, 14 ],
		zoom : 6,
		zoomAnimation : false,
	});
	mapLink = 
		  '<a href="http://openstreetmap.org">OpenStreetMap</a>';
		L.tileLayer(
				
		 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
		  //'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
		  attribution: '&copy; ' + mapLink + ' Contributors',
		  maxZoom: 18,
		  }).addTo(map);
		

		map.on('move', onMove);
		map.on('zoomstart', onMove);
		map.on('resize', 	function(){
			mcontroller.resize(div.offsetWidth, div.offsetHeight);
 		mcontroller.zoommove(map.zoom, getTopLeftTC());	
 		onMove();
 		});

}	
	
