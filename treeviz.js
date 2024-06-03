
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
          // Get the ensemble score and coordinates
          const ens_score = e.features[0].properties.ens_score;
          const coordinates = e.features[0].geometry.coordinates[0][0].slice();

          // Only display genus and species in the popup (many NEON names have additional details)
          const sci_name = e.features[0].properties.sci_name;
          const sci_name_split = sci_name.split(" ");
          const sci_name_short = sci_name_split.slice(0, 2).join(" ");
      
          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(sci_name_short + "<br>" + "Score: " + ens_score + "<br>" + "Lat: " + coordinates[1].toFixed(5) + " " + "Long: " + coordinates[0].toFixed(5))
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
    "BART": "2022",
    "BLAN": "2022",
    "BONA": "2021",
    "CLBJ": "2022",
    "DEJU": "2021",
    "DELA": "2021",
    "GRSM": "2022",
    "HARV": "2022",
    "LENO": "2021",
    "MLBS": "2022",
    "NIWO": "2020",
    "OSBS": "2021",
    "RMNP": "2022",
    "SERC": "2022",
    "SJER": "2021",
    "SOAP": "2021",
    "STEI": "2022",
    "TALL": "2021",
    "TEAK": "2021",
    "TREE": "2022",
    "UKFS": "2022",
    "UNDE": "2020",
    "WREF": "2022",
    "YELL": "2020",
  }

  let siteLocationDict = {
    "BART": [-71.2873, 44.04],
    "BLAN": [-78.02, 39.09],
    "BONA": [-147.5026, 65.18],
    "CLBJ": [-97.6, 33.36],
    "DEJU": [-145.71, 63.8811],
    "DELA": [-87.825, 32.5417],
    "GRSM": [-83.5019, 35.64],
    "HARV": [-72.2, 42.5],
    "LENO": [-88.2, 31.825],
    "MLBS": [-80.54, 37.3783],
    "NIWO": [-105.5824, 40.02],
    "OSBS": [-81.9934, 29.68],
    "RMNP": [-105.51, 40.22],
    "SERC": [-76.56, 38.8901],
    "SJER": [-119.7323, 37.08],
    "SOAP": [-119.245, 37.0334],
    "TALL": [-87.42, 32.92],
    "TEAK": [-119.035, 37.024],
    "TREE": [-89.505, 45.4937],
    "UKFS": [-95.1921, 39.02],
    "UNDE": [-89.505, 46.207],
    "WREF": [-121.9519, 45.83],
    "YELL": [-110.526, 44.923],
  }

  let siteSpeciesDict = {
    "BART": ["Dead", "Tsuga canadensis (L.) Carri\u00e8re", "Acer rubrum L.", "Fraxinus americana L.", "Betula alleghaniensis Britton", "Fagus grandifolia Ehrh.", "Betula papyrifera Marshall", "Acer saccharum Marshall"],
    "BLAN": ["Juglans nigra L.", "Liriodendron tulipifera L.", "Quercus rubra L.", "Pinus strobus L.", "Cornus florida L.", "Platanus occidentalis L.", "Celtis occidentalis L.", "Dead"],
    "BONA": ["Populus tremuloides Michx.", "Betula neoalaskana Sarg.", "Picea mariana (Mill.) Britton, Sterns & Poggenb.", "Picea glauca (Moench) Voss", "Dead"],
    "CLBJ": ["Quercus stellata Wangenh.", "Juniperus virginiana L.", "Dead", "Quercus marilandica M\u00fcnchh."],
    "DEJU": ["Picea glauca (Moench) Voss", "Dead", "Populus tremuloides Michx.", "Picea mariana (Mill.) Britton, Sterns & Poggenb."],
    "DELA": ["Carya tomentosa (Lam.) Nutt.", "Quercus nigra L.", "Acer rubrum L.", "Liquidambar styraciflua L.", "Celtis laevigata Willd.", "Fraxinus pennsylvanica Marshall", "Pinus taeda L.", "Dead"],
    "GRSM": ["Quercus montana Willd.", "Acer rubrum L.", "Dead", "Liriodendron tulipifera L."],
    "HARV": ["Acer rubrum L.", "Pinus strobus L.", "Tsuga canadensis (L.) Carri\u00e8re", "Quercus alba L.", "Betula lenta L.", "Quercus rubra L.", "Fraxinus americana L.", "Dead", "Pinus resinosa Aiton", "Betula alleghaniensis Britton", "Nyssa sylvatica Marshall", "Prunus serotina Ehrh.", "Fagus grandifolia Ehrh.", "Picea abies (L.) Karst.", "Quercus velutina Lam."],
    "LENO": ["Quercus pagoda Raf.", "Liquidambar styraciflua L.", "Quercus nigra L.", "Dead"],
    "MLBS": ["Quercus alba L.", "Acer rubrum L.", "Quercus rubra L.", "Quercus coccinea M\u00fcnchh.", "Liriodendron tulipifera L.", "Dead"],
    "NIWO": ["Pinus contorta Douglas ex Loudon", "Dead", "Pinus flexilis James", "Picea engelmannii Parry ex Engelm.", "Abies lasiocarpa (Hook.) Nutt."],
    "OSBS": ["Nyssa sylvatica Marshall", "Quercus virginiana Mill.", "Magnolia sp.", "Pinus palustris Mill.", "Liquidambar styraciflua L.", "Pinus taeda L.", "Acer rubrum L.", "Pinus elliottii Engelm.", "Dead", "Quercus laevis Walter", "Quercus hemisphaerica W. Bartram ex Willd.", "Quercus geminata Small", "Pinus clausa (Chapm. ex Engelm.) Vasey ex Sarg.", "Carya glabra (Mill.) Sweet", "Quercus nigra L."],
    "RMNP": ["Pinus ponderosa Lawson & C. Lawson", "Abies lasiocarpa (Hook.) Nutt.", "Pseudotsuga menziesii (Mirb.) Franco", "Dead", "Pinus contorta Douglas ex Loudon", "Pinus flexilis James", "Populus tremuloides Michx.", "Picea engelmannii Parry ex Engelm."],
    "SERC": ["Platanus occidentalis L.", "Liriodendron tulipifera L.", "Dead", "Liquidambar styraciflua L.", "Acer rubrum L.", "Quercus velutina Lam.", "Quercus falcata Michx.", "Quercus alba L.", "Fagus grandifolia Ehrh.", "Fraxinus pennsylvanica Marshall", "Carya tomentosa (Lam.) Nutt."],
    "SJER": ["Quercus douglasii Hook. & Arn.", "Quercus wislizeni A. DC.", "Pinus sabiniana Douglas ex Douglas", "Dead"],
    "SOAP": ["Calocedrus decurrens (Torr.) Florin", "Dead", "Pinus ponderosa Lawson & C. Lawson", "Quercus chrysolepis Liebm.", "Quercus kelloggii Newberry"],
    "TALL": ["Quercus alba L.", "Pinus taeda L.", "Liquidambar styraciflua L.", "Pinus palustris Mill.", "Pinus echinata Mill.", "Liriodendron tulipifera L.", "Dead"],
    "TEAK": ["Pinus contorta Douglas ex Loudon", "Abies lowiana (Gordon & Glend.) A. Murray bis", "Abies concolor (Gord. & Glend.) Lindl. ex Hildebr.", "Pinus jeffreyi Balf.", "Abies magnifica A. Murray bis", "Dead", "Pinus lambertiana Douglas", "Calocedrus decurrens (Torr.) Florin"],
    "TREE": ["Tilia americana L.", "Betula papyrifera Marshall", "Larix laricina (Du Roi) K. Koch", "Fraxinus pennsylvanica Marshall", "Abies balsamea (L.) Mill.", "Quercus rubra L.", "Pinus resinosa Aiton", "Populus tremuloides Michx.", "Acer saccharum Marshall", "Acer rubrum L.", "Pinus strobus L.", "Picea glauca (Moench) Voss", "Dead", "Picea mariana (Mill.) Britton, Sterns & Poggenb.", "Thuja occidentalis L.", "Tsuga canadensis (L.) Carri\u00e8re"],
    "UKFS": ["Juniperus virginiana L.", "Juglans nigra L.", "Maclura pomifera (Raf.) C.K. Schneid.", "Ulmus americana L.", "Celtis occidentalis L.", "Carya ovata (Mill.) K. Koch", "Dead", "Gleditsia triacanthos L.", "Quercus muehlenbergii Engelm."],
    "UNDE": ["Dead", "Picea glauca (Moench) Voss", "Acer rubrum L.", "Acer saccharum Marshall", "Abies balsamea (L.) Mill.", "Betula alleghaniensis Britton", "Larix laricina (Du Roi) K. Koch", "Fraxinus americana L.", "Tsuga canadensis (L.) Carri\u00e8re", "Picea mariana (Mill.) Britton, Sterns & Poggenb.", "Betula papyrifera Marshall", "Fraxinus nigra Marshall", "Populus grandidentata Michx.", "Populus tremuloides Michx."],
    "WREF": ["Pseudotsuga menziesii (Mirb.) Franco", "Thuja plicata Donn ex D. Don", "Dead", "Tsuga heterophylla (Raf.) Sarg.", "Abies amabilis (Douglas ex Loudon) Douglas ex Forbes"],
    "YELL": ["Pinus contorta Douglas ex Loudon", "Dead", "Pseudotsuga menziesii (Mirb.) Franco", "Populus tremuloides Michx."]
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
