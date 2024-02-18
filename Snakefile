SITES = ["SJER","GRSM","TEAK","BONA","STEI","NIWO","YELL","SERC","DELA","DEJU","UNDE","SOAP","MLBS","TREE","WREF","TALL","HARV","OSBS","CLBJ","BLAN","LENO","RMNP","BART","UKFS"]
YEARS = [2021,2022,2021,2021,2022,2020,2020,2022,2021,2021,2020,2021,2022,2022,2022,2021,2022,2021,2022,2022,2021,2022,2022,2022]

rule all:
    input:
        expand("/blue/ewhite/neon-mbtiles/{site}_{year}_rgb.mbtiles", zip(SITES, YEARS))

rule merge:
    output:
        merged = "/blue/ewhite/neon-mbtiles/{site}_rgb_merged.tif"
    resources:
        gpu = 1
    shell:
        """
        gdal_merge.py -n 0 -a_nodata 0 -o {output.merged} /orange/ewhite/NeonData/{wildcards.site}/DP3.30010.001/neon-aop-products/{wildcards.year}/FullSite/D*/*/L3/Camera/Mosaic/*.tif
        """

rule reproject:
    input:
        merged = rules.merge.output.merged
    output:
        reprojected = "/blue/ewhite/neon-mbtiles/{site}_rgb_webmercator.tif"
    resources:
        gpu = 1
    shell:
        """
        gdalwarp -dstalpha -t_srs EPSG:3857 {input.merged} {output.reprojected}
        """

rule create_mbtiles:
    input:
        reprojected = rules.reproject.output.reprojected
    output:
        mbtiles = "/blue/ewhite/neon-mbtiles/{site}_rgb.mbtiles"
    resources:
        cpus = 14
    shell:
        """
        rio -v mbtiles {input.reprojected} --rgba --format 'WEBP' --progress-bar -o {output.mbtiles} -j 10 --zoom-levels 12..20
        """
