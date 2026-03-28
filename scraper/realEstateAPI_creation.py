import requests
import os
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

# Get the API base URL
api_base_url = os.environ.get("SCRAPER_API_BASE_URL")


def get_property_id(address, land_area, headers):
    params = {"address": address, "land_area_m2": land_area}
    res = requests.get(f"{api_base_url}/api/property/searchid", params=params, headers=headers)
    return res.json().get("id")

def insert_property(data, headers):
    res = requests.post(f"{api_base_url}/api/property", json=data, headers=headers)
    return res.json().get("data", {}).get("id")

def update_price(property_id, result, headers):
    res = requests.get(f"{api_base_url}/api/propertyprice/{property_id}", headers=headers)
    existing_price = res.json().get("pricing_method")

    if result.get("pricing_method") != existing_price:
        payload = {
            "property_id": property_id,
            "pricing_method": result.get("pricing_method"),
            "price": result.get("price")
        }
        requests.post(f"{api_base_url}/api/propertyprice", json=payload, headers=headers)

def update_cv(property_id, result, headers):
    res = requests.get(f"{api_base_url}/api/propertycv/{property_id}/date", headers=headers)
    existing_date = res.json().get("cv_date_text")

    if result.get("cv_date") != existing_date:
        payload = {
            "cv_date_text": result.get("cv_date"),
            "cv_value_text": result.get("cv_value_raw"),
            "cv_value": result.get("cv_value")
        }

        res = requests.patch(f"{api_base_url}/api/propertycv/{property_id}", json=payload, headers=headers)

        print("testing", res.json().get("error"))
        if res.json().get("error"):
            payload["property_id"] = property_id
            requests.post(f"{api_base_url}/api/propertycv", json=payload, headers=headers)