let outdoors = "https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token=";
let accessToken = "pk.eyJ1IjoiYnJ5YW5sb3dlIiwiYSI6ImNqZ3p2bThxNTA4M3Yyd25vdGQxY2xqeXQifQ.URpIhwM_YJcAJYOyzbZEdQ"

let outdoorsMap = L.tileLayer(outdoors+accessToken);

let earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


let myMap = L.map("map", {
    center: [
      44.68, -63.74
    ],
    zoom: 3,
    layers: outdoorsMap
  });

d3.json(earthquakeUrl, function(data) {
	let heatArray = [];
    for (var i=0, ii=data.features.length; i<ii; i++) {
      let location = data.features[i].geometry.coordinates;
      if (location) {
        heatArray.push([location[1], location[0]])
      };
    };

    let heat = L.heatLayer(heatArray, {
      radius: 15,
      minOpacity: 0.8
    }).addTo(myMap);
});


