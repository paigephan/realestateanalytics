import requests
import json
from shapely.geometry import Point, shape
import os
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

# Get the API base URL
api_base_url = os.environ.get("SCRAPER_API_BASE_URL")

# =========================
# CONFIG
# =========================
API_KEY = "AIzaSyD09bzyHwhTmW2qzZPZE-mWpmhEctBC_UQ"
GEOJSON_PATH = "/Users/blokparti/Documents/5. UOA/web_project/frontend/public/data/statistical-area-2025.geojson"


# =========================
# 1. Geocode address → lat/lng
# =========================
def geocode_address(address):
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": address,
        "key": API_KEY
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()

        if data["status"] == "OK":
            location = data["results"][0]["geometry"]["location"]
            return location["lat"], location["lng"]
        else:
            print(f"[ERROR] Geocoding failed: {address} | Status: {data['status']}")
            return None, None

    except Exception as e:
        print(f"[ERROR] Request failed: {e}")
        return None, None


# =========================
# 2. Load GeoJSON
# =========================
def load_geojson(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# =========================
# 3. Find suburb (SA2) from lat/lng
# =========================
def find_suburb(lat, lng, geojson):
    point = Point(lng, lat)  # IMPORTANT: (lng, lat)

    for feature in geojson["features"]:
        polygon = shape(feature["geometry"])

        # Handle boundary cases with touches()
        if polygon.contains(point) or polygon.touches(point):
            return feature["properties"].get("SA22025__2")

    return None


# =========================
# 4. MAIN PIPELINE
# =========================
def get_suburb_from_address(address, geojson):
    lat, lng = geocode_address(address)

    if lat is None or lng is None:
        return None, None, None

    suburb = find_suburb(lat, lng, geojson)

    return lat, lng, suburb


# =========================
# 5. RUN EXAMPLE
# =========================
if __name__ == "__main__":

    load_dotenv(dotenv_path="../backend/.env")

    SCRAPER_API_KEY = os.getenv("SCRAPER_API_KEY")
    HEADERS = {"x-api-key": SCRAPER_API_KEY} 

    geojson = load_geojson(GEOJSON_PATH)

    # api_url = f"{api_base_url}/api/property/alladdresses"
    api_url = "http://localhost:1433/api/property/alladdresses"
    print(api_url)
    resp = requests.get(api_url)
    payload = resp.json()
    raw_records = payload.get("data")

    for item in raw_records:
        property_id = item["id"]
        address = item["address"]
        lat, lng, suburb = get_suburb_from_address(address, geojson)

        res_geojsonsuburb = requests.patch(
                f"http://localhost:1433/api/property/{property_id}/geojsonsuburb",
                json={"property_id": property_id, "geojson_suburb": suburb},
                headers=HEADERS
            )
        print(res_geojsonsuburb.json())




    # print("===================================")
    # print("Address :", address)
    # print("Latitude:", lat)
    # print("Longitude:", lng)
    # print("SA2 Area:", suburb)
    # print("===================================")