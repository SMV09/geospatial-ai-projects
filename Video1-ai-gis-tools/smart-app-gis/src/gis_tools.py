import geopandas as gpd
from shapely.geometry import Point


def calculate_area(file_path):
    """Calculate polygon area in square kilometres."""
    gdf = gpd.read_file(file_path)
    utm_crs = gdf.estimate_utm_crs()  # estimate crs for local region
    gdf_projected = gdf.to_crs(utm_crs) 
    area_m2 = gdf_projected.geometry.area.sum()
    return area_m2 / 1000000


def calculate_distance(point1, point2):
    """Calculate distance between two (longitude, latitude) points in kilometres."""
    points = gpd.GeoDataFrame(
        geometry=[Point(point1), Point(point2)],
        crs="EPSG:4326"
    )
    points_crs = points.estimate_utm_crs()
    points_projected = points.to_crs(points_crs)
    distance_m = points_projected.geometry.iloc[0].distance(
        points_projected.geometry.iloc[1]
    )
    return distance_m / 1000


def create_buffer(file_path, distance_meters):
    """Create a buffer around features and return it as WGS84."""
    gdf = gpd.read_file(file_path)
    utm_crs = gdf.estimate_utm_crs()
    gdf_projected = gdf.to_crs(utm_crs)
    buffered = gdf_projected.copy()
    buffered["geometry"] = buffered.geometry.buffer(distance_meters)
    return buffered.to_crs("EPSG:4326")


def intersect_layers(layer1_path, layer2_path):
    """Find the spatial intersection between two vector layers."""
    layer1 = gpd.read_file(layer1_path)
    layer2 = gpd.read_file(layer2_path).to_crs(layer1.crs)
    return gpd.overlay(layer1, layer2, how="intersection")
