
  mapboxgl.accessToken = 'ADD YOUR TOKEN HERE'; // Still figuring out the secure way to handle this
  
  const mapdata = document.querySelector('#map');
  let rasterTileset = mapdata.dataset.rastertileset;
  let vectorTileset = mapdata.dataset.vectortileset;
  let rasterTilesetURL = 'mapbox://bweinstein.' + rasterTileset;
  let vectorTilesetURL = 'mapbox://bweinstein.' + vectorTileset;
  
  const map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/light-v11', // stylesheet location
    center: [-119.73228, 37.09], // starting position [lng, lat]
    zoom: 12 // starting zoom
  });

  // Define your categories and corresponding colors
  var categories = ['QUDO', 'QUWI2', 'PISA2']; // Replace with your categories
  var num_categories = categories.length
  console.log(num_categories)
  var colors = chroma.scale('Spectral').colors(num_categories)

  // Create the match expression for color boxes by species
  var speciesColors = ['match', ['get', 'dom_taxa']]; // Replace 'property-name' with the name of your property
  categories.forEach(function(category, i) {
      speciesColors.push(category, colors[i]);
  });
  speciesColors.push('#000'); // Default color

  map.on('load', () => {
    map.addSource('raster-source', { // A unique id for the source
        type: 'raster',
        url: rasterTilesetURL, // The Mapbox id for the tileset
        tileSize: 256
    });

    map.addLayer({
        id: 'raster-layer', // A unique id for the layer
        type: 'raster',
        source: 'raster-source', // The id of the source to use for this layer
        paint: {
            'raster-opacity': 0.85 // Adjust the opacity of the raster layer
        }
    });

// To display the bounding boxes as outlines while making them easily clickable
// add two layers for trees data. The 'fill' layer makes it easy to click on each item.
    map.addLayer({
      id: 'trees',
      type: 'fill',
      source: {
        type: 'vector',
        url: vectorTilesetURL
      },
      'source-layer': 'SJER_2021',
      'paint': {
        'fill-opacity': 0
    }
  });

  map.addLayer({
      id: 'trees-outline',
      type: 'line',
      source: {
        type: 'vector',
        url: vectorTilesetURL
      },
      'source-layer': 'SJER_2021',
      'paint': {
        'line-color': speciesColors,
        'line-width': 2
    }
  });

  map.on('click', 'trees', (e) => {
    // Check if features exist
    if (!e.features || e.features.length === 0) {
        console.log("No features found");
        return;
    }

    // Check if geometry and coordinates exist
    if (!e.features[0].geometry || !e.features[0].geometry.coordinates) {
        console.log("No coordinates found");
        return;
    }
    // Copy coordinates array.
    const coordinates = e.features[0].geometry.coordinates[0][0].slice();

    // Check if properties and description exist
    if (!e.features[0].properties || !e.features[0].properties.dom_taxa) {
        console.log("No dom_taxa found");
        return;
    }

    const dom_taxa = e.features[0].properties.dom_taxa;
    const dom_score = e.features[0].properties.dom_score;
    const sci_name = e.features[0].properties.sci_name;

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(dom_taxa + "<br>" + "Score: " + dom_score + "<br>" + "Lat: " + coordinates[1].toFixed(5) + " " + "Long: " + coordinates[0].toFixed(5))
      .addTo(map);

    });
  });

    // Change the cursor to a pointer when the mouse is over the places layer.
  map.on('mouseenter', 'trees', () => {
  map.getCanvas().style.cursor = 'pointer';
  });
  
  // Change it back to a pointer when it leaves.
  map.on('mouseleave', 'trees', () => {
  map.getCanvas().style.cursor = '';
  });
