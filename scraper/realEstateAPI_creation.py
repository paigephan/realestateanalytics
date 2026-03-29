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
    print(res.json())
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

def insert_cv(headers, payload):
    res = requests.post(
        f"{api_base_url}/api/propertycv",
        json=payload,
        headers=headers
    )

    if res.status_code not in (200, 201):
        print(f"Failed to insert CV for property {payload.get('property_id')}")


def update_cv(property_id, result, headers):
    try:
        res = requests.get(
            f"{api_base_url}/api/propertycv/{property_id}/date",
            headers=headers
        )

        if res.status_code != 200:
            print(f"Failed to fetch CV for property {property_id}")
            return

        try:
            data = res.json()
        except ValueError:
            print(f"Invalid JSON for property {property_id}")
            return

        existing_date = data.get("cv_date_text")

        new_date = result.get("cv_date")
        new_value_raw = result.get("cv_value_raw")
        new_value = result.get("cv_value")

        # 🚫 Skip if no new data
        if new_date is None:
            return

        # ✅ Insert
        if existing_date is None:
            payload = {
                "property_id": property_id,
                "cv_date_text": new_date,
                "cv_value_text": new_value_raw,
                "cv_value": new_value
            }
            insert_cv(headers, payload)

        # 🔄 Update only if changed
        elif new_date != existing_date:
            payload = {
                "cv_date_text": new_date,
                "cv_value_text": new_value_raw,
                "cv_value": new_value
            }

            res = requests.patch(
                f"{api_base_url}/api/propertycv/{property_id}",
                json=payload,
                headers=headers
            )

            if res.status_code not in (200, 204):
                print(f"Failed to update CV for property {property_id}")

    except Exception as e:
        print(f"Error updating CV for property {property_id}: {e}")