
  mapboxgl.accessToken = 'pk.eyJ1IjoiYndlaW5zdGVpbiIsImEiOiJjbHJ3aWV6OXIxM3llMmpsZXNjZjNocDBxIn0.aNJNRY4h_3l6IqyrQirH4A'; // Still figuring out the secure way to handle this

  const mapdata = document.querySelector('#map');
  function makeMap(selectedSite, selectedYear, selectedLocation, selectedSpecies) {
        // Use the new value
        let rasterTileset = selectedSite + '_' + selectedYear + '_rgb';
        let vectorTileset = selectedSite + '_trees';
        let rasterTilesetURL = 'mapbox://bweinstein.' + rasterTileset;
        let vectorTilesetURL = 'mapbox://bweinstein.' + vectorTileset;
    
        let speciesList = selectedSpecies;
      
      //  document.getElementById('rastertileset-select').addEventListener('change', function() {
      //    document.getElementById('map').dataset.rastertileset = this.value;
      //  });
        
        const map = new mapboxgl.Map({
          container: 'map', // container id
          style: 'mapbox://styles/mapbox/light-v11', // stylesheet location
          center: selectedLocation, // starting position [lng, lat]
          zoom: 12 // starting zoom
        });
      
        // Define your categories and corresponding colors
        var num_species = speciesList.length
        console.log(num_species)
        var colors = chroma.scale('Spectral').colors(num_species)
      
        // Create the match expression for color boxes by species
        var speciesColors = ['match', ['get', 'sci_name']]; // Replace 'property-name' with the name of your property
        speciesList.forEach(function(species, i) {
            speciesColors.push(species, colors[i]);
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
            'source-layer': selectSite.value + '_webmercator',
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
            'source-layer': selectSite.value + '_webmercator',
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
          if (!e.features[0].properties || !e.features[0].properties.sci_name) {
              console.log("No sci_name found");
              return;
          }
      
          const dom_score = e.features[0].properties.dom_score;

          // Only display genus and species in the popup (many NEON names have additional details)
          const sci_name = e.features[0].properties.sci_name;
          const sci_name_split = sci_name.split(" ");
          const sci_name_short = sci_name_split.slice(0, 2).join(" ");
      
          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(sci_name_short + "<br>" + "Score: " + dom_score + "<br>" + "Lat: " + coordinates[1].toFixed(5) + " " + "Long: " + coordinates[0].toFixed(5))
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
  }

  let siteYearDict = {
    "SJER": "2021",
    "OSBS": "2021"
  }

  let siteLocationDict = {
    "SJER": [-119.73228, 37.09],
    "OSBS": [-81.993431, 29.689282]
  }
  
  let siteSpeciesDict = {
    "SJER": ["Quercus douglasii Hook. & Arn.", "Quercus wislizeni A. DC.", "Pinus sabiniana Douglas ex Douglas"],
    "OSBS": ["Pinus palustris Mill.", "Pinus elliottii Engelm.", "Pinus clausa (Chapm. ex Engelm.) Vasey ex Sarg.", "Liquidambar styraciflua L.", "Quercus geminata Small", "Quercus virginiana Mill.", "Quercus hemisphaerica W. Bartram ex Willd.", "Pinus taeda L.", "Nyssa sylvatica Marshall", "Acer rubrum L.", "Quercus laurifolia Michx.", "Magnolia sp.", "Quercus nigra L.", "Quercus laevis Walter", "Carya glabra (Mill.) Sweet"]
  }

  var selectSite = document.getElementById('site-select');
  var selectedSite = selectSite.value;
  var selectedYear = siteYearDict[selectedSite];
  var selectedLocation = siteLocationDict[selectedSite];
  var selectedSpecies = siteSpeciesDict[selectedSite];
  makeMap(selectedSite, selectedYear, selectedLocation, selectedSpecies);

  selectSite.addEventListener('change', function() {
    var selectedSite = this.value;
    var selectedYear = siteYearDict[selectedSite];
    var selectedLocation = siteLocationDict[selectedSite];
    var selectedSpecies = siteSpeciesDict[selectedSite];
    makeMap(selectedSite, selectedYear, selectedLocation, selectedSpecies);
  });
