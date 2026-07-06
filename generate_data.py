import pandas as pd
import numpy as np
import random
import os

# Set seed for reproducibility
np.random.seed(42)
random.seed(42)

def generate_hr_data(num_records=1000):
    print("Generating synthetic HR data...")
    
    employee_ids = [f"EMP{str(i).zfill(4)}" for i in range(1, num_records + 1)]
    ages = np.random.normal(35, 10, num_records).astype(int)
    ages = np.clip(ages, 18, 65).astype(float)
    
    genders = np.random.choice(['Male', 'Female'], num_records, p=[0.55, 0.45])
    departments = np.random.choice(['Sales', 'Research & Development', 'Human Resources', 'IT'], num_records)
    
    job_roles = []
    for dept in departments:
        if dept == 'Sales':
            job_roles.append(np.random.choice(['Sales Executive', 'Sales Representative', 'Manager']))
        elif dept == 'Research & Development':
            job_roles.append(np.random.choice(['Research Scientist', 'Laboratory Technician', 'Manufacturing Director', 'Healthcare Representative']))
        elif dept == 'Human Resources':
            job_roles.append(np.random.choice(['HR Manager', 'HR Representative']))
        else:
            job_roles.append(np.random.choice(['Software Engineer', 'IT Support', 'Data Analyst']))
            
    years_at_company = np.random.poisson(5, num_records)
    total_working_years = years_at_company + np.random.poisson(4, num_records)
    
    monthly_income = []
    for role in job_roles:
        if 'Manager' in role or 'Director' in role:
            monthly_income.append(np.random.normal(15000, 3000))
        elif 'Engineer' in role or 'Scientist' in role or 'Analyst' in role:
            monthly_income.append(np.random.normal(8000, 2000))
        else:
            monthly_income.append(np.random.normal(4000, 1000))
            
    monthly_income = np.array(monthly_income).astype(float)
            
    job_satisfaction = np.random.choice([1, 2, 3, 4], num_records, p=[0.2, 0.2, 0.3, 0.3])
    performance_rating = np.random.choice([1, 2, 3, 4], num_records, p=[0.05, 0.15, 0.6, 0.2])
    
    # Calculate Attrition probability (simplified logic)
    attrition_prob = np.zeros(num_records)
    attrition_prob += np.where(job_satisfaction <= 2, 0.3, 0)
    attrition_prob += np.where(monthly_income < 5000, 0.2, 0)
    attrition_prob += np.where(years_at_company < 2, 0.1, 0)
    attrition_prob = np.clip(attrition_prob, 0.05, 0.95)
    
    attrition = [np.random.choice(['Yes', 'No'], p=[p, 1-p]) for p in attrition_prob]

    df = pd.DataFrame({
        'Employee_ID': employee_ids,
        'Age': ages,
        'Gender': genders,
        'Department': departments,
        'Job_Role': job_roles,
        'Years_At_Company': years_at_company,
        'Total_Working_Years': total_working_years,
        'Monthly_Income': monthly_income,
        'Job_Satisfaction': job_satisfaction,
        'Performance_Rating': performance_rating,
        'Attrition': attrition
    })
    
    # --- INJECTING ~20% DATA INCONSISTENCIES ---
    print("Injecting data inconsistencies (missing values, typos, duplicates)...")
    num_inconsistencies = int(num_records * 0.2)
    
    # 1. Missing Values (NaN)
    missing_indices = random.sample(range(num_records), num_inconsistencies // 3)
    df.loc[missing_indices, 'Age'] = np.nan
    
    missing_indices2 = random.sample(range(num_records), num_inconsistencies // 3)
    df.loc[missing_indices2, 'Monthly_Income'] = np.nan

    # 2. Inconsistent Text (Typos / Different Formats)
    gender_typos = random.sample(range(num_records), num_inconsistencies // 3)
    for i in gender_typos:
        if df.loc[i, 'Gender'] == 'Male':
            df.loc[i, 'Gender'] = random.choice(['M', 'male', ' M'])
        else:
            df.loc[i, 'Gender'] = random.choice(['F', 'female', 'F '])
            
    # 3. Negative / Impossible values
    negative_indices = random.sample(range(num_records), num_inconsistencies // 4)
    df.loc[negative_indices, 'Years_At_Company'] = -1 * df.loc[negative_indices, 'Years_At_Company']

    # 4. Duplicates
    duplicates = df.sample(n=num_inconsistencies // 4)
    df = pd.concat([df, duplicates], ignore_index=True)
    
    # Shuffle dataframe
    df = df.sample(frac=1).reset_index(drop=True)
    
    # Save the file
    output_path = os.path.join(os.path.dirname(__file__), 'raw_hr_data.csv')
    df.to_csv(output_path, index=False)
    print(f"Dataset generated successfully! Shape: {df.shape}")
    print(f"Saved to '{output_path}'")

if __name__ == "__main__":
    generate_hr_data()
