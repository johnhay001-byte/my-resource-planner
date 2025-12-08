import pandas as pd
import numpy as np

def refine_global_rates():
    print("--- Starting Data Refinement ---")

    # 1. FILE CONFIGURATION
    # Ensure these match your actual filenames
    master_file = 'Master_ Concept_Creative Modelling - _REFINED.csv'
    bands_file = 'EG bands b - _grade resource.csv'
    output_file = 'GLOBAL_COST_RATES_ENRICHED.csv'

    # Multiplier to derive 'Cost' from 'Price' (Rate Card)
    PRICE_TO_COST_MULTIPLIER = 2.35 

    # 2. LOAD DATA
    try:
        print("Loading Master file...")
        df_master = pd.read_csv(master_file)
        # Clean currency columns immediately
        for col in ['Rate_low', 'Rate_high']:
            df_master[col] = df_master[col].replace('[\$,]', '', regex=True).replace('', np.nan).astype(float)
    except FileNotFoundError:
        print(f"Error: Could not find {master_file}")
        return

    # 3. DEFINE LOCATION INDICES (The "Tier" Logic)
    # Ideally, we would parse this from 'EG bands b', but hardcoding the index 
    # derived from that file is safer and more transparent for now.
    # BASE = UK-LON (1.0)
    location_index = {
        'UK-LON': 1.0,      # Base
        'EU-ES': 0.75,      # Est. from bands (Madrid vs London)
        'EU-FR': 0.95,      # Paris is close to London
        'EU-DE': 0.95,      # Berlin/Munich
        'EU-IT': 0.80,      # Milan
        'LATAM-BR': 0.45,   # Brazil
        'APAC-CN': 0.60,    # China
        'NA-CA': 0.90,      # Toronto/Vancouver
        'EU-CH': 1.25,      # Zurich (Usually higher)
        'APAC-IN': 0.30,    # India
        'US-NYC': 1.20,     # New York (Premium)
        'US-SEA': 1.05,     # Seattle (High)
        'US-AUS': 0.90      # Austin (Standard)
    }

    print("Refining rates and filling gaps...")

    # 4. PROCESS ROWS
    # We iterate and fill gaps based on the UK-LON anchor rate for that role
    
    # First, create a lookup for the Base Rate (UK-LON) for each role
    # Key: Role Name, Value: Base Rate (Average of low/high)
    base_rates = {}
    uk_rows = df_master[df_master['Region'] == 'UK-LON']
    for _, row in uk_rows.iterrows():
        if pd.notna(row['Rate_low']):
            avg_rate = (row['Rate_low'] + row['Rate_high']) / 2
            base_rates[row['Role']] = avg_rate

    refined_rows = []

    for index, row in df_master.iterrows():
        role = row['Role']
        region = row['Region']
        rate_low = row['Rate_low']
        
        # A. FILL GAPS (Proxy Logic)
        notes = row.get('Notes', '')
        if pd.isna(rate_low) or rate_low == 0:
            # If rate is missing, try to derive it from the UK base rate
            if role in base_rates and region in location_index:
                base_rate = base_rates[role]
                multiplier = location_index[region]
                proxy_rate = round(base_rate * multiplier, 2)
                
                row['Rate_low'] = proxy_rate
                row['Rate_high'] = proxy_rate
                notes = f"{str(notes)} | Proxy: UK Rate * {multiplier}"
            else:
                notes = f"{str(notes)} | MISSING: No base rate or index found"

        # B. CALCULATE COST (Profitability Logic)
        # Cost = Rate Card Price / Multiplier
        # We handle cases where data might still be missing
        if pd.notna(row['Rate_low']) and row['Rate_low'] > 0:
            estimated_cost = round(row['Rate_low'] / PRICE_TO_COST_MULTIPLIER, 2)
            row['Estimated_Cost'] = estimated_cost
        else:
            row['Estimated_Cost'] = 0

        row['Notes'] = str(notes).strip(' |')
        refined_rows.append(row)

    # 5. CREATE FINAL DATAFRAME
    df_final = pd.DataFrame(refined_rows)
    
    # 6. ANOMALY CHECK
    # Flag rows where Cost is somehow higher than Price (Data error)
    anomalies = df_final[df_final['Estimated_Cost'] > df_final['Rate_low']]
    if not anomalies.empty:
        print(f"WARNING: Found {len(anomalies)} rows where Cost > Price. Check 'Notes' column.")
    
    # 7. SAVE
    df_final.to_csv(output_file, index=False)
    print(f"--- SUCCESS ---")
    print(f"Enriched file saved as: {output_file}")
    print(f"Total Rows: {len(df_final)}")
    print("Includes new column: 'Estimated_Cost'")

if __name__ == "__main__":
    refine_global_rates()