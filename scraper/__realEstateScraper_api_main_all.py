from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import requests
import time
import re
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="../backend/.env")

SCRAPER_API_KEY = os.getenv("SCRAPER_API_KEY")
HEADERS = {"x-api-key": SCRAPER_API_KEY}

URLS = [
    "https://www.realestate.co.nz/42988471/residential/sale/5-20-parekura-hei-road-te-kaha",
    "https://www.realestate.co.nz/43001987/residential/sale/99-hillcrest-drive-kelvin-grove",
    "https://www.realestate.co.nz/43001891/residential/sale/38-view-road-ostend",
    "https://www.realestate.co.nz/42947030/residential/sale/20-edgewood-place-peninsula-bay-wanaka",
    "https://www.realestate.co.nz/42996818/residential/sale/81b-mill-street-marton",
    "https://www.realestate.co.nz/42896568/residential/sale/58-opanuku-road-henderson-valley",
]

# -------------------------
# Utilities
# -------------------------
def safe_float(val):
    try:
        return float(val)
    except (TypeError, ValueError):
        return 0.0

def parse_cv_value(raw_value):
    if not raw_value:
        return None

    raw_value = raw_value.strip().replace("$", "").upper()
    multiplier = 1

    if raw_value.endswith("K"):
        multiplier = 1_000
        raw_value = raw_value[:-1]
    elif raw_value.endswith("M"):
        multiplier = 1_000_000
        raw_value = raw_value[:-1]

    try:
        return int(float(raw_value.replace(",", "")) * multiplier)
    except ValueError:
        return None

# -------------------------
# Scraper
# -------------------------
def scrape_listing(driver, wait, url):
    driver.get(url)

    # Wait until key element is loaded
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[data-test="listing-title"]')))
    
    # Get rendered HTML
    soup = BeautifulSoup(driver.page_source, "html.parser")

    # Image
    image_url = None
    img = soup.select_one('[data-test="photo-block"] img')
    if img and img.get("src"):
        src = img["src"].split("?")[0]
        image_url = re.sub(r"\.crop\.[^\.]+\.jpg", ".crop.2880x.jpg", src)

    # Address
    address = soup.select_one('h1[data-test="listing-title"]')
    address = address.get_text(strip=True) if address else None

    # Price
    pricing_method = soup.select_one('[data-test="pricing-method__price"]')
    pricing_method = pricing_method.get_text(strip=True) if pricing_method else None

    price_value = None
    if pricing_method:
        match = re.search(r"\$(\d[\d,]*)", pricing_method)
        if match:
            price_value = int(match.group(1).replace(",", ""))

    # Land area
    land_area_value = None
    elements = soup.select('[data-test="features-icons"] span.leading-\\[-1\\]')
    for el in elements:
        text = el.get_text(strip=True)
        if text.endswith("m2"):
            try:
                land_area_value = float(text.replace("m2", "").strip())
            except ValueError:
                pass
            break

    # CV
    cv_date, cv_value_raw, cv_value = None, None, None
    cv_container = soup.select_one('[data-test="reinz-valuation__cv-price"]')

    if cv_container:
        p = cv_container.find("p")
        h4 = cv_container.find("h4")

        if p:
            cv_date = p.get_text(strip=True)
        if h4:
            cv_value_raw = h4.get_text(strip=True)
            cv_value = parse_cv_value(cv_value_raw)

    return {
        "url": url,
        "image_url": image_url,
        "address": address,
        "pricing_method": pricing_method,
        "price": price_value,
        "land_area_m2": land_area_value,
        "cv_date": cv_date,
        "cv_value_raw": cv_value_raw,
        "cv_value": cv_value
    }

# -------------------------
# API Logic
# -------------------------
def get_property_id(address, land_area):
    params = {"address": address, "land_area_m2": land_area}
    res = requests.get("http://localhost:3000/api/property/searchid", params=params, headers=HEADERS)
    return res.json().get("id")

def insert_property(data):
    res = requests.post("http://localhost:3000/api/property", json=data, headers=HEADERS)
    return res.json().get("data", {}).get("id")

def update_price(property_id, result):
    res = requests.get(f"http://localhost:3000/api/propertyprice/{property_id}", headers=HEADERS)
    existing_price = res.json().get("price")

    if safe_float(result.get("price")) != safe_float(existing_price):
        payload = {
            "property_id": property_id,
            "pricing_method": result.get("pricing_method"),
            "price": result.get("price")
        }
        requests.post("http://localhost:3000/api/propertyprice", json=payload, headers=HEADERS)

def update_cv(property_id, result):
    res = requests.get(f"http://localhost:3000/api/propertycv/{property_id}/date", headers=HEADERS)
    existing_date = res.json().get("cv_date_text")

    if result.get("cv_date") != existing_date:
        payload = {
            "cv_date_text": result.get("cv_date"),
            "cv_value_text": result.get("cv_value_raw"),
            "cv_value": result.get("cv_value")
        }

        res = requests.patch(f"http://localhost:3000/api/propertycv/{property_id}", json=payload, headers=HEADERS)

        if res.json().get("error") == "Property not found":
            payload["property_id"] = property_id
            requests.post("http://localhost:3000/api/propertycv", json=payload, headers=HEADERS)

# -------------------------
# Main
# -------------------------
driver = webdriver.Chrome()
wait = WebDriverWait(driver, 10)

for url in URLS:
    result = scrape_listing(driver, wait, url)
    print(result)

    property_id = get_property_id(result["address"], result["land_area_m2"])

    if not property_id:
        property_id = insert_property({
            "realestate_url": result["url"],
            "image_url": result["image_url"],
            "address": result["address"],
            "land_area_m2": result["land_area_m2"]
        })

    else:
        requests.patch(
            f"http://localhost:3000/api/property/{property_id}/url",
            json={"property_id": property_id, "realestate_url": result["url"]},
            headers=HEADERS
        )

    if result.get("price") is not None:
        update_price(property_id, result)

    if result.get("cv_value") is not None:
        update_cv(property_id, result)

    time.sleep(1)

driver.quit()