import pandas as pd
import os

def clean_hr_data(input_file='raw_hr_data.csv', output_file='cleaned_hr_data.csv'):
    print(f"Loading raw data from {input_file}...")
    try:
        df = pd.read_csv(input_file)
    except FileNotFoundError:
        print(f"Error: {input_file} not found. Please run generate_data.py first.")
        return
        
    print(f"Initial shape: {df.shape}")
    
    # 1. Remove Duplicates
    initial_rows = len(df)
    df.drop_duplicates(inplace=True)
    print(f"Removed {initial_rows - len(df)} duplicate rows.")
    
    # 2. Handle Missing Values
    # Impute missing Age with median
    df['Age'].fillna(df['Age'].median(), inplace=True)
    # Drop rows where Monthly_Income is missing (critical feature)
    df.dropna(subset=['Monthly_Income'], inplace=True)
    
    # 3. Standardize Text Formatting
    df['Gender'] = df['Gender'].str.strip().str.title()
    df['Gender'] = df['Gender'].replace({'M': 'Male', 'F': 'Female'})
    
    # 4. Handle Invalid Data (Negative Years)
    df['Years_At_Company'] = df['Years_At_Company'].abs()
    
    # Reset Index after dropping rows
    df.reset_index(drop=True, inplace=True)
    
    print(f"Final shape: {df.shape}")
    print(f"Data cleaning complete! Saved to {output_file}")
    
    df.to_csv(output_file, index=False)

if __name__ == "__main__":
    clean_hr_data()
