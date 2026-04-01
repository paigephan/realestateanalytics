import json
import csv

# --- Config ---
GEOJSON_PATH = "/Users/blokparti/Documents/5. UOA/web_project/frontend/public/data/statistical-area-2025.geojson"
SUBURB_NAME_KEY = "SA22025__1"
OUTPUT_FILE = "geo_suburbs.xlsx"

# Load GeoJSON
with open(GEOJSON_PATH, "r") as f:
    geo = json.load(f)

# Extract suburb names
geo_suburbs = [
    feature["properties"].get(SUBURB_NAME_KEY, "").strip()
    for feature in geo["features"]
    if feature["properties"].get(SUBURB_NAME_KEY)
]

# Remove duplicates + sort
geo_suburbs = sorted(set(geo_suburbs))

with open("geo_suburbs.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["Suburb Name"])
    
    for suburb in geo_suburbs:
        writer.writerow([suburb])