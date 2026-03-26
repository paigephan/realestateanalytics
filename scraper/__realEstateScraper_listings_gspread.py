import os
import requests
from bs4 import BeautifulSoup
import time
from datetime import datetime
import gspread

BASE_URL = "https://www.realestate.co.nz/residential/sale/auckland/house"

headers = {
    "User-Agent": "Mozilla/5.0"
}

# Authenticate with Google Sheets
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
gs_ac_file = os.path.join(BASE_DIR, "service_account.json")
gc = gspread.service_account(filename=gs_ac_file)

def crawl_listings():
    data = []
    seen_urls = set()  # to remove duplicates
    PAGES = 1

    for page in range(1, PAGES + 1):
        url = f"{BASE_URL}?page={page}"
        print(f"Scraping {url}")

        r = requests.get(url, headers=headers)
        soup = BeautifulSoup(r.text, "html.parser")

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
                        "Page": page,
                        "url": link,
                        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    })

        time.sleep(2)

    return data

def update_gsheet(url, data, sheet_name="Sheet1"):
    """
    Update a Google Sheet with a list of dictionaries.
    data: List[Dict] -> [{"Page": 1, "url": "xxx", "date": "yyy"}, ...]
    """
    sh = gc.open_by_url(url)
    worksheet = sh.worksheet(sheet_name)
    
    # Clear existing content
    worksheet.clear()
    
    if not data:
        print("No data to write")
        return

    # Write header
    headers = list(data[0].keys())
    worksheet.append_row(headers)

    # Write rows
    rows = [[row[h] for h in headers] for row in data]
    worksheet.append_rows(rows, value_input_option='USER_ENTERED')

def lambda_handler(event, context):
    url = 'YOUR_GOOGLE_SHEET_URL'

    # Crawl listings (list of dicts)
    data = crawl_listings()

    # Update Google Sheet
    update_gsheet(url, data)

    print("Job completed:", len(data), "rows")

    return {
        "statusCode": 200,
        "body": "Success"
    }

if __name__ == '__main__':
    url = 'https://docs.google.com/spreadsheets/d/1DyEFdJKqox9LR1TYvLHcOJGDg7lQcoZaRXGA8LCg90Y/edit?gid=0#gid=0'

    df = crawl_listings()

    update_gsheet(url, df, sheet_name="Sheet1")

    # print(df.head())