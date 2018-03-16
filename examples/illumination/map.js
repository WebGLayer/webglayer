let map;
$(document).ready(function () {
  mapboxgl.accessToken = 'pk.eyJ1Ijoia29sb3Zza3kiLCJhIjoiY2pjdWlxOXN4MHlmNjJ3bzd0aW4zajE0bCJ9.sBUzwsZEWVDVwZzsz6klHQ';
  map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/dark-v9', // stylesheet location 'mapbox://styles/mapbox/dark-v9'
    center: [-1.9, 52.5], // starting position [lng, lat]
    zoom: 10, // starting zoom
    ratchety: true
  });

  let data = new DataLoader();
  data.loadPosData("../birmingham/data/all13.json");
});

