import os
import json
import zipfile
import geopandas as gpd
import pandas as pd
import shutil
from glob import glob
from tqdm import tqdm

results = {}
for zip_file in glob('*.zip'):
    if zip_file != "crops.zip":
        site = os.path.splitext(zip_file)[0]
        print(f"Processing: {site}")

        print(f"Unzipping: {site}")
        with zipfile.ZipFile(zip_file, 'r') as zip_ref:
            zip_ref.extractall('.')

        print(f"Reading data for: {site}")
        site_data = gpd.GeoDataFrame()
        for shp_file in tqdm(glob(f"{site}/*.shp")):
            file_data = gpd.read_file(shp_file)
            site_data = pd.concat([site_data, file_data],
                                ignore_index=True)

        unique_sci_name = site_data['sci_name'].unique().tolist()
        results[site] = unique_sci_name
        
        print(f"Removing unzipped folder for: {site}")
        shutil.rmtree(site)

with open("site_species_dict.json", "w") as fp:
    json.dump(results, fp)
