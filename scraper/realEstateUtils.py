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