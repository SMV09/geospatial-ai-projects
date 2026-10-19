var imageVisParam = {"opacity":0.01,"gamma":0.1};

/**
 * Flood Mapping Comparison: Sentinel-1 SAR vs. Sentinel-2 Optical
 * Location: Trishuli River, Nepal
 * Event Date: 26 August 2026
 */

// 1. Define the Area of Interest (Trishuli River Corridor)
var roi = ee.Geometry.Polygon([[
  [84.95, 27.75],
  [85.25, 27.75],
  [85.25, 28.15],
  [84.95, 28.15]
]]);

Map.centerObject(roi, 11);

// Shared Terrain Mask (Used by both workflows to remove topographic noise/shadows)
var terrain = ee.Algorithms.Terrain(ee.Image('USGS/SRTMGL1_003'));
var slope = terrain.select('slope');
var terrainMask = slope.lt(15); // Mask out slopes steeper than 15 degrees

// ============================================================================
// CHAPTER 1: SENTINEL-1 SAR ANALYSIS (Independent)
// ============================================================================

// 2. Load Sentinel-1 GRD Collection and Filter
var s1 = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(roi)
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
  .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING')); 

// 3. Define Pre and Post Flood Timeframes and Select VH Band
var preFloodS1 = s1.filterDate('2026-08-01', '2026-08-25').median().select('VH');
var postFloodS1 = s1.filterDate('2026-08-26', '2026-09-10').median().select('VH');

// 4. Speckle Filtering (Simple Smoothing)
var smoothingRadius = 30;
var preFilteredS1 = preFloodS1.focal_mean(smoothingRadius, 'circle', 'meters');
var postFilteredS1 = postFloodS1.focal_mean(smoothingRadius, 'circle', 'meters');

// 5. Calculate Change (Difference in decibels)
var differenceS1 = postFilteredS1.subtract(preFilteredS1);

// 6. Thresholding
var floodThresholdS1 = -4.5; 
var floodMaskS1 = differenceS1.lt(floodThresholdS1).updateMask(terrainMask);

// Mask out permanent water
var permanentWaterS1 = preFilteredS1.lt(-19); 
var s1FloodLayer = floodMaskS1.where(permanentWaterS1, 0).selfMask();

// ============================================================================
// CHAPTER 2: SENTINEL-2 OPTICAL ANALYSIS (Multi-Index Approach)
// ============================================================================

// 1. Helper Function: Mask using Cloud Score+
function maskCloudScorePlus(image) {
  var CS_THRESHOLD = 0.6;
  return image.updateMask(image.select('cs').gte(CS_THRESHOLD)).divide(10000);
}

// 2. Collections
var s2Col = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED');
var csPlusCol = ee.ImageCollection('GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED');

// 3. Load and filter S2 pre-flood using Cloud Score+
var s2Pre = s2Col.filterBounds(roi)
  .filterDate('2026-08-01', '2026-08-25')
  .linkCollection(csPlusCol, ['cs'])
  .map(maskCloudScorePlus)
  .median();

// 4. Load and filter S2 post-flood using Cloud Score+
var s2Post = s2Col.filterBounds(roi)
  .filterDate('2026-08-26', '2026-09-15')
  .linkCollection(csPlusCol, ['cs'])
  .map(maskCloudScorePlus)
  .median();

/**
 * Multi-Index Function: Calculates MNDWI and NDVI
 * MNDWI: (Green - SWIR1) / (Green + SWIR1) -> B3, B11. Ideal for water detection.
 * NDVI:  (NIR - Red) / (NIR + Red)        -> B8, B4. Used to filter out vegetation.
 */
var getIndices = function(img) {
  var mndwi = img.normalizedDifference(['B3', 'B11']).rename('mndwi');
  var ndvi = img.normalizedDifference(['B8', 'B4']).rename('ndvi');
  return img.addBands([mndwi, ndvi]);
};

var s2PreIndices = getIndices(s2Pre);
var s2PostIndices = getIndices(s2Post);

// 5. Multi-Index Thresholding Logic
// Established approach: Pixels with high MNDWI (> 0) and low NDVI (< 0.2) are classified as water.
var waterThreshold = 0.0;
var ndviThreshold = 0.2;

var isWater = function(img) {
  var waterScore = img.select('mndwi').gt(waterThreshold);
  var vegScore = img.select('ndvi').lt(ndviThreshold);
  return waterScore.and(vegScore);
};

var waterPre = isWater(s2PreIndices);
var waterPost = isWater(s2PostIndices);

// 6. Final Optical Flood Layer: Pixels that changed from Land to Water
var s2FloodLayer = waterPost.and(waterPre.not())
  .updateMask(terrainMask)
  .selfMask()
  .rename('flood_optical');

// ============================================================================
// CHAPTER 3: AREA CALCULATION & VISUALIZATION
// ============================================================================

// Function to calculate area in Hectares and Km2
var calculateArea = function(floodImage, label, scale) {
  var areaImage = floodImage.multiply(ee.Image.pixelArea());
  var stats = areaImage.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: roi,
    scale: scale,
    maxPixels: 1e13
  });
  
  var areaM2 = ee.Number(stats.values().get(0));
  var areaHa = areaM2.divide(10000);
  var areaKm2 = areaM2.divide(1e6);
  
  print('--- ' + label + ' Analysis ---');
  print(label + ' Affected Area (Hectares):', areaHa);
  print(label + ' Affected Area (Km²):', areaKm2);
};

// Calculate Areas for both sensors independently
calculateArea(s1FloodLayer, 'Sentinel-1 (SAR)', 10);
calculateArea(s2FloodLayer, 'Sentinel-2 (Optical)', 10);

// Visualizations
var sarVis = {min: -25, max: 0};
var s2Vis = {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3};

// Sentinel-2 Layers
Map.addLayer(s2Pre, s2Vis, 'S2 Pre-Flood RGB', false);
Map.addLayer(s2Post, s2Vis, 'S2 Post-Flood RGB', false);
Map.addLayer(s2FloodLayer, {palette: ['cyan']}, 'Flood Layer (S2 MNDWI+NDVI)', true);

// Sentinel-1 Layers
Map.addLayer(preFilteredS1, sarVis, 'S1 Pre-Flood VH', false);
Map.addLayer(postFilteredS1, sarVis, 'S1 Post-Flood VH', false);
Map.addLayer(s1FloodLayer, {palette: ['blue']}, 'Flood Layer (S1 SAR)', true);

// Summary
print('Comparison Analysis: Trishuli River');
print('S1 Method:', 'VH Backscatter Change Detection (-4.5 dB)');
print('S2 Method:', 'Established Multi-Index (MNDWI > 0 AND NDVI < 0.2)');