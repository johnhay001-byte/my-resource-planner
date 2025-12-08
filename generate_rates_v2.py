import csv
import os

# --- CONFIGURATION ---
# Make sure these match your filenames exactly!
TRUTH_FILE = 'Roles x Rates reconcilliation - _ADJUSTED FOR TRUTH.csv'
RAW_FILE = 'Roles x Rates reconcilliation - _RAW_CONTENT LAB.csv'
OUTPUT_FILE = 'GLOBAL_COST_RATES_FINAL.csv'

def clean_currency(val):
    """Helper to convert currency strings to floats."""
    if not val:
        return 0.0
    # Remove currency symbols, commas, and spaces
    clean_str = val.replace('£', '').replace('$', '').replace('€', '').replace(',', '').replace(' ', '').strip()
    try:
        return float(clean_str)
    except ValueError:
        return 0.0

def generate_rates():
    print(f"--- Starting Local Rate Generation ---")
    
    # 1. Check files
    if not os.path.exists(TRUTH_FILE) or not os.path.exists(RAW_FILE):
        print("Error: Input files not found in this directory.")
        print(f"Looking for: {TRUTH_FILE}")
        print(f"Looking for: {RAW_FILE}")
        return

    # 2. Build the 'Rate Archetype' Map
    # We map a GBP Rate -> The full row dictionary from the Raw file
    rate_profile_map = {}
    
    print(f"Reading raw file: {RAW_FILE}...")
    with open(RAW_FILE, mode='r', encoding='utf-8-sig', errors='replace') as f:
        # Skip first 3 rows of header junk
        for _ in range(3):
            next(f)
        
        reader = csv.DictReader(f)
        
        for row in reader:
            # column 'United Kingdom' contains the GBP rate
            if 'United Kingdom' in row:
                gbp_val = clean_currency(row['United Kingdom'])
                
                # Store the first profile we find for this rate
                if gbp_val > 0 and gbp_val not in rate_profile_map:
                    rate_profile_map[gbp_val] = row

    available_rates = sorted(rate_profile_map.keys())
    print(f"Found {len(available_rates)} unique GBP price points.")

    # 3. Define Regions
    # Target Region -> (Raw Column Name, Currency)
    regions = [
        ('UK-LON', 'United Kingdom', 'GBP'),
        ('EU-ES', 'Spain', 'EUR'),
        ('EU-FR', 'France', 'EUR'),
        ('EU-DE', 'Germany', 'EUR'),
        ('EU-IT', 'Italy', 'EUR'),
        ('LATAM-BR', 'Brazil', 'BRL'),
        ('APAC-CN', 'China_L', 'CNY'),
        ('NA-CA', 'Canada', 'CAD'),
        ('EU-CH', 'Switzerland HQ', 'CHF'),
        ('APAC-IN', 'India-USD', 'USD'),
        ('APAC-CN-USD', 'China-USD', 'USD'),
        ('LATAM-MX', 'Mexico-USD', 'USD'),
        ('EU-PL', 'Poland-USD', 'USD')
    ]

    # 4. Process Truth File & Generate Output
    final_rows = []
    print(f"Processing truth file: {TRUTH_FILE}...")
    
    with open(TRUTH_FILE, mode='r', encoding='utf-8-sig', errors='replace') as f:
        reader = csv.DictReader(f)
        count = 0
        
        for row in reader:
            count += 1
            role_name = row.get('Role', 'Unknown Role')
            category = row.get('Category | Function', 'Unknown Category')
            
            # Find the rate column
            target_rate = 0.0
            # Try different column headers you might have used
            for key in ['Rate_low', 'Rate', 'Unit Rate']:
                if key in row and row[key]:
                    target_rate = clean_currency(row[key])
                    break
            
            if target_rate == 0:
                print(f"Warning: No rate found for {role_name}")
                continue

            # Find Matching Profile
            match_row = None
            notes = ""
            
            if target_rate in rate_profile_map:
                match_row = rate_profile_map[target_rate]
                notes = "Exact Rate Match"
            else:
                # Find closest
                if not available_rates:
                    continue
                closest = min(available_rates, key=lambda x: abs(x - target_rate))
                match_row = rate_profile_map[closest]
                notes = f"Approximate Match: Target {target_rate} -> Used {closest}"

            # Create 13 rows for this role
            for region_code, raw_col, currency in regions:
                market_rate = 0.0
                if raw_col in match_row:
                    market_rate = clean_currency(match_row[raw_col])
                
                final_rows.append({
                    'Category | Function': category,
                    'Role': role_name,
                    'Resource type': 'FTE',
                    'Unit': 'Hour',
                    'Region': region_code,
                    'Rate_low': market_rate,
                    'Rate_high': market_rate,
                    'Currency': currency,
                    'Source': 'OP_Content Lab',
                    'Notes': notes
                })

    # 5. Write Output
    print(f"Writing {len(final_rows)} rows to {OUTPUT_FILE}...")
    
    fieldnames = ['Category | Function', 'Role', 'Resource type', 'Unit', 'Region', 'Rate_low', 'Rate_high', 'Currency', 'Source', 'Notes']
    
    with open(OUTPUT_FILE, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(final_rows)

    print("Done! File generated successfully.")

if __name__ == "__main__":
    generate_rates()