import csv
import os

# --- CONFIGURATION ---
# This input file should be the OUTPUT from the previous step (2002 rows)
# Double check which file you want to use as input. 
# If 'GLOBAL_COST_RATES_FINAL.csv' was the good 2000-row file, use that.
INPUT_FILE = 'GLOBAL_COST_RATES_FINAL.csv' 
OUTPUT_FILE = 'GLOBAL_COST_RATES_ENRICHED_V5.csv'

PRICE_TO_COST_MULTIPLIER = 2.35 

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
    print("--- Starting Data Refinement (v5) ---")
    
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

    # 2. PREPARE NEW HEADERS
    # We want to keep ALL existing headers + add new ones
    new_cols = ['Estimated_Cost', 'Band', 'Anomaly_Flag']
    for col in new_cols:
        if col not in fieldnames:
            fieldnames.append(col)
    
    # 3. BUILD LOOKUP MAP (Role|Region -> Rate) for Proxies
    rate_lookup = {}
    for r in rows:
        key = f"{r.get('Role', '')}|{r.get('Region', '')}"
        rate = clean_currency(r.get('Rate_low', 0))
        if rate > 0:
            rate_lookup[key] = rate

    # 4. PROCESS ROWS
    enriched_rows = []
    
    for row in rows:
        role = row.get('Role', '')
        region = row.get('Region', '')
        rate_low = clean_currency(row.get('Rate_low', 0))
        
        # Initialize new fields
        notes = row.get('Notes', '')
        anomaly = ""
        
        # A. FILL GAPS WITH PROXIES
        if rate_low == 0 and region in LOCATION_PROXIES:
            proxy = LOCATION_PROXIES[region]
            base_region = proxy['base']
            base_key = f"{role}|{base_region}"
            
            if base_key in rate_lookup:
                base_rate = rate_lookup[base_key]
                new_rate = round(base_rate * proxy['mult'], 2)
                
                row['Rate_low'] = new_rate
                row['Rate_high'] = new_rate # Assume single rate
                rate_low = new_rate
                
                notes = f"{notes} | Proxy: {base_region} x {proxy['mult']}"
            else:
                 notes = f"{notes} | Missing Base: {base_region}"

        # B. CALCULATE COST
        if rate_low > 0:
            row['Estimated_Cost'] = round(rate_low / PRICE_TO_COST_MULTIPLIER, 2)
        else:
            row['Estimated_Cost'] = 0

        # C. AUTO-BANDING
        if rate_low > 0:
            # Simple band logic based on value (ideally would convert currency first)
            row['Band'] = get_band_from_rate(rate_low)
        else:
            row['Band'] = 'Unknown'

        # D. ANOMALY DETECTION
        if row['Estimated_Cost'] > rate_low and rate_low > 0:
            anomaly = "Cost > Price"

        row['Notes'] = notes.strip(' |')
        row['Anomaly_Flag'] = anomaly
        
        enriched_rows.append(row)

    # 5. WRITE OUTPUT
    try:
        with open(OUTPUT_FILE, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(enriched_rows)
        print(f"--- SUCCESS ---")
        print(f"Generated: {OUTPUT_FILE}")
        print(f"Total Rows: {len(enriched_rows)}")
    except Exception as e:
        print(f"Error writing file: {e}")

if __name__ == "__main__":
    refine_data()