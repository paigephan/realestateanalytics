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

# utils.py

def extract_suburb_district(address: str):
    """
    Extracts suburb and district from a NZ address and capitalizes each word.
    
    Parameters:
        address (str): Full property address, expected format "Street, Suburb, District"
        
    Returns:
        tuple: (suburb, district) - each word capitalized
    """
    if not address:
        return "", ""
    
    # Split by comma and strip whitespace
    parts = [p.strip() for p in address.split(",") if p.strip()]

    # Use negative indexing safely and capitalize each word
    suburb = parts[-2].title() if len(parts) >= 2 else ""
    district = parts[-1].title() if len(parts) >= 1 else ""
    
    return suburb, district