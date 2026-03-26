import requests
from realEstateUtils import safe_float

def get_property_id(address, land_area, headers):
    params = {"address": address, "land_area_m2": land_area}
    res = requests.get("http://localhost:3000/api/property/searchid", params=params, headers=headers)
    return res.json().get("id")

def insert_property(data, headers):
    res = requests.post("http://localhost:3000/api/property", json=data, headers=headers)
    return res.json().get("data", {}).get("id")

def update_price(property_id, result, headers):
    res = requests.get(f"http://localhost:3000/api/propertyprice/{property_id}", headers=headers)
    existing_price = res.json().get("price")

    if safe_float(result.get("price")) != safe_float(existing_price):
        payload = {
            "property_id": property_id,
            "pricing_method": result.get("pricing_method"),
            "price": result.get("price")
        }
        requests.post("http://localhost:3000/api/propertyprice", json=payload, headers=headers)

def update_cv(property_id, result, headers):
    res = requests.get(f"http://localhost:3000/api/propertycv/{property_id}/date", headers=headers)
    existing_date = res.json().get("cv_date_text")

    if result.get("cv_date") != existing_date:
        payload = {
            "cv_date_text": result.get("cv_date"),
            "cv_value_text": result.get("cv_value_raw"),
            "cv_value": result.get("cv_value")
        }

        res = requests.patch(f"http://localhost:3000/api/propertycv/{property_id}", json=payload, headers=headers)

        if res.json().get("error") == "Property not found":
            payload["property_id"] = property_id
            requests.post("http://localhost:3000/api/propertycv", json=payload, headers=headers)