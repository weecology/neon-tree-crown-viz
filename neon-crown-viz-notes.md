## kepler.gl

* Open source based on deck.gl and also somehow on mapbox
* Loads geoarrow files (but geoarrow must be created without compression; bc JS implementation doesn't handle it)

```sh
ogr2ogr -f arrow -lco COMPRESSION=NONE SJER_2021_HALF_uncomp.arrow SJER_2021_HALF.shp
```

* Reasonable fast on my laptop
* Might be a lot better on a machine with a GPU
* Client side rendering
* But would require download of full dataset and each site is 100+ MB

## mapbox

* Need to create mapbox vector tiles (MVT)
* Done using the tippecanoe fork at https://github.com/felt/tippecanoe (which no one links too...)
* Because it is tiled shouldn't require full download
* Could potentially be simply implemented
* But may cost money if it becomes popular
* Mapbox could change it's currently functional for low use cost structure
* Ben has had bad luck before, but I think if figure out the right build steps with tippecanoe this will probably work

* Need to start by creating a single combined geojson file
* On the HPG this should be done using `ml gdal` not by installing `gdal` in the conda environment because conda's gdal fails (can't load `proj`)

```sh
ogrmerge.py -progress -single -f GeoJSON -o myfile.geojson *.shp
```

* Then reproject into webmercator (EPSG:3857)

```sh
ogr2ogr -t_srs EPSG:3857 myfile_webmercator.geojson myfile.geojson
```

* This seems to work using the fork of tippecanoe (https://github.com/felt/tippecanoe) but not the mapbox version.

```sh
tippecanoe -zg --projection=EPSG:3857 -o myfile.mbtiles --drop-densest-as-needed --extend-zooms-if-still-dropping myfile_webmercator.geojson
```

* `--drop-densest-as-needed` drops boxes at each zoom level to keep the overall size of the observed tile small enough to load quickly (I think)
* `--extend-zooms-if-still-dropping` ensures that at the highest zoom level all boxes are shown. Because our data is so high n without this we never see all of the crowns. We'll still need to make sure that in really dense sites that this doesn't cause confusion if we're getting zoomed close enough to see individual trees but are still far out enough that boxes are being dropped

* This works fine for installing the fork locally, but not the HPG

```sh
git clone https://github.com/felt/tippecanoe.git
cd tippecanoe
make -j
make install
```

* So, let's try to install it via homebrew
* Use the special [unsupported non-sudo install instructions](https://docs.brew.sh/Installation#untar-anywhere-unsupported) (this should go well)
* Narrator - it did not go well
* Looks like maybe it's actually [available via conda-forge](https://anaconda.org/conda-forge/tippecanoe)!?! (undocumented; 6 months out of date)

## mbtiles for RGB

### Download all of the RGB for a site + year combination

* Use the R package neonUtilities (coming soon to Python)

```r
byFileAOP("DP3.30010.001", site="SJER", year="2021", check.size=T)
```

### Combine all of the RGB into one large tiff

* Navigate to the highly nested directory from the download and run

```sh
gdal_merge.py -o SJER_2021_RGB_merged.tif *.tif
```

* This will take a looooooong time (just over 5 hours for SJER; a small site)

### Convert to mbtiles

```sh
rio -v mbtiles SJER_2021_RGB_merged.tif --format 'JPEG' --resampling 'average' --progress-bar -o SJER_2021_RGB_merged.mbtiles -j 2 --zoom-levels 12..20
```

* TODO: trim extra NA values (currently there is a large black border around the image)
* TODO: convert color of NA values to transparent

## Mapbox styling

### Popup on Click

Here is the solution using JS ~~which I'm not doing yet, but might need to~~

<https://docs.mapbox.com/mapbox-gl-js/example/popup-on-click/>
