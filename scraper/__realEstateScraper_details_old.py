from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import re

# Load environment variables
import os
import requests
from dotenv import load_dotenv
load_dotenv(dotenv_path="../backend/.env")


URLS = [
#     "https://www.realestate.co.nz/43008988/residential/sale/37-frederick-drive-dinsdale",
# "https://www.realestate.co.nz/43009156/residential/sale/11-lomond-place-woolston",
# "https://www.realestate.co.nz/42949055/residential/sale/9-tapsell-drive-matamata",
# "https://www.realestate.co.nz/43009078/residential/sale/12-prices-road-havelock",
# "https://www.realestate.co.nz/43009194/residential/sale/753-mount-eden-road-mount-eden",
# "https://www.realestate.co.nz/43009195/residential/sale/26-cockayne-crescent-sunnynook",
# "https://www.realestate.co.nz/43009181/residential/sale/lot-116-14-scott-road-hobsonville",
# "https://www.realestate.co.nz/43009187/residential/sale/2453-state-highway-1-rongotea",
# "https://www.realestate.co.nz/43009147/residential/sale/12-alpers-terrace-marewa",
# "https://www.realestate.co.nz/43009140/residential/sale/31-taraheke-drive-taupiri",
# "https://www.realestate.co.nz/43009151/residential/sale/14-darley-street-maeroa",
# "https://www.realestate.co.nz/43009185/residential/sale/4b-fox-s-terrace-arrowtown",
# "https://www.realestate.co.nz/43009143/residential/sale/84a-martin-farm-road-kaiteriteri",
# "https://www.realestate.co.nz/43009148/residential/sale/7-guys-hill-road-bluff-hill",
# "https://www.realestate.co.nz/43009144/residential/sale/46-pukewhero-rise-westgate",
# "https://www.realestate.co.nz/43009180/residential/sale/5-st-francis-grove-waterloo",
# "https://www.realestate.co.nz/43009183/residential/sale/202-489-selwyn-street-christchurch-central",
# "https://www.realestate.co.nz/43009150/residential/sale/6-4-madeira-place-grafton",
# "https://www.realestate.co.nz/43009026/residential/sale/16-hall-street-kawerau",
# "https://www.realestate.co.nz/42896568/residential/sale/58-opanuku-road-henderson-valley",

"https://www.realestate.co.nz/42988471/residential/sale/5-20-parekura-hei-road-te-kaha",
"https://www.realestate.co.nz/43001987/residential/sale/99-hillcrest-drive-kelvin-grove",
"https://www.realestate.co.nz/43001891/residential/sale/38-view-road-ostend",
"https://www.realestate.co.nz/42947030/residential/sale/20-edgewood-place-peninsula-bay-wanaka",
"https://www.realestate.co.nz/42996818/residential/sale/81b-mill-street-marton",
"https://www.realestate.co.nz/42896568/residential/sale/58-opanuku-road-henderson-valley",
]

results = []

# Setup driver
driver = webdriver.Chrome()
wait = WebDriverWait(driver, 10)

def parse_cv_value(raw_value):
    """
    Convert CV value strings like "$485K" or "$4.15M" to integers.
    """
    if not raw_value:
        return None

    raw_value = raw_value.strip().replace("$", "").upper()  # remove $ and normalize

    multiplier = 1
    if raw_value.endswith("K"):
        multiplier = 1_000
        raw_value = raw_value[:-1]
    elif raw_value.endswith("M"):
        multiplier = 1_000_000
        raw_value = raw_value[:-1]

    try:
        # Remove commas, convert to float, multiply
        value = float(raw_value.replace(",", "")) * multiplier
        return int(value)
    except ValueError:
        return None

for url in URLS:
    print(f"\nScraping: {url}")
    driver.get(url)

    # Wait until key element is loaded
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[data-test="listing-title"]')))

    # Get rendered HTML
    soup = BeautifulSoup(driver.page_source, "html.parser")

    # -------------------------
    # Image
    # -------------------------
    image_url = None
    photo_block_div = soup.find("div", {"data-test": "photo-block"})
    if photo_block_div:
        img_tag = photo_block_div.find("img")
        if img_tag and img_tag.get("src"):
            src_base = img_tag["src"].split("?")[0]
            image_url = re.sub(r"\.crop\.[^\.]+\.jpg", ".crop.2880x.jpg", src_base)

    # -------------------------
    # Address
    # -------------------------
    address_el = soup.select_one('h1[data-test="listing-title"]')
    address = address_el.get_text(strip=True) if address_el else None
    
    # -------------------------
    # Price
    # -------------------------
    price_el = soup.select_one('[data-test="listing-pricing-method"] [data-test="pricing-method__price"]')
    pricing_method = price_el.get_text(strip=True) if price_el else None
    price_value = None

    if pricing_method:
        match = re.search(r"\$(\d[\d,]*)", pricing_method)
        if match:
            price_value = int(match.group(1).replace(",", ""))

    # -------------------------
    # Land area (numeric)
    # -------------------------
    land_area_value = None
    elements = soup.select('[data-test="utils__primary-info"] [data-test="features-icons"] span.leading-\\[-1\\]')
    for el in elements:
        text = el.get_text(strip=True)
        if text.endswith("m2"):
            try:
                land_area_value = float(text.replace("m2", "").strip())
            except ValueError:
                land_area_value = None
            break

    # -------------------------
    # Capital valuation
    # -------------------------
    cv_date = None
    cv_value_raw = None
    cv_value = None
    capital_valuation_container = soup.select_one('[data-test="reinz-valuation__cv-price"]')
    if capital_valuation_container:
        # cv_date = [p.get_text(strip=True) for p in capital_valuation_container.find_all('p')]
        p_tag = capital_valuation_container.find('p')
        if p_tag:
            cv_date = p_tag.get_text(strip=True)

        h4_tag = capital_valuation_container.find('h4')
        if h4_tag:
            cv_value_raw = h4_tag.get_text(strip=True) 
            cv_value = parse_cv_value(cv_value_raw)
        # cv_value = [h4.get_text(strip=True) for h4 in capital_valuation_container.find_all('h4')]


    # Output
    print("URL:", url)
    print("Image URL:", image_url) 
    print("Address:", address) 
    print("Pricing Method:", pricing_method) 
    print("Price:", price_value) 
    print("Land area (m2):", land_area_value) 
    print("CV Date:", cv_date) 
    print("CV Value Raw:", cv_value_raw)
    print("CV Value:", cv_value)

    # -------------------------
    # Append to results
    # -------------------------
    results.append({
        "url": url,
        "image_url": image_url,
        "address": address,
        "pricing_method": pricing_method,
        "price": price_value,
        "land_area_m2": land_area_value,
        "cv_date": cv_date,
        "cv_value_raw": cv_value_raw,
        "cv_value": cv_value
    })

    # Optional: throttle
    time.sleep(1)

# print(results)
driver.quit()

SCRAPER_API_KEY = os.getenv("SCRAPER_API_KEY")
print(SCRAPER_API_KEY)

# Prepare headers
headers = {"x-api-key": SCRAPER_API_KEY}

for result in results:
    # print(result)
    params = {
        "address": result.get('address'),
        "land_area_m2": result.get('land_area_m2')
        }
    # Test getPropertyID API
    response_get_propertyID = requests.get("http://localhost:3000/api/property/searchid", params, headers=headers)
    response_propertyID = response_get_propertyID.json()
    propertyID = response_propertyID.get('id')
    print(propertyID)
    if propertyID == None:
        propertyInfo = {
            "realestate_url": result.get('url'),
            "image_url": result.get('image_url'),
            "address": result.get('address'),
            "land_area_m2": result.get('land_area_m2')
        }
        response_insertPropertyInfo = requests.post("http://localhost:3000/api/property", json=propertyInfo, headers=headers)
        print(response_insertPropertyInfo.json())
        newproperty_id = response_insertPropertyInfo.json().get("data", {}).get("id")
        print("new", newproperty_id)
        
        if result.get('cv_value') != None : 
            propertycv = {
                "property_id": newproperty_id,
                "cv_date_text": result.get('cv_date'),
                "cv_value_text": result.get('cv_value_raw'),
                "cv_value": result.get('cv_value')
            }
            response_insertPropertyCV = requests.post("http://localhost:3000/api/propertycv", json=propertycv, headers=headers)
            print(response_insertPropertyCV.json())

        if result.get('price') != None : 
            propertyprice = {
                "property_id": newproperty_id,
                "pricing_method": result.get('pricing_method'),
                "price": result.get('price')
            }
            response_insertPropertyPrice = requests.post("http://localhost:3000/api/propertyprice", json=propertyprice, headers=headers)
            print(response_insertPropertyPrice.json())
    
    else:
        propertyIDnURL = {
            "property_id": propertyID,
            "realestate_url": result.get('url')
        }
        response_updatePropertyURL = requests.patch(f"http://localhost:3000/api/property/{propertyID}/url", json=propertyIDnURL, headers=headers)
        print(response_updatePropertyURL.json())
        
        response_getPropertyPrice = requests.get(f"http://localhost:3000/api/propertyprice/{propertyID}", headers=headers)
        print(response_getPropertyPrice.json())
        propertyprice = response_getPropertyPrice.json().get("price")
        print(propertyprice)
        print(result.get('price'))
        if float(result.get('price') or 0) != float(propertyprice or 0):
            propertyprice_update = {
                "property_id": propertyID,
                "pricing_method": result.get('pricing_method'),
                "price": result.get('price')
            }
            response_insertPropertyPrice = requests.post("http://localhost:3000/api/propertyprice", json=propertyprice_update, headers=headers)
            print(response_insertPropertyPrice.json())
        
        response_getPropertyCVdate = requests.get(f"http://localhost:3000/api/propertycv/{propertyID}/date", headers=headers)
        propertycvdate = response_getPropertyCVdate.json().get("cv_date_text")
        print(propertycvdate)
        print(result.get('cv_date'))
        if result.get('cv_date') != propertycvdate:
            newpropertycv = {
                "cv_date_text": result.get('cv_date'),
                "cv_value_text": result.get('cv_value_raw'),
                "cv_value": result.get('cv_value')
            }
            response_insertPropertyCV = requests.patch(f"http://localhost:3000/api/propertycv/{propertyID}", json=newpropertycv, headers=headers)
            message = response_insertPropertyCV.json().get("error")
            if message == "Property not found":
                propertycv = {
                "property_id": propertyID,
                "cv_date_text": result.get('cv_date'),
                "cv_value_text": result.get('cv_value_raw'),
                "cv_value": result.get('cv_value')
                }
                response_insertPropertyCV = requests.post("http://localhost:3000/api/propertycv", json=propertycv, headers=headers)
                print(response_insertPropertyCV.json())


        

