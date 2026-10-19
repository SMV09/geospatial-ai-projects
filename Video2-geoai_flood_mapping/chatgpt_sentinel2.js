
// =====================================================
// Sentinel-2 Flood-Affected Surface
// Trishuli River Corridor, Nepal
// NDVI + MNDWI Change Detection
// =====================================================

// 1. Area of Interest
var roi = ee.Geometry.Polygon([[
  [84.95, 27.75],
  [85.25, 27.75],
  [85.25, 28.15],
  [84.95, 28.15]
]]);

Map.centerObject(roi, 10);


// 2. Sentinel-2 and Cloud Score+
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED');

var cloudScore = ee.ImageCollection(
  'GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED'
);


// 3. Cloud masking
function maskClouds(image) {
  var score = image.select('cs');
  return image.updateMask(score.gte(0.6));
}


// 4. Create pre- and post-flood composites
function getComposite(start, end) {
  return s2
    .filterBounds(roi)
    .filterDate(start, end)
    .linkCollection(cloudScore, ['cs'])
    .map(maskClouds)
    .select(['B2', 'B3', 'B4', 'B8', 'B11'])
    .median()
    .multiply(0.0001)
    .clip(roi);
}

var pre = getComposite('2026-08-01', '2026-08-25');
var post = getComposite('2026-08-26', '2026-09-20');


// 5. RGB images
var rgbVis = {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 0.3
};

Map.addLayer(pre, rgbVis, 'Pre-Flood', false);
Map.addLayer(post, rgbVis, 'Post-Flood', true);


// 6. Calculate spectral indices

// NDVI: vegetation condition
var preNDVI = pre.normalizedDifference(['B8', 'B4']);
var postNDVI = post.normalizedDifference(['B8', 'B4']);

var deltaNDVI = postNDVI.subtract(preNDVI)
  .rename('deltaNDVI');


// MNDWI: water-related changes
var preMNDWI = pre.normalizedDifference(['B3', 'B11']);
var postMNDWI = post.normalizedDifference(['B3', 'B11']);

var deltaMNDWI = postMNDWI.subtract(preMNDWI)
  .rename('deltaMNDWI');


// 7. Identify flood-related changes

// Increase in water signal
var newWater = postMNDWI.gt(0)
  .and(deltaMNDWI.gt(0.10));

// Vegetation disturbance
var vegetationChange = deltaNDVI.lt(-0.20);


// Combine indicators
var affected = newWater
  .or(vegetationChange)
  .rename('affected');


// 8. Visualize index changes
var changeVis = {
  min: -0.6,
  max: 0.6,
  palette: [
    '67001F',
    'B2182B',
    'F4A582',
    'FFFFFF',
    '92C5DE',
    '4393C3',
    '2166AC'
  ]
};

Map.addLayer(
  deltaNDVI,
  changeVis,
  'NDVI Change',
  false
);

Map.addLayer(
  deltaMNDWI,
  changeVis,
  'MNDWI Change',
  false
);


// 9. Final flood-affected surface
Map.addLayer(
  affected.selfMask(),
  {palette: ['00FFFF']},
  'Flood-Affected Surface',
  true
);


// 10. Calculate affected area
var area = affected
  .selfMask()
  .multiply(ee.Image.pixelArea())
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: roi,
    scale: 20,
    maxPixels: 1e13,
    tileScale: 8
  });


// 11. Convert area to different units
var areaM2 = ee.Number(
  ee.Algorithms.If(
    area.contains('affected'),
    area.get('affected'),
    0
  )
);

var areaKm2 = areaM2.divide(1e6);
var areaHa = areaM2.divide(10000);


// 12. Print results
print('Flood-Affected Surface (m²):', areaM2);
print('Flood-Affected Surface (km²):', areaKm2);
print('Flood-Affected Surface (hectares):', areaHa);
