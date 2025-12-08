import csv
import os

# --- CONFIGURATION ---
INPUT_FILE = 'Master_ Concept_Creative Modelling - _REFINED.csv'
OUTPUT_FILE = 'GLOBAL_COST_RATES_ENRICHED_FINAL.csv'

# Multiplier: Price / 2.35 = Cost
PRICE_TO_COST_MULTIPLIER = 2.35 

# Location Proxies
# Logic: If Key is missing, try to find Value['base']. If found, New Rate = Base Rate * Value['mult']
LOCATION_PROXIES = {
    'US-SEA': {'base': 'US-NYC', 'mult': 0.95}, 
    'US-AUS': {'base': 'US-NYC', 'mult': 0.85},
    'EU-ES':  {'base': 'UK-LON', 'mult': 0.75}, 
    'APAC-PH':{'base': 'APAC-IN', 'mult': 1.10},
    # Add fail-safes: if NYC is missing, maybe SEA can look at LON?
    # 'US-NYC': {'base': 'UK-LON', 'mult': 1.15}, 
}

# Banding Logic (Hourly Rate Ranges in GBP - approx)
# Used to auto-tag roles if they don't have a band.
# You can adjust these thresholds.
BAND_RANGES = [
    (0, 65, 'J'),
    (65, 85, 'K'),
    (85, 105, 'L'),
    (105, 140, 'M'),
    (140, 200, 'N'),
    (200, 9999, 'O')
]

def clean_currency(val):
    if not val: return 0.0
    clean = str(val).replace('£', '').replace('$', '').replace('€', '').replace(',', '').strip()
    try:
        return float(clean)
    except:
        return 0.0

def get_band_from_rate(rate):
    for low, high, band in BAND_RANGES:
        if low < rate <= high:
            return band
    return 'Unknown'

def refine_data():
    print("--- Starting Data Refinement (v4) ---")
    
    if not os.path.exists(INPUT_FILE):
        print(f"Error: Could not find {INPUT_FILE}")
        return

    rows = []
    fieldnames = []

    # 1. READ DATA
    try:
        with open(INPUT_FILE, mode='r', encoding='utf-8-sig', errors='replace') as f:
            reader = csv.DictReader(f)
            fieldnames = reader.fieldnames
            for row in reader:
                rows.append(row)
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    print(f"Loaded {len(rows)} rows.")

    # 2. BUILD LOOKUP MAP (Role|Region -> Rate)
    # We need this to look up the "Base City" rates for our proxies
    rate_lookup = {}
    for r in rows:
        # Create a unique key for every Role + Region combo
        key = f"{r.get('Role', '')}|{r.get('Region', '')}"
        rate = clean_currency(r.get('Rate_low', 0))
        if rate > 0:
            rate_lookup[key] = rate

    # 3. PROCESS & ENRICH
    enriched_rows = []
    
    # Add new headers if they don't exist
    new_headers = ['Estimated_Cost', 'Band', 'Anomaly_Flag', 'Notes']
    for h in new_headers:
        if h not in fieldnames:
            fieldnames.append(h)

    count_proxies = 0
    
    for row in rows:
        role = row.get('Role', '')
        region = row.get('Region', '')
        rate_low = clean_currency(row.get('Rate_low', 0))
        
        notes = row.get('Notes', '')
        anomaly = ""
        band = row.get('Band', '') # If you already have a Band column

        # A. FILL GAPS WITH PROXIES
        if rate_low == 0 and region in LOCATION_PROXIES:
            proxy = LOCATION_PROXIES[region]
            base_region = proxy['base']
            base_key = f"{role}|{base_region}"
            
            # Check if we have a rate for the base region
            if base_key in rate_lookup:
                base_rate = rate_lookup[base_key]
                new_rate = round(base_rate * proxy['mult'], 2)
                
                row['Rate_low'] = new_rate
                row['Rate_high'] = new_rate
                rate_low = new_rate # Update local var
                
                notes = f"{notes} | Proxy: {base_region} x {proxy['mult']}"
                count_proxies += 1
            else:
                 notes = f"{notes} | Missing Base: {base_region}"

        # B. CALCULATE COST
        if rate_low > 0:
            estimated_cost = round(rate_low / PRICE_TO_COST_MULTIPLIER, 2)
        else:
            estimated_cost = 0
        
        row['Estimated_Cost'] = estimated_cost

        # C. AUTO-BANDING (If missing)
        if not band or band == 'Unknown':
            if rate_low > 0:
                row['Band'] = get_band_from_rate(rate_low)
            else:
                row['Band'] = 'Unknown'

        # D. ANOMALY DETECTION
        if estimated_cost > rate_low and rate_low > 0:
            anomaly = "Cost > Price"
        
        row['Notes'] = notes.strip(' |')
        row['Anomaly_Flag'] = anomaly
        
        enriched_rows.append(row)

    # 4. WRITE OUTPUT
    try:
        with open(OUTPUT_FILE, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(enriched_rows)
        print(f"--- SUCCESS ---")
        print(f"Generated: {OUTPUT_FILE}")
        print(f"Total Rows: {len(enriched_rows)}")
        print(f"Filled {count_proxies} missing rates using proxies.")
    except Exception as e:
        print(f"Error writing file: {e}")

if __name__ == "__main__":
    refine_data()