from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
import requests
import time
from dotenv import load_dotenv
import os
from realEstateScraper_details import scrape_propertydetails
from realEstateAPI_creation import get_property_id, insert_property, update_price, update_cv
from realEstateScraper_listings import scrape_propertylistings, totalpages
import random
from realEstateUtils import extract_suburb_district
from suburbsGeoMatcher import load_geojson, get_suburb_from_address


# Load environment variables from a .env file
load_dotenv()

# Get the API base URL
api_base_url = os.environ.get("SCRAPER_API_BASE_URL")

GEOJSON_PATH = "../backend/public/data/statistical-area-2025.geojson"
geojson = load_geojson(GEOJSON_PATH)

def main(url, headers):

    # Step 7.1: Scrape property details from individual property page
    result = scrape_propertydetails(driver, wait, url)
    print(result)

    # Step 7.2: Insert or Update property into DB
    property_id = get_property_id(result["address"], result["land_area_m2"], headers)

    if not property_id:
        suburb, district = extract_suburb_district(result.get("address"))

        property_id = insert_property(
            {
            "realestate_url": result["url"],
            "image_url": result["image_url"],
            "address": result["address"],
            "land_area_m2": result["land_area_m2"],
            "district": district,
            "suburb": suburb,
            "property_type": result["property_type"]
            }, 
            headers
        )
        

    else:
        requests.patch(
            f"{api_base_url}/api/property/{property_id}/url",
            json={"property_id": property_id, "realestate_url": result["url"]},
            headers=headers
        )
    
    if result.get("pricing_method") is not None:
        update_price(property_id, result, headers)

    if result.get("cv_value") is not None:
        update_cv(property_id, result, headers)

    suburb = get_suburb_from_address(result["address"], geojson)

    res_geojsonsuburb = requests.patch(
                f"{api_base_url}/api/property/{property_id}/geojsonsuburb",
                json={"property_id": property_id, "geojson_suburb": suburb},
                headers=HEADERS
            )
    print(res_geojsonsuburb.json())

    time.sleep(random.uniform(0.5, 1.5))

if __name__ == "__main__":

    start_time = time.time()

    # Step 1.1: Initiate driver
    driver = webdriver.Chrome()
    wait = WebDriverWait(driver, 30)

    try:
        # Step 1.2: Load API key
        load_dotenv(dotenv_path="../backend/.env")

        SCRAPER_API_KEY = os.getenv("SCRAPER_API_KEY")
        HEADERS = {"x-api-key": SCRAPER_API_KEY} 
        
        # Step 2: Get total pages to crawl
        BASE_URL = "https://www.realestate.co.nz/residential/sale/auckland/house"
        PAGES = totalpages(driver, wait, BASE_URL)
        print("Total Pages:", PAGES)
        # PAGES = 95  # For testing

        # Step 3: run through all pages
        seen_urls = set()
        for page in range(1, PAGES + 1): # remember to edit back to 1
            page_url = f"{BASE_URL}?page={page}"
            print(f"Scraping {page_url}")

            driver.get(page_url)
            wait.until(lambda d: d.execute_script(   # ✅ Wait for page load
                "return document.readyState") == "complete")

            try:

                # Step 4: crawl a list of properties on each page
                page_data = scrape_propertylistings(driver, page, seen_urls)
                print(f"Page {page}: found {len(page_data)} listings | seen_urls total: {len(seen_urls)}")
                
                # Step 5: run through each property
                for data in page_data:
                    print(data)
                    print("remaining pages:", PAGES - page)
                    # Step 6: update each listing of property to db
                    response = requests.post(f"{api_base_url}/api/listinghistory", json=data, headers=HEADERS)
                    listing_url = data.get('realestate_url')

                    # Step 7: Crawl details of each property & update db accordingly
                    main(listing_url, HEADERS)

            except Exception as e:
                print(f"Error on page {page}: {e}")
                with open("failed_pages.log", "a") as f:  # ✅ Log failures
                    f.write(f"Page {page}: {e}\n")

    finally:
        # Step 8: Close driver
        driver.quit()
    
        end_time = time.time()
        print(f"\nTotal execution time: {end_time - start_time:.2f} seconds") # 3.6hrs of crawling