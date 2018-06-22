let outdoors = "https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token=";
let dark = "https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=";
let satellite = "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=";
let accessToken = "pk.eyJ1IjoiYnJ5YW5sb3dlIiwiYSI6ImNqZ3p2bThxNTA4M3Yyd25vdGQxY2xqeXQifQ.URpIhwM_YJcAJYOyzbZEdQ"

let outdoorsMap = L.tileLayer(outdoors+accessToken);
let darkMap = L.tileLayer(dark+accessToken);
let satelliteMap = L.tileLayer(satellite+accessToken);

let earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let plateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

function radius(magnitude) {
  return magnitude * 10;
}

function color(magnitude) {
  return magnitude > 5 ? '#F30':
  magnitude > 4  ? '#F60':
  magnitude > 3  ? '#F90':
  magnitude > 2  ? '#FC0':
  magnitude > 1  ? '#FF0':
            '#9F3';
}

// Perform a GET request to the query URL
d3.json(earthquakeUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  d3.json(plateUrl, function(faultData) {
    createFeatures(data, data.features, faultData.features);
  });
});


function createFeatures(timelineData, earthquakeData, faultData) {
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function pointToLayer(feature, latlng) {
    let markerStyle = {
      stroke: true,
      weight: 1,
      fillOpacity: 0.75,
      fillColor: color(feature.properties.mag),
      color: "white",
      radius: radius(feature.properties.mag)
    };
    return new L.circleMarker(latlng, markerStyle);
  }
  
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "<br> Magnitude: " + feature.properties.mag +"</p>");
  }

  function getInterval(feature) {
    return {start: feature.properties.time,
            end: feature.properties.time + feature.properties.mag * 1000000};
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: pointToLayer,
    onEachFeature: onEachFeature
  });

  let faultlines = L.geoJSON(faultData, {
    color: "#af584f",
    weight: 2
  });

//   d3.json(earthquakeUrl, function(data) {
    let timeline = L.timeline(timelineData, {
      getInterval: getInterval,
      pointToLayer: pointToLayer,
      onEachFeature: onEachFeature
    });

    createMap(earthquakes, faultlines, timeline);
//   });

  // Sending our earthquakes layer to the createMap function
}

function createMap(earthquakes, faultlines, timeline) {
  // Define a baseMaps object to hold our base layers
  let baseMaps = {
    "Outdoors": outdoorsMap,
    "Grayscale": darkMap,
    "Satellite": satelliteMap
  };

  
  // Create overlay object to hold our overlay layer
  let overlayMaps = {
    Earthquakes: earthquakes,
    Faultlines: faultlines,
    Timeline: timeline,
  };

  function getInterval(feature) {
    return {start: feature.properties.time,
            end: feature.properties.time + feature.properties.mag * 100000};
  }

  let timelineControl = L.timelineSliderControl({
    formatOutput: function(date) {
      return moment(date).format("MMMM Do YYYY, h:mm:ss a");
    },
    duration: 100000
  });

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  let myMap = L.map("map", {
    center: [
      44.68, -63.74
    ],
    zoom: 3,
    layers: [satelliteMap, timeline, faultlines]
  });
  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map

  timelineControl.addTo(myMap);
  timelineControl.addTimelines(timeline);
  
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  let legend = L.control({position: "bottomright"});

  legend.onAdd = function (myMap) {
    let div = L.DomUtil.create("div", "info legend"),
      grades = [0, 1, 2, 3, 4, 5],
      labels = [];
    
    for (var i=0, ii=grades.length; i<ii; i++) {
      div.innerHTML += 
        '<i style="background: ' + color(grades[i] + 1) + '"></i>' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(myMap);
}
