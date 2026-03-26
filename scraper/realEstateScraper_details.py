from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import re
from realEstateUtils import parse_cv_value

def scrape_propertydetails(driver, wait, url):
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