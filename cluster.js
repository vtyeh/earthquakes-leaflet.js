let light = "https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=";
let accessToken = "pk.eyJ1IjoiYnJ5YW5sb3dlIiwiYSI6ImNqZ3p2bThxNTA4M3Yyd25vdGQxY2xqeXQifQ.URpIhwM_YJcAJYOyzbZEdQ"

let lightMap = L.tileLayer(light+accessToken);

let earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

let myMap = L.map("map", {
    center: [
      44.68, -63.74
    ],
    zoom: 3,
    layers: lightMap
  });

d3.json(earthquakeUrl, function(data) {
	let markers = L.markerClusterGroup();
  console.log(data.features);

  for (var i=0, ii=data.features.length; i<ii; i++) {
    let location = data.features[i].geometry.coordinates;
    if (location) {
      markers.addLayer(L.marker([location[1], location[0]]).
        bindPopup("<h3>" + data.features[i].properties.place +
    "</h3><hr><p>" + new Date(data.features[i].properties.time) + "<br> Magnitude: " + data.features[i].properties.mag +"</p>"))
    }
  };

  myMap.addLayer(markers);

});


