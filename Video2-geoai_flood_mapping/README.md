# Can AI help us map real-world flood-affected areas using satellite imagery?

This project explores AI-assisted flood-related change detection following the 26 August 2026 flood event in the Trishuli River corridor, Nepal, using Google Earth Engine (GEE), Sentinel-1 SAR, Sentinel-2 optical imagery, GEE Ask AI, and ChatGPT.

## Workflows explored

Sentinel-1 SAR: Pre- and post-event VH backscatter change detection.

Sentinel-2 optical: Spectral index analysis using MNDWI and NDVI, with Cloud Score+ for cloud masking.

Workflow comparison: Comparing AI-assisted approaches and inspecting potential flood-related changes in satellite imagery.

## Limitations

Different prompts, thresholds, and sensor methodologies yield different flood extents. The mapped outputs require scientific interpretation and independent validation before operational use.


References
1. Clement, M. A., Kilsby, C. G., & Moore, P. (2018). Multi-temporal synthetic aperture radar flood mapping using change detection. Journal of Flood Risk Management. https://doi.org/10.1111/jfr3.12303
2. An Intercomparison of Sentinel-1 Based Change Detection Algorithms for Flood Mapping. (2023). Remote Sensing, 15(5), 1200. https://www.mdpi.com/2072-4292/15/5/1200
3. Xu, H. (2006). Modification of normalised difference water index (NDWI) to enhance open water features in remotely sensed imagery. International Journal of Remote Sensing, 27(14), 3025–3033. https://doi.org/10.1080/01431160600589179
4. Cian, F., Delgado Blasco, J. M., & Ivanescu, C. (2024). Improving rapid flood impact assessment: An enhanced multi-sensor approach including a new flood mapping method based on Sentinel-2 data. https://doi.org/10.1016/j.jenvman.2024.122326
5. Google Earth Engine. Sentinel-1 GRD Dataset. https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S1_GRD
6. Google Earth Engine. Sentinel-2 Surface Reflectance Harmonized Dataset. https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_SR_HARMONIZED
7. Google Earth Engine. Cloud Score+ Dataset. https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_CLOUD_SCORE_PLUS_V1_S2_HARMONIZED
