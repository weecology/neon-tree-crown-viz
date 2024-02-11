#!/bin/bash
#SBATCH --job-name=NeonViz   # Job name
#SBATCH --mail-type=END               # Mail events
#SBATCH --mail-user=ethanwhite@ufl.edu # Where to send mail
#SBATCH --account=ewhite
#SBATCH --nodes=1                 # Number of MPI r
#SBATCH --cpus-per-task=20
#SBATCH --mem=160GB
#SBATCH --time=24:00:00       #Time limit hrs:min:sec
#SBATCH --output=/blue/ewhite/b.weinstein/DeepTreeAttention/Zenodo/neon-viz-log-%j.out   # Standard output and error log
#SBATCH --error=/blue/ewhite/b.weinstein/DeepTreeAttention/Zenodo/neon-viz-log-%j.err
#SBATCH --partition=hpg-default

eval "$(conda shell.bash hook)"
conda activate tippecanoe
ml gdal
cd /blue/ewhite/b.weinstein/DeepTreeAttention/Zenodo/

for site in $(ls *.zip | grep -v 'crops.zip' | sed 's/.zip//g'); do
    if [ ! -f "$site.mbtiles" ]; then
        echo "Processing: " $site
    
        echo "Unzipping: " $site
        unzip -q -d $site $site.zip
    
        echo "Merging: " $site
        ogrmerge.py -progress -single -f GeoJSON -o $site.geojson $site/*.shp
    
        echo "Transforming: " $site
        ogr2ogr -progress -t_srs EPSG:3857 "$site"_webmercator.geojson $site.geojson
    
        echo "Creatin mbtiles file: " $site
        tippecanoe -zg --projection=EPSG:3857 -o "$site"_trees.mbtiles --drop-densest-as-needed --extend-zooms-if-still-dropping "$site"_webmercator.geojson
    
        echo "Deleting intermediate files: " $site
        rm -rf $site
        rm $site.geojson
        rm "$site"_webmercator.geojson

        python upload_mapbox.py "$site"_trees.mbtiles
    fi
done
