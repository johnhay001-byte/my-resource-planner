import csv
import os

# --- CONFIGURATION ---
INPUT_FILE = 'Master_3000_Rows.csv' 
OUTPUT_FILE = 'GLOBAL_COST_RATES_ENRICHED_FINAL.csv'

PRICE_TO_COST_MULTIPLIER = 2.35 
HOURS_PER_DAY = 8.0 

# Exchange Rates to GBP (Base for Banding Calculations)
# We use these ONLY to determine the Band. The output rate remains in local currency.
EXCHANGE_RATES = {
    'GBP': 1.0,
    'USD': 0.79,
    'EUR': 0.86,
    'BRL': 0.14,
    'CNY': 0.11,
    'CAD': 0.59,
    'CHF': 0.90,
    'AUD': 0.52,
    'MXN': 0.04,
    'PLN': 0.20,
    'INR': 0.0095,
    # Fallback
    'DEFAULT': 1.0 
}

# Banding Logic (Hourly Rate Ranges in GBP)
BAND_RANGES = [
    (0, 65, 'J'),
    (65, 85, 'K'),
    (85, 105, 'L'),
    (105, 140, 'M'),
    (140, 200, 'N'),
    (200, 9999, 'O')
]

# Location Proxies
LOCATION_PROXIES = {
    'US-SEA': {'base': 'US-NYC', 'mult': 0.95}, 
    'US-AUS': {'base': 'US-NYC', 'mult': 0.85},
    'EU-ES':  {'base': 'UK-LON', 'mult': 0.75}, 
    'APAC-PH':{'base': 'APAC-IN', 'mult': 1.10},
}

def clean_currency(val):
    if not val: return 0.0
    # Remove symbols and handle standard formatting
    clean = str(val).replace('£', '').replace('$', '').replace('€', '').replace(',', '').strip()
    try:
        return float(clean)
    except:
        return 0.0

def get_band_from_rate(hourly_rate_gbp):
    for low, high, band in BAND_RANGES:
        if low < hourly_rate_gbp <= high:
            return band
    return 'Unknown'

def refine_data():
    print(f"--- Starting Data Refinement (v10 - Currency & Unit Aware) on {INPUT_FILE} ---")
    
    if not os.path.exists(INPUT_FILE):
        print(f"Error: Could not find {INPUT_FILE}")
        return

    rows = []
    headers = []
    
    # 1. READ DATA WITH SMART HEADER DETECTION
    try:
        with open(INPUT_FILE, mode='r', encoding='utf-8-sig', errors='replace') as f:
            reader = csv.reader(f)
            header_row_index = 0
            
            # Scan for the real header row
            for i, row in enumerate(reader):
                if row and "Role" in row and "Region" in row:
                    headers = row
                    header_row_index = i
                    print(f"Found valid headers on Line {i+1}: {headers}")
                    break
            
            if not headers:
                print("Error: Could not find a valid header row containing 'Role' and 'Region'.")
                return

            f.seek(0)
            for _ in range(header_row_index + 1):
                next(f)
            
            dict_reader = csv.DictReader(f, fieldnames=headers)
            
            for row in dict_reader:
                rows.append(row)
                
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    print(f"Loaded {len(rows)} data rows.")

    # 2. BUILD LOOKUP MAP
    rate_lookup = {}
    for r in rows:
        role = r.get('Role', '').strip()
        region = r.get('Region', '').strip()
        rate = clean_currency(r.get('Rate_low', 0))
        if rate > 0:
            key = f"{role}|{region}"
            rate_lookup[key] = rate

    # 3. DEFINE OUTPUT HEADERS
    new_headers = ['Estimated_Cost', 'Band', 'Anomaly_Flag']
    final_headers = list(headers)
    for h in new_headers:
        if h not in final_headers:
            final_headers.append(h)

    # 4. PROCESS ROWS
    enriched_rows = []
    count_proxies = 0
    
    for row in rows:
        new_row = row.copy()
        
        role = new_row.get('Role', '')
        region = new_row.get('Region', '')
        unit = new_row.get('Unit', 'Hour').strip().lower() 
        currency = new_row.get('Currency', 'GBP').strip().upper() # Get Currency
        rate_low = clean_currency(new_row.get('Rate_low', 0))
        
        notes = new_row.get('Notes', '')
        anomaly = ""

        # A. FILL GAPS WITH PROXIES
        if rate_low == 0 and region in LOCATION_PROXIES:
            proxy = LOCATION_PROXIES[region]
            base_region = proxy['base']
            base_key = f"{role}|{base_region}"
            
            if base_key in rate_lookup:
                base_rate = rate_lookup[base_key]
                new_rate = round(base_rate * proxy['mult'], 2)
                
                new_row['Rate_low'] = new_rate
                new_row['Rate_high'] = new_rate 
                rate_low = new_rate
                
                notes = f"{notes} | Proxy: {base_region} x {proxy['mult']}"
                count_proxies += 1
            else:
                 notes = f"{notes} | Missing Base: {base_region}"

        # B. CALCULATE COST
        if rate_low > 0:
            estimated_cost = round(rate_low / PRICE_TO_COST_MULTIPLIER, 2)
        else:
            estimated_cost = 0
        new_row['Estimated_Cost'] = estimated_cost

        # C. AUTO-BANDING (CURRENCY & UNIT AWARE)
        if rate_low > 0:
            # 1. Get Exchange Rate
            exchange_mult = EXCHANGE_RATES.get(currency, EXCHANGE_RATES['DEFAULT'])
            
            # 2. Convert to GBP
            rate_in_gbp = rate_low * exchange_mult
            
            # 3. Normalize to Hourly if Day rate
            rate_for_banding = rate_in_gbp
            if 'day' in unit:
                 rate_for_banding = rate_in_gbp / HOURS_PER_DAY
            
            new_row['Band'] = get_band_from_rate(rate_for_banding)
        else:
            new_row['Band'] = 'Unknown'

        # D. ANOMALY DETECTION
        if estimated_cost > rate_low and rate_low > 0:
            anomaly = "Cost > Price"
        
        new_row['Notes'] = notes.strip(' |')
        new_row['Anomaly_Flag'] = anomaly
        
        enriched_rows.append(new_row)

    # 5. WRITE OUTPUT
    try:
        with open(OUTPUT_FILE, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=final_headers)
            writer.writeheader()
            writer.writerows(enriched_rows)
        print(f"--- SUCCESS ---")
        print(f"Generated: {OUTPUT_FILE}")
        print(f"Total Rows: {len(enriched_rows)}")
        print(f"Filled {count_proxies} gaps using proxies.")
    except Exception as e:
        print(f"Error writing file: {e}")

if __name__ == "__main__":
    refine_data()