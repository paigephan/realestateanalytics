from bs4 import BeautifulSoup
import time
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC


def totalpages(driver, wait, URL):
    driver.get(URL)

    # Wait until key element is loaded
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[data-test="paginated-items__current-page"]')))

    # Get rendered HTML
    soup = BeautifulSoup(driver.page_source, "html.parser")
    pages = soup.find_all("a", class_="paginated-items__page-number")

    if pages:
        return int(pages[-1].text.strip())

    return 1

def scrape_propertylistings(driver, page, seen_urls):
    data = []

    # Wait until listings are loaded
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "a[href*='/residential/sale/']"))
    )

    soup = BeautifulSoup(driver.page_source, "html.parser")
    listings = soup.select("a[href*='/residential/sale/']")

    for listing in listings:
        link = listing.get("href")
        if link:
            if not link.startswith("http"):
                link = "https://www.realestate.co.nz" + link

            # Skip invalid links
            if link.startswith("https://www.realestate.co.nz/residential/sale/"):
                continue
            
            # Remove duplicates
            if link not in seen_urls:
                seen_urls.add(link)
                data.append({
                    "page_no": page,
                    "realestate_url": link,
                })

    return data

if __name__ == "__main__":

    driver = webdriver.Chrome()
    wait = WebDriverWait(driver, 10)    
    BASE_URL = "https://www.realestate.co.nz/residential/sale/auckland/house?pm=1"
    # PAGES = totalpages(driver, wait, BASE_URL)
    # print(PAGES)
    PAGES = 1  # For testing
    data = scrape_propertylistings(driver, BASE_URL, PAGES)
    print(data)
    driver.quit()