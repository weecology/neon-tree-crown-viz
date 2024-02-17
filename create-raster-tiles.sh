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
conda activate mbtiles
ml gdal
cd /blue/ewhite/b.weinstein/DeepTreeAttention/Zenodo/

# List of sites in tree crowns paper
sites=("SJER" "GRSM" "TEAK" "BONA" "STEI" "NIWO" "YELL" "SERC" "DELA" "DEJU" "UNDE" "SOAP" "MLBS" "TREE" "WREF" "TALL" "HARV" "OSBS" "CLBJ" "BLAN" "LENO" "RMNP" "BART" "UKFS")
for site in ${sites[@]}; do
    echo "Finding RGB tiles: " $site
    site_dir=/orange/ewhite/NeonData/$site

    # Get the most recent year available for the site excluding 2023 (since 2023 was available when we ran the models)
    # Special case UNDE which has a 2022 directory but not the correct form of the data product for that year (kmz not tiff)
    newest_year_dir=$(ls -r $site_dir/DP3.30010.001/neon-aop-products/ | grep -v 2023 | head -1)
    if [ $site == "UNDE" ]; then
        newest_year_dir="2020"
    fi

    tiles=$(find $site_dir/DP3.30010.001/neon-aop-products/$newest_year_dir/FullSite/D*/*/L3/Camera/Mosaic/*.tif -type f)
    
    echo "Merging: " $site
    gdal_merge.py -o /blue/ewhite/neon-mbtiles/"$site"_rgb_merged.tif $tiles

    echo "Reprojecting: " $site
    gdalwarp -dstalpha -t_srs EPSG:3857 /blue/ewhite/neon-mbtiles/"$site"_rgb_merged.tif /blue/ewhite/neon-mbtiles/"$site"_rgb_webmercator.tif

    echo "Creating mbtiles: " $site
    rio -v mbtiles /blue/ewhite/neon-mbtiles/"$site"_rgb_webmercator.tif --format 'JPEG' --resampling 'average' --progress-bar -o /blue/ewhite/neon-mbtiles/"$site"_rgb.mbtiles -j 20 --zoom-levels 12..20

    echo "Cleaning up: " $site
    rm /blue/ewhite/neon-mbtiles/"$site"_rgb_merged.tif /blue/ewhite/neon-mbtiles/"$site"_rgb_webmercator.tif
done