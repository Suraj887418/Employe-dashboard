import pandas as pd
import json
import os

def convert():
    csv_path = os.path.join(os.path.dirname(__file__), 'cleaned_hr_data.csv')
    json_path = os.path.join(os.path.dirname(__file__), 'hr-dashboard-app', 'data.json')
    
    os.makedirs(os.path.dirname(json_path), exist_ok=True)
    
    df = pd.read_csv(csv_path)
    
    # Pre-process bins for experience so the app doesn't have to do it
    bins = [0, 2, 5, 10, 20, 50]
    labels = ['0-2', '3-5', '6-10', '11-20', '20+']
    df['Experience_Group'] = pd.cut(df['Years_At_Company'], bins=bins, labels=labels, right=False)
    # Ensure they are strings
    df['Experience_Group'] = df['Experience_Group'].astype(str)
    
    # Keep only the columns we actually need for the dashboard to save space and parse time
    df = df[['Department', 'Gender', 'Attrition', 'Experience_Group', 'Job_Satisfaction']]
    
    # Convert to list of dicts
    records = df.to_dict(orient='records')
    
    with open(json_path, 'w') as f:
        json.dump(records, f)
        
    print(f"Exported {len(records)} raw records to {json_path}")

if __name__ == "__main__":
    convert()
