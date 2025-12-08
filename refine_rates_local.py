import csv
import os

# --- CONFIGURATION ---
INPUT_FILE = 'Master_ Concept_Creative Modelling - _REFINED.csv'
OUTPUT_FILE = 'GLOBAL_COST_RATES_ENRICHED.csv'

# Business Logic
PRICE_TO_COST_MULTIPLIER = 2.35

# Location Tiers & Proxies
# If a rate is missing for a region, we look for the 'base' region's rate 
# for that same role and apply the 'mult' (Multiplier).
LOCATION_PROXIES = {
    # Tier 1 (Premium) - No proxy needed usually, but good to link
    'US-LA':  {'base': 'UK-LON', 'mult': 1.15}, 
    'US-NYC': {'base': 'UK-LON', 'mult': 1.15},
    
    # Tier 2 (High)
    'US-SEA': {'base': 'UK-LON', 'mult': 1.05},
    
    # Tier 3 (Standard)
    'US-AUS': {'base': 'UK-LON', 'mult': 0.90},
    'EU-DE':  {'base': 'UK-LON', 'mult': 0.90},
    'EU-FR':  {'base': 'UK-LON', 'mult': 0.90},
    
    # Tier 4 (Mid-Value)
    'EU-ES':  {'base': 'UK-LON', 'mult': 0.70}, # Madrid proxy
    'EU-IT':  {'base': 'UK-LON', 'mult': 0.75},
    
    # Tier 5 (High Value / Offshore)
    'APAC-PH': {'base': 'UK-LON', 'mult': 0.25}, # Philippines proxy
    'APAC-IN': {'base': 'UK-LON', 'mult': 0.25},
    'LATAM-BR': {'base': 'UK-LON', 'mult': 0.40},
}

# Banding Logic (Hourly Rate Ranges in GBP) - Derived from your EG files
# We use this to auto-tag roles if they don't have a band.
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
    print("--- Starting Data Refinement (No Pandas) ---")
    
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

    # 2. CREATE LOOKUP FOR BASE RATES
    # Key: "Role" -> Value: Rate (float)
    # We use UK-LON as the "Gold Standard" to drive proxies
    base_rate_map = {}
    for r in rows:
        if r.get('Region') == 'UK-LON':
            rate = clean_currency(r.get('Rate_low'))
            if rate > 0:
                base_rate_map[r.get('Role')] = rate

    # 3. PROCESS ROWS
    enriched_rows = []
    
    # Add new headers if they don't exist
    for new_col in ['Estimated_Cost', 'Band', 'Anomaly_Flag']:
        if new_col not in fieldnames:
            fieldnames.append(new_col)

    for row in rows:
        role = row.get('Role', '')
        region = row.get('Region', '')
        # Handle cases where rate might be empty string
        rate_low = clean_currency(row.get('Rate_low', 0))
        
        notes = row.get('Notes', '')
        anomaly = ""

        # A. FILL GAPS WITH PROXIES
        # If rate is missing/zero, try to calculate it using the Location Index
        if rate_low == 0 and region in LOCATION_PROXIES:
            proxy_config = LOCATION_PROXIES[region]
            base_region = proxy_config['base']
            
            # Look up the UK rate for this specific role
            if role in base_rate_map:
                base_rate = base_rate_map[role]
                new_rate = round(base_rate * proxy_config['mult'], 2)
                
                # Update the row data
                row['Rate_low'] = new_rate
                row['Rate_high'] = new_rate
                rate_low = new_rate # Update local var for next steps
                
                notes = f"{notes} | Auto-Proxy: Derived from {base_region} (x{proxy_config['mult']})"
            else:
                anomaly = "Missing Base Rate"

        # B. CALCULATE COST
        if rate_low > 0:
            estimated_cost = round(rate_low / PRICE_TO_COST_MULTIPLIER, 2)
        else:
            estimated_cost = 0
        row['Estimated_Cost'] = estimated_cost

        # C. AUTO-BANDING
        # If we have a rate, we can guess the band
        if rate_low > 0:
            # We map back to GBP roughly for banding if the rate is in another currency
            # This is a simplification; ideally we convert currency first. 
            # For now, we assume the rate_low is directionally correct for banding logic
            # or rely on the UK-LON rows to set the band "truth" if we grouped them.
            # Simple approach: Band based on value
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
        print("Columns added: Estimated_Cost, Band, Anomaly_Flag")
    except Exception as e:
        print(f"Error writing file: {e}")

if __name__ == "__main__":
    refine_data()