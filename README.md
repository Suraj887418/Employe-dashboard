# Employee Attrition Analytics Dashboard

This project demonstrates an end-to-end data pipeline from raw data generation to data cleaning in Python (Pandas), and finally visualization in Power BI. It is designed to match the resume points for a Data Analyst or BI Developer.

## Step 1: Generate & Clean the Data (Python & Pandas)

> [!IMPORTANT]
> You must have Python installed on your computer to run these scripts. If you don't have it, download it from [python.org](https://www.python.org/downloads/). Ensure you check "Add Python to PATH" during installation.

1. Open a terminal or command prompt in this folder.
2. Install required libraries:
   ```bash
   pip install pandas numpy
   ```
3. Generate the raw data (this creates `raw_hr_data.csv` with intentional inconsistencies):
   ```bash
   python generate_data.py
   ```
4. Clean the data using Pandas (this creates `cleaned_hr_data.csv`):
   ```bash
   python clean_data.py
   ```

## Step 2: Build the Power BI Dashboard

Once you have `cleaned_hr_data.csv`, you can build your interactive dashboard.

### 1. Import Data
* Open Power BI Desktop.
* Click **Get Data** -> **Text/CSV**.
* Select `cleaned_hr_data.csv` and click **Load**.

### 2. Create Dynamic KPIs (DAX Measures)
Go to the **Modeling** tab and click **New Measure** for each of these:

* **Total Employees:** 
  ```dax
  Total Employees = COUNT(cleaned_hr_data[Employee_ID])
  ```
* **Attrition Count:** 
  ```dax
  Attrition Count = CALCULATE(COUNT(cleaned_hr_data[Employee_ID]), cleaned_hr_data[Attrition] = "Yes")
  ```
* **Attrition Rate:** 
  ```dax
  Attrition Rate = DIVIDE([Attrition Count], [Total Employees], 0)
  ```
*Format this measure as a Percentage (%) in the top menu.*

**Visual:** Add a "Card" visual for each of these measures and place them at the top of your dashboard.

### 3. Visual 1: Attrition Rate by Experience Level (Bar Chart)
To fulfill the resume point *"Analyzed data patterns across experience levels"*:
* Visual Type: **Clustered Column Chart**
* X-axis: `Total_Working_Years` (You may want to create 'bins' or groups for this, e.g., 0-5, 6-10, 11+ years).
* Y-axis: `Attrition Rate`

### 4. Visual 2: Heatmap of Job Satisfaction vs Attrition
To fulfill the resume point *"interactive Power BI dashboard with dynamic KPIs and heatmaps"*:
* Visual Type: **Matrix**
* Rows: `Department` or `Job_Role`
* Columns: `Job_Satisfaction`
* Values: `Attrition Count`
* **Heatmap Effect:** Go to the Format pane for the Matrix -> Cell Elements -> Turn on **Background color** for the Attrition Count values. Choose a color scale (e.g., White to Red).

### 5. Add Interactivity (Slicers)
* Add a **Slicer** for `Department`.
* Add a **Slicer** for `Gender`.
* Add a **Slicer** for `Age` (as a slider).

Now, when you click on different departments or adjust the age, your KPIs and Heatmaps will dynamically update!

## Final Polish
* Add a text box at the top with the title: **HR Analytics: Employee Attrition Dashboard**.
* Use a consistent, professional color theme (e.g., the "Executive" theme in the View tab).
